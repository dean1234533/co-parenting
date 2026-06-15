import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore, messagingPromise } from '@/lib/firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState(null);
  const [foregroundMessage, setForegroundMessage] = useState(null);

  // Save FCM token to Firestore so server can target this device
  const saveToken = async (token) => {
    if (!auth.currentUser || !token) return;
    try {
      await setDoc(
        doc(firestore, 'fcmTokens', auth.currentUser.uid),
        {
          token,
          uid: auth.currentUser.uid,
          updatedAt: new Date().toISOString(),
          platform: /iphone|ipad|ipod|android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to save FCM token:', err);
    }
  };

  const registerToken = async () => {
    if (!VAPID_KEY) return;
    try {
      const messaging = await messagingPromise;
      if (!messaging) return;

      const swReg = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        setFcmToken(token);
        await saveToken(token);
      }
    } catch (err) {
      console.error('FCM token error:', err);
    }
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await registerToken();
      }
      return result;
    } catch (err) {
      console.error('Notification permission error:', err);
      return 'denied';
    }
  };

  // Auto-register token if permission already granted
  useEffect(() => {
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      registerToken();
    }
  }, [permission]);

  // Listen for foreground messages (app is open)
  useEffect(() => {
    let unsubscribe;
    messagingPromise.then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        setForegroundMessage(payload);
        // Show a browser notification even in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'CoParent', {
            body: payload.notification?.body || '',
            icon: '/icons/icon.svg',
          });
        }
      });
    });
    return () => unsubscribe?.();
  }, []);

  return { permission, fcmToken, foregroundMessage, requestPermission };
}
