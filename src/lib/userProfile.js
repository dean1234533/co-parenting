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
  await setDoc(doc(firestore, 'users', uid), profile);
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

export async function linkPartners(inviterUid, acceptorUid, inviterName, acceptorName) {
  const familyId = `family_${inviterUid}`;

  // Create shared family document (any authenticated user can write)
  await setDoc(doc(firestore, 'families', familyId), {
    member1Id: inviterUid,
    member1Name: inviterName,
    member2Id: acceptorUid,
    member2Name: acceptorName,
    createdAt: new Date().toISOString(),
  });

  // Update acceptor's OWN doc (they own it — always allowed)
  await updateDoc(doc(firestore, 'users', acceptorUid), {
    familyId,
    partnerId: inviterUid,
    partnerName: inviterName,
  });

  // Leave a pending link for the inviter — they apply it to their own doc on next load
  // (avoids needing cross-user write permissions)
  await setDoc(doc(firestore, 'pendingLinks', inviterUid), {
    familyId,
    partnerId: acceptorUid,
    partnerName: acceptorName,
    linkedAt: new Date().toISOString(),
  });

  return familyId;
}

export async function applyPendingLink(uid) {
  const snap = await getDoc(doc(firestore, 'pendingLinks', uid));
  if (!snap.exists()) return null;

  const { familyId, partnerId, partnerName } = snap.data();

  await updateDoc(doc(firestore, 'users', uid), { familyId, partnerId, partnerName });
  await deleteDoc(doc(firestore, 'pendingLinks', uid));

  return { familyId, partnerId, partnerName };
}

export async function unlinkPartners(myUid, partnerUid, currentFamilyId) {
  await updateDoc(doc(firestore, 'users', myUid), {
    familyId: myUid,
    partnerId: null,
    partnerName: null,
  });

  // Leave a pending unlink for the partner
  await setDoc(doc(firestore, 'pendingLinks', partnerUid), {
    familyId: partnerUid,
    partnerId: null,
    partnerName: null,
    linkedAt: new Date().toISOString(),
  });

  if (currentFamilyId) {
    await deleteDoc(doc(firestore, 'families', currentFamilyId));
  }
}
