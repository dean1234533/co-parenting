import {
  doc, getDoc, setDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(firestore, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUserProfile(uid, { displayName, email }) {
  const profile = {
    displayName,
    email,
    familyId: uid,
    partnerId: null,
    partnerName: null,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(firestore, 'users', uid), profile, { merge: true });
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName });
  }
  return { id: uid, ...profile };
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(firestore, 'users', uid), data);
  if (data.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.displayName });
  }
}

// Linking two accounts together is handled server-side by
// /api/accept-invite (see functions/api/accept-invite.js) — it's the trust
// boundary that validates a real, unexpired, accepted invite before
// granting shared family data access, which a client-side write can't do.

export async function applyPendingLink(uid) {
  const snap = await getDoc(doc(firestore, 'pendingLinks', uid));
  if (!snap.exists()) return null;

  const { familyId, partnerId, partnerName } = snap.data();

  await updateDoc(doc(firestore, 'users', uid), { familyId, partnerId, partnerName });
  await deleteDoc(doc(firestore, 'pendingLinks', uid));

  return { familyId, partnerId, partnerName };
}
