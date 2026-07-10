import {
  doc, setDoc, getDoc
} from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/userProfile';

function generateToken() {
  // crypto.getRandomValues is a CSPRNG — invite tokens grant account linking,
  // so they must not be predictable the way Math.random() output can be.
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
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

  // Linking accounts grants shared access to messages, expenses, incident
  // reports etc., so it's validated and performed server-side (with a
  // service account) rather than as direct client Firestore writes — the
  // client can't be trusted to prove an invite was genuinely accepted.
  const idToken = await user.getIdToken();
  const res = await fetch('/api/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not accept this invite. Please try again.');

  return data.familyId;
}
