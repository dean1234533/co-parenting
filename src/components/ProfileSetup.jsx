import React, { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/lib/userProfile';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';

export default function ProfileSetup() {
  const { refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      await updateUserProfile(auth.currentUser.uid, { displayName: trimmed });
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to save name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-[300]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">What's your name?</h1>
          <p className="text-muted-foreground mt-2">
            This is how your co-parent will see you in the app.
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your first name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Dean"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !name.trim()}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
