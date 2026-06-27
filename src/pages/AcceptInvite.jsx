import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInvite, acceptInvite } from '@/lib/invite';
import { useAuth } from '@/lib/AuthContext';
import AuthLayout from '@/components/AuthLayout';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, refreshProfile } = useAuth();
  const autoAccept = new URLSearchParams(window.location.search).get('auto') === '1';

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Wait for auth to resolve before reading Firestore (rules require auth)
  useEffect(() => {
    if (isLoadingAuth) return;
    getInvite(token)
      .then((inv) => {
        if (!inv) setError('This invite link is invalid or has expired.');
        else setInvite(inv);
      })
      .catch(() => setError('This invite link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token, isLoadingAuth]);

  // Auto-accept when user just registered/signed-in via the invite link
  useEffect(() => {
    console.log('[AcceptInvite] auto-accept check: autoAccept=%s loading=%s isLoadingAuth=%s isAuthenticated=%s hasInvite=%s done=%s accepting=%s',
      autoAccept, loading, isLoadingAuth, isAuthenticated, !!invite, done, accepting);
    if (!autoAccept || loading || isLoadingAuth || !isAuthenticated || !invite || done || accepting) return;
    handleAccept();
  }, [autoAccept, loading, isLoadingAuth, isAuthenticated, invite, done, accepting]);

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    try {
      await acceptInvite(token);
      await refreshProfile();
      setDone(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('acceptInvite error:', err);
      setError(err.message || 'Failed to accept invite. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <AuthLayout icon={CheckCircle} title="You're linked!" subtitle="Redirecting you to the app…">
        <div className="text-center text-muted-foreground text-sm">
          You and <strong>{invite?.createdByName}</strong> are now co-parenting together on Js-Grw-Up.
        </div>
      </AuthLayout>
    );
  }

  if (error && !invite) {
    return (
      <AuthLayout icon={AlertTriangle} title="Invalid invite" subtitle="This link may have expired or already been used">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/login')} variant="outline" className="w-full">Back to Login</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Heart} title="Co-parent invite" subtitle={`${invite?.createdByName || 'Someone'} invited you to co-parent together`}>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-center">
          <p className="font-semibold text-foreground">{invite?.createdByName}</p>
          <p className="text-muted-foreground mt-1">has invited you to link your accounts and share your co-parenting records.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Sign in or create an account first, then come back to this link to connect.
            </p>
            <Button className="w-full" onClick={() => navigate(`/login?next=${encodeURIComponent(`/invite/${token}?auto=1`)}`)}>
              Sign in
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(`/register?next=${encodeURIComponent(`/invite/${token}?auto=1`)}`)}>
              Create account
            </Button>
          </div>
        ) : (
          <Button className="w-full h-12 gap-2" onClick={handleAccept} disabled={accepting}>
            {accepting ? <><Loader2 className="h-4 w-4 animate-spin" />Linking accounts…</> : 'Accept & Link Accounts'}
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}
