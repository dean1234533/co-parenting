import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { auth, firestore } from '@/lib/firebase';
import {
  EmailAuthProvider, reauthenticateWithCredential, deleteUser,
  GoogleAuthProvider, reauthenticateWithPopup,
} from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, LogOut, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const { profile, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isGoogleUser = auth.currentUser?.providerData?.[0]?.providerId === 'google.com';

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      const user = auth.currentUser;

      // Re-authenticate before deletion (Firebase requires this)
      if (isGoogleUser) {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      } else {
        if (!password) {
          setError('Please enter your password to confirm deletion.');
          setDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // If linked, clear partner's reference to this account
      if (profile?.partnerId) {
        await updateDoc(doc(firestore, 'users', profile.partnerId), {
          familyId: profile.partnerId,
          partnerId: null,
          partnerName: null,
        });
      }

      // Delete this user's Firestore profile
      await deleteDoc(doc(firestore, 'users', user.uid));

      // Delete Firebase Auth account
      await deleteUser(user);

      window.location.href = '/login';
    } catch (err) {
      console.error('Delete account error:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in before deleting your account.');
      } else {
        setError(err.message || 'Failed to delete account. Please try again.');
      }
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

      {/* Sign out */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full gap-2" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Sign Out
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
            Permanently delete your account and all your data. If you're linked with a co-parent, they will be automatically unlinked. This cannot be undone.
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your profile and signs you out. Your co-parent will be unlinked. Shared records (messages, calendar etc.) are not deleted but will no longer be accessible to you.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isGoogleUser && (
            <div className="py-2 space-y-2">
              <Label htmlFor="confirm-password">Enter your password to confirm</Label>
              <Input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          )}

          {isGoogleUser && (
            <p className="text-sm text-muted-foreground py-2">
              You'll be asked to re-confirm with Google before deletion.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

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
    </div>
  );
}
