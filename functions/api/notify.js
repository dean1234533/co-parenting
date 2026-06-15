/**
 * Cloudflare Pages Function — POST /api/notify
 *
 * Uses FCM HTTP v1 API with a service account JWT signed via Web Crypto.
 * No firebase-admin or Node.js required — runs natively on Cloudflare Workers.
 *
 * Required Cloudflare Pages environment variables (set in the dashboard):
 *   VITE_FIREBASE_API_KEY       — Firebase web API key
 *   VITE_FIREBASE_PROJECT_ID    — Firebase project ID
 *   FIREBASE_SA_EMAIL           — Service account email
 *                                 e.g. firebase-adminsdk-fbsvc@your-project.iam.gserviceaccount.com
 *   FIREBASE_SA_PRIVATE_KEY     — Private key from the service account JSON file
 *                                 Paste the full -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----
 */

// Base64url encode (no padding, URL-safe)
const b64url = (input) => {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Generate a short-lived Google OAuth2 access token using a service account JWT
async function getGoogleAccessToken(saEmail, privateKeyPem, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'RS256', typ: 'JWT' });
  const payload = b64url({
    iss: saEmail,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const signingInput = `${header}.${payload}`;

  // Strip PEM wrapper and decode to raw bytes
  const pem = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '\n')   // handle escaped newlines stored in env vars
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
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

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`OAuth token error: ${err}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

const jsonRes = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
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

  if (!API_KEY || !PROJECT_ID || !SA_EMAIL || !SA_KEY) {
    return jsonRes({ error: 'Server misconfiguration — missing env vars' }, 500);
  }

  // Validate Authorization header
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return jsonRes({ error: 'Unauthorized' }, 401);
  }
  const idToken = authHeader.slice(7);

  // Read body before any awaits (body stream can only be consumed once)
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ error: 'Invalid request body' }, 400);
  }
  const { title = 'CoParent', body: msgBody = '', data = {} } = body;

  // Verify Firebase ID token via accounts:lookup REST endpoint
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!lookupRes.ok) return jsonRes({ error: 'Token verification failed' }, 401);

  const { users } = await lookupRes.json();
  const senderUid = users?.[0]?.localId;
  if (!senderUid) return jsonRes({ error: 'User not found' }, 401);

  // Fetch sender's Firestore profile (with their ID token — rules allow self-read)
  const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  const userRes = await fetch(`${fsBase}/users/${senderUid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!userRes.ok) return jsonRes({ skipped: 'Sender profile not found' });

  const partnerUid = (await userRes.json()).fields?.partnerId?.stringValue;
  if (!partnerUid) return jsonRes({ skipped: 'No partner linked' });

  // Fetch partner's FCM token (rules allow linked partners to read this)
  const tokenRes = await fetch(`${fsBase}/fcmTokens/${partnerUid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!tokenRes.ok) return jsonRes({ skipped: 'Partner has no FCM token' });

  const fcmToken = (await tokenRes.json()).fields?.token?.stringValue;
  if (!fcmToken) return jsonRes({ skipped: 'FCM token empty' });

  // Get a short-lived OAuth2 access token from the service account
  let accessToken;
  try {
    accessToken = await getGoogleAccessToken(
      SA_EMAIL,
      SA_KEY,
      'https://www.googleapis.com/auth/firebase.messaging'
    );
  } catch (err) {
    return jsonRes({ error: `Auth error: ${err.message}` }, 500);
  }

  // Send via FCM HTTP v1 API
  const fcmRes = await fetch(
    `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title,
            body: msgBody,
          },
          data,
          android: { priority: 'high' },
          apns: {
            payload: { aps: { sound: 'default', badge: 1 } },
          },
          webpush: {
            notification: {
              icon: '/icons/icon.svg',
              badge: '/icons/icon.svg',
            },
            fcm_options: { link: '/' },
          },
        },
      }),
    }
  );

  if (!fcmRes.ok) {
    const err = await fcmRes.text();
    return jsonRes({ error: `FCM v1 error: ${err}` }, 500);
  }

  return jsonRes({ success: true });
}
