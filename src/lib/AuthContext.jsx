import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setFamilyId } from '@/api/db';
import { getUserProfile, createUserProfile } from '@/lib/userProfile';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const loadProfile = async (firebaseUser) => {
    let p = await getUserProfile(firebaseUser.uid);
    if (!p) {
      // First time — auto-create a minimal profile from Firebase Auth data
      p = await createUserProfile(firebaseUser.uid, {
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
      });
    }
    setProfile(p);
    if (p.familyId) setFamilyId(p.familyId);
    return p;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const p = await loadProfile(firebaseUser);
        setUser({
          id: firebaseUser.uid,
          full_name: p.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setFamilyId(null);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await loadProfile(auth.currentUser);
      setUser((prev) => prev ? { ...prev, full_name: p.displayName } : prev);
    }
  };

  const logout = async (shouldRedirect = true) => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setFamilyId(null);
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
