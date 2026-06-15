import db from '@/api/db';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

export default function ExportPDF() {
  const [sections, setSections] = useState({
    messages: true,
    requests: true,
    incidents: true,
    progress: true,
    expenses: true,
    events: true,
    rules: true,
  });
  const [generating, setGenerating] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: () => db.entities.ChatMessage.list("-created_date", 200),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => db.entities.Request.list("-created_date", 200),
  });
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => db.entities.IncidentReport.list("-incident_date", 200),
  });
  const { data: progress = [] } = useQuery({
    queryKey: ["progress"],
    queryFn: () => db.entities.ProgressEntry.list("-created_date", 200),
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => db.entities.Expense.list("-date", 200),
  });
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => db.entities.CalendarEvent.list("-date", 200),
  });
  const { data: rules = [] } = useQuery({
    queryKey: ["rules"],
    queryFn: () => db.entities.CoParentingRule.list("-created_date", 50),
  });

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = () => {
    setGenerating(true);
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    const addTitle = (text) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(text, margin, y);
      y += 10;
      doc.setDrawColor(59, 130, 246);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
      y += 4;
    };

    const addLine = (text) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 2;
    };

    const addBoldLine = (text) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 2;
      doc.setFont(undefined, "normal");
    };

    // Header
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("CoParent — Full Report", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, margin, y);
    y += 15;

    // Messages
    if (sections.messages && messages.length > 0) {
      addTitle("Messages");
      [...messages].reverse().forEach((msg) => {
        const time = msg.created_date ? format(new Date(msg.created_date), "MMM d, h:mm a") : "";
        addBoldLine(`${msg.sender_name || "Unknown"} (${time}):`);
        addLine(msg.content);
        y += 2;
      });
      y += 5;
    }

    // Requests
    if (sections.requests && requests.length > 0) {
      addTitle("Requests & Approvals");
      requests.forEach((req) => {
        addBoldLine(`${req.title} [${req.status?.toUpperCase()}]`);
        addLine(`Type: ${req.type?.replace("_", " ")} | By: ${req.requester_name || "Unknown"}`);
        if (req.description) addLine(req.description);
        if (req.response_note) addLine(`Response: ${req.response_note}`);
        y += 3;
      });
      y += 5;
    }

    // Incidents
    if (sections.incidents && incidents.length > 0) {
      addTitle("Incident Reports");
      incidents.forEach((inc) => {
        const date = inc.incident_date ? format(new Date(inc.incident_date), "MMM d, yyyy") : "";
        addBoldLine(`${inc.child_name} — ${inc.injury_type?.replace("_", " ")} (${date})`);
        addLine(`Severity: ${inc.severity} | Reported by: ${inc.reported_by}`);
        addLine(inc.description);
        if (inc.action_taken) addLine(`Action: ${inc.action_taken}`);
        if (inc.medical_attention) addLine("Medical attention required: Yes");
        y += 3;
      });
      y += 5;
    }

    // Progress
    if (sections.progress && progress.length > 0) {
      addTitle("Progress & Homework");
      progress.forEach((entry) => {
        addBoldLine(`${entry.title} — ${entry.child_name}`);
        addLine(`Category: ${entry.category?.replace("_", " ")} | Date: ${entry.date ? format(new Date(entry.date), "MMM d, yyyy") : "N/A"}`);
        if (entry.description) addLine(entry.description);
        y += 3;
      });
      y += 5;
    }

    // Expenses
    if (sections.expenses && expenses.length > 0) {
      addTitle("Financial Records");
      const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      addBoldLine(`Total: £${total.toFixed(2)}`);
      y += 2;
      expenses.forEach((exp) => {
        const date = exp.date ? format(new Date(exp.date), "MMM d, yyyy") : "";
        addLine(`${date} — ${exp.title} — £${exp.amount?.toFixed(2)} (${exp.category?.replace(/_/g, " ")}) — Paid by ${exp.paid_by}`);
      });
      y += 5;
    }

    // Events
    if (sections.events && events.length > 0) {
      addTitle("Calendar Events");
      events.forEach((evt) => {
        const date = evt.date ? format(new Date(evt.date), "MMM d, yyyy") : "";
        addLine(`${date} ${evt.time || ""} — ${evt.title} (${evt.event_type}) — Added by ${evt.added_by}`);
      });
      y += 5;
    }

    // Rules
    if (sections.rules && rules.length > 0) {
      addTitle("Co-Parenting Rules");
      rules.forEach((rule) => {
        addBoldLine(`${rule.title} [${rule.active ? "ACTIVE" : "INACTIVE"}]`);
        addLine(rule.description);
        y += 3;
      });
    }

    doc.save("coparent-report.pdf");
    setGenerating(false);
  };

  const sectionOptions = [
    { key: "messages", label: "Messages", count: messages.length },
    { key: "requests", label: "Requests & Approvals", count: requests.length },
    { key: "incidents", label: "Incident Reports", count: incidents.length },
    { key: "progress", label: "Progress & Homework", count: progress.length },
    { key: "expenses", label: "Financial Records", count: expenses.length },
    { key: "events", label: "Calendar Events", count: events.length },
    { key: "rules", label: "Rules", count: rules.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Export to PDF</h1>
        <p className="text-muted-foreground mt-1">Download everything as a PDF document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Select Sections to Include
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={sections[option.key]}
                    onCheckedChange={() => toggleSection(option.key)}
                    id={option.key}
                  />
                  <Label htmlFor={option.key} className="cursor-pointer font-medium">{option.label}</Label>
                </div>
                <span className="text-sm text-muted-foreground">{option.count} records</span>
              </div>
            ))}
          </div>

          <Button onClick={generatePDF} disabled={generating} className="w-full mt-6" size="lg">
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> Download PDF Report</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}