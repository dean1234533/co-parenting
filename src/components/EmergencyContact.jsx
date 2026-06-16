import React from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, UserCircle, Download, Info } from 'lucide-react';

function downloadVCard(name, phone) {
  const safePhone = phone.replace(/\s+/g, '');
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${name};;;;`,
    `TEL;TYPE=CELL:${safePhone}`,
    'END:VCARD',
  ].join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ContactRow({ name, phone, label }) {
  const hasPhone = !!phone;
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
          <UserCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{name}</p>
          {label && <p className="text-xs text-muted-foreground/60">{label}</p>}
          {hasPhone ? (
            <p className="text-xs text-muted-foreground font-mono">{phone}</p>
          ) : (
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <Info className="h-3 w-3" />
              No number saved yet
            </p>
          )}
        </div>
      </div>

      {hasPhone && (
        <Button
          size="sm"
          className="gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0"
          onClick={() => downloadVCard(name, phone)}
        >
          <Download className="h-3.5 w-3.5" />
          Save to Contacts
        </Button>
      )}
    </div>
  );
}

export default function EmergencyContact() {
  const { profile } = useAuth();

  const { data: partnerProfile } = useQuery({
    queryKey: ['partner-profile', profile?.partnerId],
    queryFn: async () => {
      const snap = await getDoc(doc(firestore, 'users', profile.partnerId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    enabled: !!profile?.partnerId,
    staleTime: 60_000,
  });

  if (!profile?.partnerId) return null;

  const partnerName = profile.partnerName || 'Co-parent';
  const hasBackup = !!(partnerProfile?.backupContactName && partnerProfile?.backupContactPhone);

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
          <PhoneCall className="h-4 w-4" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary — the co-parent */}
        <ContactRow
          name={partnerName}
          phone={partnerProfile?.phoneNumber}
          label="Co-parent"
        />

        {/* Backup contact (if set) */}
        {(hasBackup || partnerProfile) && (
          <>
            <div className="border-t border-red-200/60 dark:border-red-900/30" />
            <ContactRow
              name={partnerProfile?.backupContactName || 'Backup contact'}
              phone={partnerProfile?.backupContactPhone}
              label={hasBackup ? 'Backup — if co-parent unreachable' : undefined}
            />
            {!hasBackup && (
              <p className="text-xs text-muted-foreground/60 -mt-2">
                Ask {partnerName} to add a backup contact in Settings.
              </p>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground/50 pt-1">
          Tap "Save to Contacts" to add a number directly to your phone.
        </p>
      </CardContent>
    </Card>
  );
}
