import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, Download, Pencil, Check, X } from 'lucide-react';

function downloadVCard(name, phone) {
  const safe = phone.replace(/\s+/g, '');
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${name};;;;`,
    `TEL;TYPE=CELL:${safe}`,
    'END:VCARD',
  ].join('\r\n');
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ContactRow({ label, name, phone, onSave }) {
  const [editing, setEditing]   = useState(!name && !phone);
  const [draftName, setName]    = useState(name  || '');
  const [draftPhone, setPhone]  = useState(phone || '');
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draftName.trim(), draftPhone.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(name  || '');
    setPhone(phone || '');
    setEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Input
            placeholder="Name (e.g. Jane)"
            value={draftName}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm"
          />
          <Input
            type="tel"
            placeholder="Phone number (e.g. +44 7700 900000)"
            value={draftPhone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1 flex-1"
              onClick={handleSave}
              disabled={saving || !draftName.trim() || !draftPhone.trim()}
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            {(name || phone) && (
              <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
          </div>
        </div>
      ) : name && phone ? (
        <div className="flex items-center justify-between gap-3 p-3 bg-red-100/60 dark:bg-red-900/20 rounded-lg">
          <div>
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground font-mono">{phone}</p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0"
            onClick={() => downloadVCard(name, phone)}
          >
            <Download className="h-3.5 w-3.5" />
            Save to Phone
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left p-3 rounded-lg border-2 border-dashed border-red-200 dark:border-red-800 text-sm text-muted-foreground hover:border-red-400 hover:text-foreground transition-colors"
        >
          + Tap to add {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export default function EmergencyContact() {
  const { profile } = useAuth();

  const save = async (field1, field2, name, phone) => {
    await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
      [field1]: name,
      [field2]: phone,
    });
  };

  return (
    <Card className="border-red-200 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
          <PhoneCall className="h-4 w-4" />
          Emergency Contacts
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Save your co-parent's numbers here. Tap "Save to Phone" to add them to your contacts instantly.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ContactRow
          label="Co-parent"
          name={profile?.emergencyContact1Name}
          phone={profile?.emergencyContact1Phone}
          onSave={(name, phone) => save('emergencyContact1Name', 'emergencyContact1Phone', name, phone)}
        />
        <div className="border-t border-red-200/60 dark:border-red-900/30" />
        <ContactRow
          label="Backup contact"
          name={profile?.emergencyContact2Name}
          phone={profile?.emergencyContact2Phone}
          onSave={(name, phone) => save('emergencyContact2Name', 'emergencyContact2Phone', name, phone)}
        />
      </CardContent>
    </Card>
  );
}
