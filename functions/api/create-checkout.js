/**
 * POST /api/create-checkout
 * Creates a Stripe Checkout session for the £5/month subscription.
 * Returns { url } — the client redirects to it.
 */
const ALLOWED_ORIGIN = 'https://js-grw-up.com';

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  if (origin !== ALLOWED_ORIGIN) return json({ error: 'Forbidden' }, 403, origin);

  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace('Bearer ', '').trim();
  if (!idToken) return json({ error: 'Unauthorised' }, 401, origin);

  const uid = await verifyFirebaseToken(idToken, env);
  if (!uid) return json({ error: 'Invalid token' }, 401, origin);

  const body = await request.json().catch(() => ({}));

  // Validate redirect URLs — must point to our own domain to prevent open-redirect
  const successUrl = sanitiseRedirect(body.successUrl, '/subscribe?success=true');
  const cancelUrl  = sanitiseRedirect(body.cancelUrl,  '/subscribe?cancelled=true');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': env.STRIPE_PRICE_ID,
      'line_items[0][quantity]': '1',
      'metadata[uid]': uid,
      'subscription_data[metadata][uid]': uid,
      success_url: successUrl,
      cancel_url: cancelUrl,
      'payment_method_types[0]': 'card',
    }),
  });

  const session = await res.json();
  if (!res.ok) return json({ error: session.error?.message || 'Stripe error' }, 500, origin);
  return json({ url: session.url }, 200, origin);
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function sanitiseRedirect(url, fallbackPath) {
  try {
    const parsed = new URL(url);
    if (parsed.origin === ALLOWED_ORIGIN) return url;
  } catch {}
  return `${ALLOWED_ORIGIN}${fallbackPath}`;
}

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

async function verifyFirebaseToken(idToken, env) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.VITE_FIREBASE_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
    );
    const data = await res.json();
    return data.users?.[0]?.localId || null;
  } catch { return null; }
}
