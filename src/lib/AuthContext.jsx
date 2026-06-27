import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { setFamilyId } from '@/api/db';
import { applyPendingLink } from '@/lib/userProfile';

const AuthContext = createContext();

const cachedName = localStorage.getItem('jsgrwup_name');
const cachedUid  = localStorage.getItem('jsgrwup_uid');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(cachedUid ? { id: cachedUid, full_name: cachedName || 'User', email: '' } : null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!cachedUid);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(!!cachedUid);
  const profileUnsubRef = useRef(null);

  const applyProfile = (uid, data) => {
    const p = { id: uid, ...data };
    setProfile(p);
    setFamilyId(p.familyId || uid);
    return p;
  };

  const pendingUnsubRef = useRef(null);

  const subscribeToProfile = (firebaseUser) => {
    if (profileUnsubRef.current) profileUnsubRef.current();
    if (pendingUnsubRef.current) pendingUnsubRef.current();

    const profileRef = doc(firestore, 'users', firebaseUser.uid);
    const pendingRef = doc(firestore, 'pendingLinks', firebaseUser.uid);
    let firstSnapshot = true;

    const unsub = onSnapshot(profileRef, async (snap) => {
      console.log('[Auth] profile snapshot uid=%s exists=%s firstSnapshot=%s', firebaseUser.uid, snap.exists(), firstSnapshot);
      if (!snap.exists()) {
        // Only auto-create profile for brand-new sign-ins (within 5 min of last sign-in).
        // If the profile was deleted by an admin for an established account, sign out instead.
        const lastSignIn = new Date(firebaseUser.metadata.lastSignInTime).getTime();
        const isRecentSignIn = Date.now() - lastSignIn < 5 * 60 * 1000;
        if (!isRecentSignIn) {
          console.log('[Auth] profile missing + stale session → signing out');
          await signOut(auth);
          return;
        }
        // For email/password registration, Firebase Auth has no displayName yet —
        // Register will call createUserProfile with the real name, which fires a
        // second snapshot and unblocks loading. Only auto-create for OAuth sign-ins
        // where displayName is already populated (e.g. Google).
        if (!firebaseUser.displayName) {
          console.log('[Auth] profile missing, no displayName yet — waiting for Register to create it');
          return;
        }
        console.log('[Auth] auto-creating profile for OAuth user displayName=%s', firebaseUser.displayName);
        const newProfile = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          familyId: firebaseUser.uid,
          partnerId: null,
          partnerName: null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(profileRef, newProfile, { merge: true });
        return;
      }

      const p = applyProfile(firebaseUser.uid, snap.data());
      console.log('[Auth] profile applied displayName=%s familyId=%s partnerId=%s', p.displayName, p.familyId, p.partnerId);

      if (p.displayName && !p.displayName.includes('@')) {
        localStorage.setItem('jsgrwup_name', p.displayName);
      }

      if (firstSnapshot) {
        firstSnapshot = false;
        const fullName = p.displayName || firebaseUser.email?.split('@')[0] || 'User';
        setUser({ id: firebaseUser.uid, full_name: fullName, email: firebaseUser.email });
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        localStorage.setItem('jsgrwup_uid', firebaseUser.uid);
        console.log('[Auth] ✅ auth resolved isAuthenticated=true');
      }
    }, (err) => {
      console.error('[Auth] profile listener error:', err);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    // Listen to pendingLinks in real-time so linking is instant even when
    // the partner accepts while this user is already logged in
    const pendingUnsub = onSnapshot(pendingRef, async (snap) => {
      if (!snap.exists()) return;
      const { familyId, partnerId, partnerName } = snap.data();
      try {
        await setDoc(doc(firestore, 'users', firebaseUser.uid), { familyId, partnerId, partnerName }, { merge: true });
        await deleteDoc(pendingRef);
      } catch {
        // Apply locally so current session works even if the Firestore write failed
        const profileSnap = await getDoc(profileRef);
        applyProfile(firebaseUser.uid, {
          ...(profileSnap.exists() ? profileSnap.data() : {}),
          familyId, partnerId, partnerName,
        });
      }
    }, () => {});

    profileUnsubRef.current = unsub;
    pendingUnsubRef.current = pendingUnsub;
  };

  useEffect(() => {
    // Safety net: if auth never resolves (e.g. Firestore IndexedDB lock), unblock after 8s
    const authTimeout = setTimeout(() => {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }, 8000);

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(authTimeout);
      if (firebaseUser) {
        subscribeToProfile(firebaseUser);
      } else {
        if (profileUnsubRef.current) profileUnsubRef.current();
        if (pendingUnsubRef.current) pendingUnsubRef.current();
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setFamilyId(null);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        localStorage.removeItem('jsgrwup_uid');
        localStorage.removeItem('jsgrwup_name');
      }
    });
    return () => {
      clearTimeout(authTimeout);
      unsubAuth();
      if (profileUnsubRef.current) profileUnsubRef.current();
      if (pendingUnsubRef.current) pendingUnsubRef.current();
    };
  }, []);

  const refreshProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const snap = await getDoc(doc(firestore, 'users', user.uid));
    if (snap.exists()) applyProfile(user.uid, snap.data());
  };

  const logout = async (shouldRedirect = true) => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setFamilyId(null);
    localStorage.removeItem('jsgrwup_name');
    localStorage.removeItem('jsgrwup_uid');
    if (shouldRedirect) window.location.href = '/login';
  };

  const navigateToLogin = () => { window.location.href = '/login'; };
  const checkUserAuth = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
