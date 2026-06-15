import { auth } from '@/lib/firebase';

export async function sendPartnerNotification({ title, body, data = {} }) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();

    await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ title, body, data }),
    });
  } catch (err) {
    // Notifications are non-critical — don't block the UI on failure
    console.warn('Notification send failed:', err);
  }
}
