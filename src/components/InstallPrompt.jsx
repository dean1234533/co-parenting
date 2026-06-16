import React, { useState, useEffect } from 'react';
import { X, Download, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'jsgrwup-install-dismissed';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && window.navigator.standalone)
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed this session
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    if (isIOS()) {
      setIos(true);
      // Small delay so it doesn't pop up immediately on page load
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-[150] max-w-md mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 pb-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md shadow-primary/30">
                <img src="/icons/icon-96x96.png" alt="Js-Grw-Up" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground leading-tight">Install Js-Grw-Up</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ios
                    ? 'Add to your Home Screen for the full experience'
                    : 'Offline access, faster loading, push notifications'}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* iOS Instructions */}
            {ios && (
              <div className="px-4 pb-4">
                <div className="bg-muted rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>
                      Tap the <Share className="h-4 w-4 inline mx-0.5 text-blue-500" /> <strong>Share</strong> button in Safari's toolbar
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Tap <strong>"Add"</strong> in the top right corner</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleDismiss}>
                  Got it
                </Button>
              </div>
            )}

            {/* Android / Chrome Install Button */}
            {!ios && deferredPrompt && (
              <div className="px-4 pb-4 flex gap-2">
                <Button className="flex-1 gap-2" onClick={handleInstall}>
                  <Download className="h-4 w-4" />
                  Install App
                </Button>
                <Button variant="outline" onClick={handleDismiss}>
                  Not now
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
