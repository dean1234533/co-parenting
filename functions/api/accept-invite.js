/**
 * Cloudflare Pages Function — POST /api/accept-invite
 *
 * Links two co-parent accounts. This runs server-side (with a service
 * account) rather than as direct client Firestore writes, because the
 * client can't be trusted to prove "this invite was genuinely created by
 * and accepted by these two specific users" — that requires reading and
 * validating the invite server-side before granting shared data access.
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
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'RS256', typ: 'JWT' });
  const payload = b64url({
    iss: saEmail,
    // cloud-platform for Firestore admin access, firebase.messaging so the
    // same token can also push the "accounts linked" notification below.
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase.messaging',
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

  const jwt = `${signingInput}.${sigB64}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!tokenRes.ok) throw new Error(`Admin token error: ${await tokenRes.text()}`);
  const { access_token } = await tokenRes.json();
  return access_token;
}

const fsField = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'number') return { integerValue: v };
  return { stringValue: String(v) };
};

const fsFields = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fsField(v)]));

async function fsGet(fsBase, adminToken, path) {
  const res = await fetch(`${fsBase}/${path}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  if (!res.ok) return null;
  const doc = await res.json();
  if (!doc.fields) return null;
  const out = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    out[k] = v.stringValue ?? v.integerValue ?? (v.nullValue === null ? null : Object.values(v)[0]);
  }
  return out;
}

// PATCH with an explicit updateMask merges only the given fields — without
// it Firestore's REST API replaces the *entire* document, wiping anything
// not listed (e.g. would erase displayName/email off a user profile).
async function fsSet(fsBase, adminToken, path, fields) {
  const mask = Object.keys(fields).map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const res = await fetch(`${fsBase}/${path}?${mask}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsFields(fields) }),
  });
  if (!res.ok) throw new Error(`Firestore write failed: ${await res.text()}`);
}

// Best-effort push to the inviter confirming the link — failure here must
// never fail the linking request itself, since the accounts are already
// linked by the time this runs.
async function notifyLinked(fsBase, adminToken, projectId, inviterUid, acceptorName) {
  try {
    const tokenDoc = await fsGet(fsBase, adminToken, `fcmTokens/${inviterUid}`);
    const fcmToken = tokenDoc?.token;
    if (!fcmToken) return;

    await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: 'Accounts linked!',
            body: `${acceptorName || 'Your co-parent'} accepted your invite — you're now linked on Js-Grw-Up.`,
          },
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default', badge: 1 } } },
          webpush: {
            notification: { icon: '/icons/icon.svg', badge: '/icons/icon.svg' },
            fcm_options: { link: '/' },
          },
        },
      }),
    });
  } catch {
    // Non-fatal — linking already succeeded.
  }
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

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  if (origin !== ALLOWED_ORIGIN) return jsonRes({ error: 'Forbidden' }, 403, origin);

  const API_KEY    = env.VITE_FIREBASE_API_KEY;
  const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
  const SA_EMAIL   = env.FIREBASE_SA_EMAIL;
  const SA_KEY     = env.FIREBASE_SA_PRIVATE_KEY;
  if (!API_KEY || !PROJECT_ID || !SA_EMAIL || !SA_KEY) {
    return jsonRes({ error: 'Server misconfiguration: missing Firebase env vars' }, 500, origin);
  }

  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return jsonRes({ error: 'Unauthorized' }, 401, origin);
  const idToken = authHeader.slice(7);

  const body = await request.json().catch(() => ({}));
  const token = (body.token || '').trim();
  if (!token) return jsonRes({ error: 'Missing invite token' }, 400, origin);

  // Verify the caller's Firebase ID token
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  );
  if (!lookupRes.ok) return jsonRes({ error: 'Token verification failed' }, 401, origin);
  const { users } = await lookupRes.json();
  const uid = users?.[0]?.localId;
  if (!uid) return jsonRes({ error: 'User not found' }, 401, origin);

  const adminToken = await getAdminToken(SA_EMAIL, SA_KEY);
  const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  const invite = await fsGet(fsBase, adminToken, `invites/${token}`);
  if (!invite) return jsonRes({ error: 'Invite not found or has expired. Ask your co-parent to send a new invite link.' }, 404, origin);
  if (invite.status !== 'pending') return jsonRes({ error: 'This invite has already been used.' }, 409, origin);
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return jsonRes({ error: 'This invite has expired. Ask your co-parent to send a new invite link.' }, 409, origin);
  }
  if (invite.createdBy === uid) return jsonRes({ error: 'You cannot accept your own invite.' }, 400, origin);

  const myProfile = await fsGet(fsBase, adminToken, `users/${uid}`);
  if (!myProfile) return jsonRes({ error: 'Your profile is not set up yet. Please try again in a moment.' }, 409, origin);

  const alreadyLinked = myProfile.partnerId && myProfile.partnerId !== invite.createdBy;
  if (alreadyLinked) return jsonRes({ error: 'You are already linked with a different co-parent.' }, 409, origin);

  const inviterUid = invite.createdBy;
  const familyId = `family_${inviterUid}`;

  await fsSet(fsBase, adminToken, `families/${familyId}`, {
    member1Id: inviterUid,
    member1Name: invite.createdByName,
    member2Id: uid,
    member2Name: myProfile.displayName,
    createdAt: new Date().toISOString(),
  });

  await fsSet(fsBase, adminToken, `users/${uid}`, {
    familyId, partnerId: inviterUid, partnerName: invite.createdByName,
  });
  await fsSet(fsBase, adminToken, `users/${inviterUid}`, {
    familyId, partnerId: uid, partnerName: myProfile.displayName,
  });

  await fsSet(fsBase, adminToken, `invites/${token}`, {
    ...invite, status: 'accepted', acceptedBy: uid, acceptedAt: new Date().toISOString(),
  });

  await notifyLinked(fsBase, adminToken, PROJECT_ID, inviterUid, myProfile.displayName);

  return jsonRes({ success: true, familyId }, 200, origin);
}
