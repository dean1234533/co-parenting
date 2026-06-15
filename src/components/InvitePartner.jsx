import React, { useState } from 'react';
import { X, Link2, Copy, Check, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createInvite } from '@/lib/invite';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvitePartner({ onClose }) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const { url } = await createInvite();
      setInviteUrl(url);
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg">Invite Co-Parent</h2>
              <p className="text-xs text-muted-foreground">Link lasts 7 days</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Generate a private invite link and send it to your co-parent. Once they open it and sign in, your accounts will be linked and you'll share the same calendar, messages, and records.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {!inviteUrl ? (
          <Button className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Link2 className="h-4 w-4" />Generate Invite Link</>}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Share this link with your co-parent:</p>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 font-medium">Copied to clipboard!</p>}
            <Button variant="outline" className="w-full text-xs" onClick={handleGenerate}>
              Generate new link
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
