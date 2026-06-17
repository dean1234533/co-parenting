import { useEffect, useRef } from 'react';

export default function UpdatePrompt() {
  const swRef = useRef(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdate = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) reg.update();
    };

    // Check for updates when page becomes visible (user returns to app)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    // When a new SW is waiting, reload automatically
    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Also check immediately on mount
    checkForUpdate();

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
