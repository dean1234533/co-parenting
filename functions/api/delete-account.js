/**
 * Cloudflare Pages Function — POST /api/delete-account
 *
 * Deletes the Firebase Auth user + ALL their Firestore data using a service account.
 *
 * Required env vars:
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID,
 *   FIREBASE_SA_EMAIL, FIREBASE_SA_PRIVATE_KEY
 */

const b64url = (input) => {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

async function getAdminToken(saEmail, privateKeyPem) {
  const now     = Math.floor(Date.now() / 1000);
  const header  = b64url({ alg: 'RS256', typ: 'JWT' });
  const payload = b64url({
    iss: saEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const signingInput = `${header}.${payload}`;

  const pem = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '\n')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt      = `${signingInput}.${sigB64}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!tokenRes.ok) throw new Error(`Admin token error: ${await tokenRes.text()}`);
  const { access_token } = await tokenRes.json();
  return access_token;
}

// Query a collection for docs matching familyId and delete them all
async function deleteByFamilyId(fsBase, adminToken, collectionId, familyId) {
  const res = await fetch(`${fsBase}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'familyId' },
            op: 'EQUAL',
            value: { stringValue: familyId },
          },
        },
        limit: 500,
      },
    }),
  });

  const results = await res.json();
  if (!Array.isArray(results)) return;

  await Promise.all(
    results
      .filter((r) => r.document?.name)
      .map((r) =>
        fetch(`https://firestore.googleapis.com/v1/${r.document.name}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      )
  );
}

// Delete all invites created by this user
async function deleteUserInvites(fsBase, adminToken, uid) {
  const res = await fetch(`${fsBase}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'invites' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'createdBy' },
            op: 'EQUAL',
            value: { stringValue: uid },
          },
        },
        limit: 100,
      },
    }),
  });

  const results = await res.json();
  if (!Array.isArray(results)) return;

  await Promise.all(
    results
      .filter((r) => r.document?.name)
      .map((r) =>
        fetch(`https://firestore.googleapis.com/v1/${r.document.name}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      )
  );
}

const ALLOWED_ORIGIN = 'https://js-grw-up.com';

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

const jsonRes = (data, status = 200, origin = '') =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  if (origin !== ALLOWED_ORIGIN) return jsonRes({ error: 'Forbidden' }, 403, origin);

  const API_KEY    = env.VITE_FIREBASE_API_KEY;
  const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
  const SA_EMAIL   = env.FIREBASE_SA_EMAIL;
  const SA_KEY     = env.FIREBASE_SA_PRIVATE_KEY;

  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return jsonRes({ error: 'Unauthorized' }, 401, origin);
  const idToken = authHeader.slice(7);

  if (!API_KEY || !PROJECT_ID) {
    return jsonRes({ error: 'Server misconfiguration: missing Firebase env vars' }, 500, origin);
  }

  // Verify the caller's Firebase ID token
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  );
  if (!lookupRes.ok) return jsonRes({ error: 'Token verification failed' }, 401, origin);

  const { users } = await lookupRes.json();
  const uid = users?.[0]?.localId;
  if (!uid) return jsonRes({ error: 'User not found' }, 401, origin);

  const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  // Get admin token for server-side Firestore operations
  if (!SA_EMAIL || !SA_KEY) {
    // No service account — just delete what the user owns
    await fetch(`${fsBase}/users/${uid}`,     { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
    await fetch(`${fsBase}/fcmTokens/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
    await fetch(`${fsBase}/pendingLinks/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
    return jsonRes({ success: true, authDeleted: false, note: 'Profile deleted; family data not deleted (no service account)' }, 200, origin);
  }

  let adminToken;
  try {
    adminToken = await getAdminToken(SA_EMAIL, SA_KEY);
  } catch (err) {
    return jsonRes({ error: `Admin token error: ${err.message}` }, 500, origin);
  }

  // Read user profile to get familyId before deleting it
  const profileRes = await fetch(`${fsBase}/users/${uid}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const profileData = profileRes.ok ? await profileRes.json() : null;
  const familyId = profileData?.fields?.familyId?.stringValue;

  // Delete all family data across every collection
  const FAMILY_COLLECTIONS = [
    'chatMessages',
    'calendarEvents',
    'requests',
    'incidentReports',
    'expenses',
    'dailyLogs',
    'progressEntries',
    'coParentingRules',
  ];

  const cleanupTasks = [];

  if (familyId) {
    for (const col of FAMILY_COLLECTIONS) {
      cleanupTasks.push(deleteByFamilyId(fsBase, adminToken, col, familyId));
    }
    // Delete the family document itself
    cleanupTasks.push(
      fetch(`${fsBase}/families/${familyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
  }

  // Delete invites created by this user
  cleanupTasks.push(deleteUserInvites(fsBase, adminToken, uid));

  // Delete user-owned docs
  cleanupTasks.push(fetch(`${fsBase}/users/${uid}`,        { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }));
  cleanupTasks.push(fetch(`${fsBase}/fcmTokens/${uid}`,    { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }));
  cleanupTasks.push(fetch(`${fsBase}/pendingLinks/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }));

  await Promise.all(cleanupTasks);

  // Delete the Firebase Auth account last
  const deleteRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchDelete`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ localIds: [uid], force: true }),
    }
  );

  const deleteBody = await deleteRes.json().catch(() => ({}));
  if (!deleteRes.ok || (deleteBody.errors && deleteBody.errors.length > 0)) {
    return jsonRes({
      success: true,
      authDeleted: false,
      note: `Data deleted; Auth delete error: ${JSON.stringify(deleteBody.errors || deleteBody)}`,
    }, 200, origin);
  }

  return jsonRes({ success: true, authDeleted: true }, 200, origin);
}
