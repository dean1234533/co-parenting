/**
 * POST /api/create-checkout
 * Creates a Stripe Checkout session for the £5/month subscription.
 * Returns { url } — the client redirects to it.
 */
export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace('Bearer ', '').trim();
  if (!idToken) return json({ error: 'Unauthorised' }, 401);

  const uid = await verifyFirebaseToken(idToken, env);
  if (!uid) return json({ error: 'Invalid token' }, 401);

  const body = await request.json().catch(() => ({}));
  const successUrl = body.successUrl || 'https://js-grw-up.com/subscribe?success=true';
  const cancelUrl  = body.cancelUrl  || 'https://js-grw-up.com/subscribe?cancelled=true';

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
  if (!res.ok) return json({ error: session.error?.message || 'Stripe error' }, 500);
  return json({ url: session.url });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
