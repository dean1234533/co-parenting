import db from '@/api/db';
import { generateAndDownloadPDF } from '@/lib/generateReport';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";

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
    queryFn: () => db.entities.ChatMessage.list("created_date", 200),
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
    try {
      generateAndDownloadPDF(
        {
          messages:  sections.messages  ? messages  : [],
          requests:  sections.requests  ? requests  : [],
          incidents: sections.incidents ? incidents : [],
          progress:  sections.progress  ? progress  : [],
          expenses:  sections.expenses  ? expenses  : [],
          events:    sections.events    ? events    : [],
          rules:     sections.rules     ? rules     : [],
        },
        'js-grw-up-report.pdf'
      );
    } finally {
      setGenerating(false);
    }
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