/**
 * POST /api/stripe-webhook
 * Handles Stripe webhook events to update subscription status in Firestore.
 */
export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  // Verify webhook signature
  const valid = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response('Invalid signature', { status: 400 });

  const event = JSON.parse(rawBody);
  const { type, data } = event;

  const sub = data.object;
  const uid = sub.metadata?.uid;
  if (!uid) return new Response('No uid in metadata', { status: 200 });

  if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
    const active = sub.status === 'active' || sub.status === 'trialing';
    await updateSubscription(uid, {
      subscriptionStatus: active ? 'active' : 'inactive',
      subscriptionId: sub.id,
      customerId: sub.customer,
      currentPeriodEnd: sub.current_period_end,
    }, env);
  }

  if (type === 'customer.subscription.deleted') {
    await updateSubscription(uid, {
      subscriptionStatus: 'inactive',
      subscriptionId: null,
      currentPeriodEnd: null,
    }, env);
  }

  return new Response('OK', { status: 200 });
}

async function updateSubscription(uid, fields, env) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const token = await getFirebaseToken(env);

  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${f}`).join('&');
  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === null) firestoreFields[k] = { nullValue: null };
    else if (typeof v === 'number') firestoreFields[k] = { integerValue: v };
    else firestoreFields[k] = { stringValue: String(v) };
  }

  await fetch(`${url}?${updateMask}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields }),
  });
}

async function getFirebaseToken(env) {
  const email = env.FIREBASE_SA_EMAIL;
  const key   = env.FIREBASE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: email, sub: email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600, scope: 'https://www.googleapis.com/auth/datastore' };

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const body   = btoa(JSON.stringify(payload)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const sigInput = `${header}.${body}`;

  const cryptoKey = await crypto.subtle.importKey('pkcs8', pemToBuf(key), { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(sigInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

  const jwt = `${sigInput}.${sigB64}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const { access_token } = await res.json();
  return access_token;
}

function pemToBuf(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  try {
    const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
    const timestamp = parts.t;
    const expected = parts.v1;
    const signed = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
    const computed = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2,'0')).join('');
    return computed === expected;
  } catch { return false; }
}
