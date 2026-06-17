import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Sparkles, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FREE_FEATURES = [
  'Private messaging',
  'Shared calendar',
  'Requests & approvals',
  'Link with your co-parent',
];

const PAID_FEATURES = [
  'Everything in Free',
  'Incident reports (court-ready)',
  'Expense tracking & receipts',
  'Daily logs',
  'Progress tracking',
  'Co-parenting rules',
  'Export full PDF archive',
  'Google Calendar sync',
  'Priority support',
];

export default function Subscribe() {
  const { profile } = useAuth();
  const { isPaid } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  // Detect if running inside Play Store TWA
  const isTWA = window.matchMedia('(display-mode: standalone)').matches &&
    /android/i.test(navigator.userAgent);

  const handleSubscribe = async () => {
    setError('');

    // Play Store TWA — open browser to subscribe
    if (isTWA) {
      window.open('https://js-grw-up.com/subscribe', '_blank');
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/subscribe?success=true`,
          cancelUrl: `${window.location.origin}/subscribe?cancelled=true`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">Choose your plan</h1>
        <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-sm font-medium text-center">
          🎉 You're now on Premium! All features are unlocked.
        </div>
      )}
      {cancelled && (
        <div className="p-4 bg-muted border border-border rounded-xl text-muted-foreground text-sm text-center">
          No problem — you can upgrade any time.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Free tier */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading">Free</CardTitle>
            <div className="text-3xl font-bold">£0<span className="text-base font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-3">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
            <div className="pt-4">
              {isPaid ? (
                <Button variant="outline" className="w-full" disabled>Current plan</Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard">Continue with Free</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium tier */}
        <Card className="border-primary ring-2 ring-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Most popular
          </div>
          <CardHeader>
            <CardTitle className="font-heading">Premium</CardTitle>
            <div className="text-3xl font-bold">£5<span className="text-base font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-3">
            {PAID_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
            <div className="pt-4">
              {isPaid ? (
                <Button className="w-full" disabled>
                  <Check className="h-4 w-4 mr-2" /> Active plan
                </Button>
              ) : (
                <Button className="w-full gap-2" onClick={handleSubscribe} disabled={loading}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
                    : isTWA
                      ? <><ExternalLink className="h-4 w-4" /> Subscribe in browser</>
                      : <><Sparkles className="h-4 w-4" /> Upgrade for £5/month</>
                  }
                </Button>
              )}
            </div>
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
            <p className="text-xs text-muted-foreground text-center">Cancel anytime. No hidden fees.</p>
          </CardContent>
        </Card>
      </div>

      {isPaid && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            To cancel your subscription, email us or manage it via your{' '}
            <a href="https://billing.stripe.com/p/login/test_00g00000000000" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              billing portal
            </a>.
          </p>
        </div>
      )}
    </div>
  );
}
