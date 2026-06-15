import {
  doc, getDoc, setDoc, updateDoc
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
    familyId: null,
    partnerId: null,
    partnerName: null,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(firestore, 'users', uid), profile);
  // Also update Firebase Auth display name
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

export async function linkPartners(myUid, partnerUid, myName, partnerName) {
  // Generate a shared familyId (use the inviter's uid as the family root)
  const familyId = `family_${myUid}`;

  await setDoc(doc(firestore, 'families', familyId), {
    member1Id: myUid,
    member1Name: myName,
    member2Id: partnerUid,
    member2Name: partnerName,
    createdAt: new Date().toISOString(),
  });

  await updateDoc(doc(firestore, 'users', myUid), {
    familyId,
    partnerId: partnerUid,
    partnerName,
  });

  await updateDoc(doc(firestore, 'users', partnerUid), {
    familyId,
    partnerId: myUid,
    partnerName: myName,
  });

  return familyId;
}
