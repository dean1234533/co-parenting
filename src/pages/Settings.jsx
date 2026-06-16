import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { auth, firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, LogOut, ShieldAlert, FileText, Check, CalendarDays, Link2, Unlink, Archive, Loader2, Clock } from 'lucide-react';
import { isConnected, disconnect } from '@/lib/googleCalendar';
import { exportThenDeleteOldData, RETENTION_MONTHS, retentionCutoff } from '@/lib/dataRetention';
import { format } from 'date-fns';

export default function Settings() {
  const { profile, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [gcalConnected, setGcalConnected] = useState(isConnected());
  const [gcalError, setGcalError] = useState('');
  const [gcalLoading, setGcalLoading] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null); // null | number
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const handleRetentionCleanup = async () => {
    setShowCleanupConfirm(false);
    setCleaningUp(true);
    setCleanupResult(null);
    try {
      const deleted = await exportThenDeleteOldData();
      setCleanupResult(deleted);
    } catch (err) {
      console.error('Cleanup error:', err);
      setCleanupResult(-1);
    } finally {
      setCleaningUp(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      const user = auth.currentUser;

      // Leave a pendingLink for the partner so they get unlinked on next load.
      // pendingLinks allows writes from any authenticated user.
      if (profile?.partnerId) {
        await setDoc(doc(firestore, 'pendingLinks', profile.partnerId), {
          familyId: profile.partnerId,
          partnerId: null,
          partnerName: null,
          linkedAt: new Date().toISOString(),
        });
      }

      // Get a fresh token for the server call
      const idToken = await user.getIdToken(true);

      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || `Server error ${res.status}`);
      }

      // Clear any locally cached identity so the login page doesn't say "Welcome back"
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/register?deleted=true';
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-heading font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{profile?.displayName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{profile?.email}</span>
          </div>
          {profile?.partnerName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Linked with</span>
              <span className="font-medium">{profile.partnerName}</span>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Google Calendar */}
      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#4285F4]" /> Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Connect your Google Calendar so you can send CoParent events to it with one tap from the Calendar page.
            </p>
            {gcalConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Connected
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => { disconnect(); setGcalConnected(false); setGcalError(''); }}
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={gcalLoading}
                  onClick={async () => {
                    setGcalError('');
                    setGcalLoading(true);
                    try {
                      const { requestToken } = await import('@/lib/googleCalendar');
                      await requestToken();
                      setGcalConnected(true);
                    } catch (err) {
                      console.error('Google auth error:', err);
                      setGcalError(err.message || 'Failed to connect Google Calendar. Please try again.');
                    } finally {
                      setGcalLoading(false);
                    }
                  }}
                >
                  {gcalLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
                    : <><Link2 className="h-4 w-4 text-[#4285F4]" /> Connect Google Calendar</>
                  }
                </Button>
                {gcalError && (
                  <p className="text-xs text-destructive mt-1">{gcalError}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/terms" className="block text-sm text-primary hover:underline">Terms and Conditions</Link>
          <Link to="/privacy" className="block text-sm text-primary hover:underline">Privacy Policy</Link>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full gap-2" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Data retention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Archive className="h-4 w-4" /> Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <p>
              Records older than <strong className="text-foreground">{RETENTION_MONTHS} months</strong> are
              automatically deleted. The cutoff date is currently{' '}
              <strong className="text-foreground">{format(new Date(retentionCutoff()), 'MMMM d, yyyy')}</strong>.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Before any deletion happens, a full PDF archive of your data is automatically downloaded to your device so you always keep a copy.
          </p>

          {cleanupResult !== null && cleanupResult >= 0 && (
            <p className="text-sm text-green-600 font-medium">
              {cleanupResult === 0
                ? 'No records older than 12 months — nothing to delete.'
                : `Done. ${cleanupResult} old record${cleanupResult !== 1 ? 's' : ''} deleted. PDF archive downloaded.`}
            </p>
          )}
          {cleanupResult === -1 && (
            <p className="text-sm text-destructive">Cleanup failed — please try again.</p>
          )}

          <Button
            variant="outline"
            className="w-full gap-2 h-auto py-3 whitespace-normal text-center"
            onClick={() => setShowCleanupConfirm(true)}
            disabled={cleaningUp}
          >
            {cleaningUp
              ? <><Loader2 className="h-4 w-4 animate-spin shrink-0" /> Working…</>
              : <><Archive className="h-4 w-4 shrink-0" /> Download PDF Archive &amp; Delete Old Records</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently deletes your account. Cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => { setError(''); setShowDeleteConfirm(true); }}
          >
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your account will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive px-1">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCleanupConfirm} onOpenChange={setShowCleanupConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download archive &amp; delete old data?</AlertDialogTitle>
            <AlertDialogDescription>
              A full PDF archive of all your records will be downloaded to your device first.
              Then all records older than {RETENTION_MONTHS} months (before{' '}
              {format(new Date(retentionCutoff()), 'MMMM d, yyyy')}) will be permanently deleted.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetentionCleanup}>
              Download PDF &amp; Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
