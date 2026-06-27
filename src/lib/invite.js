import {
  doc, setDoc, getDoc, updateDoc
} from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { getUserProfile, linkPartners } from '@/lib/userProfile';

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function createInvite() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const profile = await getUserProfile(user.uid);
  if (!profile) throw new Error('Profile not found');

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Extract first name only; strip email domain if displayName was accidentally set to an email
  const rawName = profile.displayName || '';
  const firstName = rawName.includes('@')
    ? rawName.split('@')[0]
    : rawName.split(' ')[0];

  await setDoc(doc(firestore, 'invites', token), {
    createdBy: user.uid,
    createdByName: firstName || 'Your co-parent',
    status: 'pending',
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return { token, url: `${window.location.origin}/invite/${token}` };
}

export async function getInvite(token) {
  const snap = await getDoc(doc(firestore, 'invites', token));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function acceptInvite(token) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const invite = await getInvite(token);
  if (!invite) throw new Error('Invite not found or has expired. Ask your co-parent to send a new invite link.');
  if (invite.createdBy === user.uid) throw new Error('You cannot accept your own invite');

  const myProfile = await getUserProfile(user.uid);
  if (!myProfile) throw new Error('Your profile is not set up yet. Please try again in a moment.');

  // Block only if already linked to a *different* co-parent — allow re-linking to the same person
  const alreadyLinked = myProfile.partnerId && myProfile.partnerId !== invite.createdBy;
  if (alreadyLinked) throw new Error('You are already linked with a different co-parent.');

  // Link the two accounts
  const familyId = await linkPartners(
    invite.createdBy,
    user.uid,
    invite.createdByName,
    myProfile.displayName
  );

  // Mark invite as accepted (or update if already accepted by this user)
  await updateDoc(doc(firestore, 'invites', token), {
    status: 'accepted',
    acceptedBy: user.uid,
    acceptedAt: new Date().toISOString(),
  });

  return familyId;
}
