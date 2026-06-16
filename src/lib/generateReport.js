import jsPDF from 'jspdf';
import { format } from 'date-fns';

/**
 * Generates and downloads a full Js-Grw-Up PDF report.
 * @param {object} data  — { messages, requests, incidents, progress, expenses, events, rules }
 * @param {string} filename
 */
export function generateAndDownloadPDF(data, filename = 'coparent-report.pdf') {
  const {
    messages  = [],
    requests  = [],
    incidents = [],
    progress  = [],
    expenses  = [],
    events    = [],
    rules     = [],
  } = data;

  const doc = new jsPDF();
  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  const checkPage = (needed = 15) => {
    if (y + needed > 275) { doc.addPage(); y = 20; }
  };

  const addTitle = (text) => {
    checkPage(18);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(text, margin, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 6;
  };

  const addLine = (text, bold = false) => {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text ?? ''), maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 1;
    if (bold) doc.setFont(undefined, 'normal');
  };

  // Cover
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('Js-Grw-Up — Full Report', margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, margin, y);
  y += 14;

  if (messages.length) {
    addTitle('Messages');
    [...messages].reverse().forEach((msg) => {
      const t = msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : '';
      addLine(`${msg.sender_name || 'Unknown'} (${t}):`, true);
      addLine(msg.content);
      y += 2;
    });
    y += 4;
  }

  if (requests.length) {
    addTitle('Requests & Approvals');
    requests.forEach((req) => {
      addLine(`${req.title} [${(req.status || '').toUpperCase()}]`, true);
      addLine(`Type: ${(req.type || '').replace('_', ' ')} | By: ${req.requester_name || 'Unknown'}`);
      if (req.description) addLine(req.description);
      if (req.response_note) addLine(`Response: ${req.response_note}`);
      y += 2;
    });
    y += 4;
  }

  if (incidents.length) {
    addTitle('Incident Reports');
    incidents.forEach((inc) => {
      const d = inc.incident_date ? format(new Date(inc.incident_date), 'MMM d, yyyy') : '';
      addLine(`${inc.child_name} — ${(inc.injury_type || '').replace('_', ' ')} (${d})`, true);
      addLine(`Severity: ${inc.severity} | Reported by: ${inc.reported_by}`);
      if (inc.description) addLine(inc.description);
      if (inc.action_taken) addLine(`Action: ${inc.action_taken}`);
      y += 2;
    });
    y += 4;
  }

  if (progress.length) {
    addTitle('Progress & Homework');
    progress.forEach((p) => {
      addLine(`${p.title} — ${p.child_name}`, true);
      addLine(`Category: ${(p.category || '').replace('_', ' ')} | Date: ${p.date ? format(new Date(p.date), 'MMM d, yyyy') : 'N/A'}`);
      if (p.description) addLine(p.description);
      y += 2;
    });
    y += 4;
  }

  if (expenses.length) {
    addTitle('Financial Records');
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    addLine(`Total: £${total.toFixed(2)}`, true);
    y += 2;
    expenses.forEach((exp) => {
      const d = exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '';
      addLine(`${d} — ${exp.title} — £${(exp.amount || 0).toFixed(2)} (${(exp.category || '').replace(/_/g, ' ')}) — Paid by ${exp.paid_by}`);
    });
    y += 4;
  }

  if (events.length) {
    addTitle('Calendar Events');
    events.forEach((evt) => {
      const d = evt.date ? format(new Date(evt.date), 'MMM d, yyyy') : '';
      addLine(`${d} ${evt.time || ''} — ${evt.title} (${evt.event_type}) — Added by ${evt.added_by}`);
    });
    y += 4;
  }

  if (rules.length) {
    addTitle('Co-Parenting Rules');
    rules.forEach((rule) => {
      addLine(`${rule.title} [${rule.active ? 'ACTIVE' : 'INACTIVE'}]`, true);
      if (rule.description) addLine(rule.description);
      y += 2;
    });
  }

  doc.save(filename);
}
