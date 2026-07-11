import db from '@/api/db';
import { createUserProfile } from '@/lib/userProfile';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { MAX_USERS } from '@/lib/config';

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const accountDeleted = new URLSearchParams(window.location.search).get('deleted') === 'true';
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [atCapacity, setAtCapacity] = useState(false);
  const [checkingCapacity, setCheckingCapacity] = useState(true);

  // Soft launch cap — protects against unbounded hosting costs while
  // there's no paid tier. See src/lib/config.js.
  useEffect(() => {
    getDoc(doc(firestore, 'meta', 'stats'))
      .then((snap) => setAtCapacity((snap.data()?.userCount || 0) >= MAX_USERS))
      .catch(() => setAtCapacity(false))
      .finally(() => setCheckingCapacity(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const credential = await db.auth.register({ email, password });
      if (credential.user) {
        await createUserProfile(credential.user.uid, {
          displayName: displayName.trim() || email.split('@')[0],
          email,
        });
      }

      // If user arrived via an invite link, send them to the invite page to confirm linking.
      // They are now authenticated so they'll see "Accept & Link Accounts" and click it.
      const next = new URLSearchParams(window.location.search).get('next');
      const inviteMatch = next?.match(/\/invite\/([^?/]+)/);
      const inviteToken = inviteMatch?.[1] || localStorage.getItem('pendingInviteToken');

      if (inviteToken) {
        localStorage.removeItem('pendingInviteToken');
        navigate(`/invite/${inviteToken}`, { replace: true });
        return;
      }

      navigate(next || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await db.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  if (checkingCapacity) return null;

  if (atCapacity) {
    return (
      <AuthLayout
        icon={UserPlus}
        title="We've reached capacity"
        subtitle="Js-Grw-Up is in a limited early launch"
        footer={
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <p className="text-sm text-muted-foreground text-center">
          We've temporarily paused new sign-ups while we scale up. Please check back soon, or contact us at{" "}
          <a href="mailto:support@js-grw-up.com" className="text-primary hover:underline">support@js-grw-up.com</a> to be notified when spots open up.
        </p>
      </AuthLayout>
    );
  }

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your email"
        subtitle={`We sent a verification link to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <p className="text-sm text-muted-foreground text-center mb-6">
          Click the link in your email to verify your account, then sign in.
        </p>
        <Button
          className="w-full h-12 font-medium"
          onClick={() => { window.location.href = '/login'; }}
        >
          Go to Login
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the email?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {accountDeleted && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          Your account has been deleted. Create a new one below if you'd like to start fresh.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your first name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="name"
              type="text"
              placeholder="e.g. Dean"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
