/**
 * Cloudflare Pages Function — POST /api/notify
 *
 * Receives a Firebase ID token from the client, verifies it via the
 * Firebase Auth REST API, looks up the partner's FCM token from Firestore,
 * and sends a personalised push notification via FCM Legacy HTTP API.
 *
 * Required Cloudflare Pages environment variables (set in the dashboard):
 *   VITE_FIREBASE_API_KEY       — Firebase web API key
 *   VITE_FIREBASE_PROJECT_ID    — Firebase project ID
 *   FCM_SERVER_KEY              — Firebase Cloud Messaging legacy server key
 *                                 (Firebase Console → Project Settings → Cloud Messaging → Server key)
 */

const json = (data, status = 200) =>
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

  const API_KEY = env.VITE_FIREBASE_API_KEY;
  const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
  const FCM_KEY = env.FCM_SERVER_KEY;

  if (!API_KEY || !PROJECT_ID || !FCM_KEY) {
    return json({ error: 'Server misconfiguration' }, 500);
  }

  // 1. Validate Authorization header
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const idToken = authHeader.slice(7);

  // 2. Read request body (must happen before any other awaits that touch the stream)
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
  const { title = 'CoParent', body: msgBody = '', data = {} } = body;

  // 3. Verify the Firebase ID token via accounts:lookup
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!lookupRes.ok) {
    return json({ error: 'Token verification failed' }, 401);
  }

  const lookupData = await lookupRes.json();
  const senderUid = lookupData.users?.[0]?.localId;
  if (!senderUid) {
    return json({ error: 'User not found' }, 401);
  }

  const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  const authHeader2 = { Authorization: `Bearer ${idToken}` };

  // 4. Fetch sender's profile to get their partner's UID
  const userRes = await fetch(`${fsBase}/users/${senderUid}`, { headers: authHeader2 });
  if (!userRes.ok) {
    return json({ skipped: 'Sender profile not found' });
  }

  const userData = await userRes.json();
  const partnerUid = userData.fields?.partnerId?.stringValue;
  if (!partnerUid) {
    return json({ skipped: 'No partner linked' });
  }

  // 5. Fetch partner's FCM token
  //    (Firestore rules allow linked partners to read each other's fcmTokens)
  const tokenRes = await fetch(`${fsBase}/fcmTokens/${partnerUid}`, { headers: authHeader2 });
  if (!tokenRes.ok) {
    return json({ skipped: 'Partner has no FCM token registered' });
  }

  const tokenData = await tokenRes.json();
  const fcmToken = tokenData.fields?.token?.stringValue;
  if (!fcmToken) {
    return json({ skipped: 'FCM token empty' });
  }

  // 6. Send push notification via FCM Legacy HTTP API
  const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${FCM_KEY}`,
    },
    body: JSON.stringify({
      to: fcmToken,
      priority: 'high',
      notification: {
        title,
        body: msgBody,
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        sound: 'default',
        click_action: '/',
      },
      data,
    }),
  });

  if (!fcmRes.ok) {
    const err = await fcmRes.text();
    return json({ error: `FCM error: ${err}` }, 500);
  }

  return json({ success: true });
}
