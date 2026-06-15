import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const onOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-destructive text-destructive-foreground text-sm font-medium text-center py-2.5 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="h-4 w-4" />
          You're offline — showing cached data
        </motion.div>
      )}
      {showReconnected && !isOffline && (
        <motion.div
          key="reconnected"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-green-600 text-white text-sm font-medium text-center py-2.5 flex items-center justify-center gap-2 shadow-lg"
        >
          <Wifi className="h-4 w-4" />
          Back online
        </motion.div>
      )}
    </AnimatePresence>
  );
}
