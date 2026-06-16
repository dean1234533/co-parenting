import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DISMISSED_KEY = 'jsgrwup_notif_dismissed';

export default function NotificationBanner() {
  const { permission, requestPermission } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      permission === 'default' &&
      typeof Notification !== 'undefined' &&
      !localStorage.getItem(DISMISSED_KEY)
    ) {
      // Delay slightly so the UI settles first
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [permission]);

  if (!visible) return null;

  const handleEnable = async () => {
    setVisible(false);
    await requestPermission();
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 mx-auto max-w-sm w-[calc(100%-2rem)] lg:max-w-md">
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow-lg px-4 py-3">
        <Bell className="h-5 w-5 text-primary shrink-0" />
        <p className="flex-1 text-sm text-foreground">
          Enable notifications to know when your co-parent sends a message — even when the app is closed.
        </p>
        <button
          onClick={handleEnable}
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
