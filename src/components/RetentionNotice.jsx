import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileDown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auditRetention, exportThenDeleteOldData, RETENTION_MONTHS } from '@/lib/dataRetention';
import { useAuth } from '@/lib/AuthContext';

const SESSION_KEY = 'jsgrwup_retention_checked';

export default function RetentionNotice() {
  const { profile } = useAuth();
  const [oldCount, setOldCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only check once per browser session and only when a familyId is available
    if (!profile?.familyId || sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;
    (async () => {
      try {
        const { oldCount } = await auditRetention();
        if (cancelled) return;
        sessionStorage.setItem(SESSION_KEY, '1');
        if (oldCount > 0) {
          setOldCount(oldCount);
          setVisible(true);
        }
      } catch {
        // Ignore — retention check is non-critical
      }
    })();

    return () => { cancelled = true; };
  }, [profile?.familyId]);

  if (!visible || dismissed) return null;

  if (done) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 mx-auto max-w-sm w-[calc(100%-2rem)] lg:max-w-lg">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl shadow-lg px-4 py-3 dark:bg-green-950/30 dark:border-green-800">
          <FileDown className="h-5 w-5 text-green-600 shrink-0" />
          <p className="flex-1 text-sm text-green-800 dark:text-green-200 font-medium">
            Archive PDF downloaded and old records deleted.
          </p>
          <button onClick={() => setVisible(false)} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleCleanup = async () => {
    setWorking(true);
    try {
      await exportThenDeleteOldData();
      setDone(true);
    } catch (err) {
      console.error('Retention cleanup error:', err);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 mx-auto max-w-sm w-[calc(100%-2rem)] lg:max-w-xl">
      <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-lg px-4 py-4 dark:bg-amber-950/30 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {oldCount} record{oldCount !== 1 ? 's are' : ' is'} over {RETENTION_MONTHS} months old
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Our {RETENTION_MONTHS}-month data retention policy requires these to be deleted.
              Clicking below will download a full PDF archive of everything first, then remove the old records.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleCleanup}
                disabled={working}
              >
                {working
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…</>
                  : <><FileDown className="h-3.5 w-3.5" /> Download PDF &amp; Delete Old Data</>
                }
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-amber-700"
                onClick={() => setDismissed(true)}
                disabled={working}
              >
                Remind me later
              </Button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
