import db, { getFamilyId } from '@/api/db';
import { generateAndDownloadPDF } from '@/lib/generateReport';
import { format, subMonths } from 'date-fns';

export const RETENTION_MONTHS = 12;

/** ISO string for 12 months ago */
export function retentionCutoff() {
  return subMonths(new Date(), RETENTION_MONTHS).toISOString();
}

/** Fetch all family records and split into current vs. old (> 12 months) */
export async function auditRetention() {
  const cutoff = retentionCutoff();

  const [messages, requests, incidents, progress, expenses, events, rules] = await Promise.all([
    db.entities.ChatMessage.list('-created_date', 500),
    db.entities.Request.list('-created_date', 500),
    db.entities.IncidentReport.list('-incident_date', 500),
    db.entities.ProgressEntry.list('-created_date', 500),
    db.entities.Expense.list('-date', 500),
    db.entities.CalendarEvent.list('-date', 500),
    db.entities.CoParentingRule.list('-created_date', 200),
  ]);

  const isOld = (record) => {
    const d = record.created_date || record.incident_date || record.date;
    return d && d < cutoff;
  };

  const old = {
    messages:  messages.filter(isOld),
    requests:  requests.filter(isOld),
    incidents: incidents.filter(isOld),
    progress:  progress.filter(isOld),
    expenses:  expenses.filter(isOld),
    events:    events.filter(isOld),
    rules:     rules.filter(isOld),
  };

  const all = { messages, requests, incidents, progress, expenses, events, rules };

  const oldCount = Object.values(old).reduce((n, arr) => n + arr.length, 0);

  return { old, all, oldCount };
}

/**
 * 1. Generate and download a full PDF of ALL data.
 * 2. Delete every record older than RETENTION_MONTHS.
 * Returns the number of deleted records.
 */
export async function exportThenDeleteOldData() {
  const { old, all, oldCount } = await auditRetention();

  if (oldCount === 0) return 0;

  // Step 1 — download the full archive PDF before deleting anything
  const cutoffLabel = format(new Date(retentionCutoff()), 'MMM-yyyy');
  generateAndDownloadPDF(all, `coparent-archive-before-${cutoffLabel}.pdf`);

  // Small delay so the browser has time to start the download
  await new Promise((r) => setTimeout(r, 400));

  // Step 2 — delete old records
  const entityMap = {
    messages:  'ChatMessage',
    requests:  'Request',
    incidents: 'IncidentReport',
    progress:  'ProgressEntry',
    expenses:  'Expense',
    events:    'CalendarEvent',
    rules:     'CoParentingRule',
  };

  let deleted = 0;
  for (const [key, records] of Object.entries(old)) {
    const entity = db.entities[entityMap[key]];
    for (const rec of records) {
      await entity.delete(rec.id);
      deleted++;
    }
  }

  // Remember when we last cleaned up
  localStorage.setItem('coparent_last_cleanup', new Date().toISOString());

  return deleted;
}
