/**
 * Cloudflare Pages Function — POST /api/delete-account
 *
 * Deletes a Firebase Auth user + their Firestore documents using a service
 * account, bypassing the client-side "requires-recent-login" restriction.
 *
 * Required env vars (same set as /api/notify):
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
    // Both scopes needed — cloud-platform covers Identity Toolkit admin ops
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

const jsonRes = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const API_KEY    = env.VITE_FIREBASE_API_KEY;
  const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
  const SA_EMAIL   = env.FIREBASE_SA_EMAIL;
  const SA_KEY     = env.FIREBASE_SA_PRIVATE_KEY;

  // Verify the caller's Firebase ID token
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return jsonRes({ error: 'Unauthorized' }, 401);
  const idToken = authHeader.slice(7);

  if (!API_KEY || !PROJECT_ID) {
    return jsonRes({ error: 'Server misconfiguration: missing Firebase env vars' }, 500);
  }

  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  );
  if (!lookupRes.ok) return jsonRes({ error: 'Token verification failed' }, 401);

  const { users } = await lookupRes.json();
  const uid = users?.[0]?.localId;
  if (!uid) return jsonRes({ error: 'User not found' }, 401);

  const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  // Delete the user's own Firestore documents (user's own token is enough — they own these)
  await fetch(`${fsBase}/users/${uid}`,     { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
  await fetch(`${fsBase}/fcmTokens/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });

  // If service account credentials are present, delete the Firebase Auth record too
  if (SA_EMAIL && SA_KEY) {
    let adminToken;
    try {
      adminToken = await getAdminToken(SA_EMAIL, SA_KEY);
    } catch (err) {
      // Log but don't fail — Firestore data is already gone
      console.error('Admin token error:', err.message);
      return jsonRes({ success: true, authDeleted: false, note: 'Firestore deleted; Auth user not removed (admin token failed)' });
    }

    // batchDelete is the admin endpoint — no recent-login restriction
    const deleteRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchDelete`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ localIds: [uid], force: true }),
      }
    );

    const deleteBody = await deleteRes.json().catch(() => ({}));

    // batchDelete returns 200 with {errors:[...], successCount:N}
    // Check for errors in the response body even when status is 200
    if (!deleteRes.ok || (deleteBody.errors && deleteBody.errors.length > 0)) {
      console.error('batchDelete error:', JSON.stringify(deleteBody));
      // Firestore is already deleted — return partial success so client can sign out
      return jsonRes({
        success: true,
        authDeleted: false,
        note: `Firestore deleted; Auth delete error: ${JSON.stringify(deleteBody.errors || deleteBody)}`,
      });
    }
  }

  return jsonRes({ success: true, authDeleted: !!SA_EMAIL });
}
