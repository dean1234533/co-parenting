import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { setFamilyId } from '@/api/db';
import { applyPendingLink } from '@/lib/userProfile';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const profileUnsubRef = useRef(null);

  const applyProfile = (uid, data) => {
    const p = { id: uid, ...data };
    setProfile(p);
    setFamilyId(p.familyId || uid);
    return p;
  };

  const subscribeToProfile = (firebaseUser) => {
    // Tear down any existing listener
    if (profileUnsubRef.current) profileUnsubRef.current();

    const profileRef = doc(firestore, 'users', firebaseUser.uid);
    let firstSnapshot = true;

    const unsub = onSnapshot(profileRef, async (snap) => {
      if (!snap.exists()) {
        // First login — create profile (leave displayName empty so ProfileSetup prompts for a real name)
        const newProfile = {
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          familyId: firebaseUser.uid,
          partnerId: null,
          partnerName: null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(profileRef, newProfile);
        // onSnapshot will fire again with the created doc
        return;
      }

      let p = applyProfile(firebaseUser.uid, snap.data());

      // Persist name so login page can greet returning users (only if it's a real name, not an email)
      if (p.displayName && !p.displayName.includes('@')) {
        localStorage.setItem('coparent_name', p.displayName);
      }

      // Apply any pending link left by a partner (avoids cross-user writes)
      if (!p.partnerId) {
        applyPendingLink(firebaseUser.uid)
          .then((link) => {
            if (link) applyProfile(firebaseUser.uid, { ...snap.data(), ...link });
          })
          .catch(() => {});
      }

      if (firstSnapshot) {
        firstSnapshot = false;
        setUser({
          id: firebaseUser.uid,
          full_name: p.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
        });
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    }, (err) => {
      console.error('Profile listener error:', err);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    profileUnsubRef.current = unsub;
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        subscribeToProfile(firebaseUser);
      } else {
        if (profileUnsubRef.current) profileUnsubRef.current();
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setFamilyId(null);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    });
    return () => {
      unsubAuth();
      if (profileUnsubRef.current) profileUnsubRef.current();
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
    localStorage.removeItem('coparent_name');
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
