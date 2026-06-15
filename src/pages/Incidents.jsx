import db from '@/api/db';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, AlertTriangle, Camera, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const severityColors = {
  minor: "bg-success/10 text-success border-success/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  serious: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Incidents() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    child_name: "", incident_date: "", description: "", injury_type: "",
    severity: "minor", action_taken: "", medical_attention: false, photo_urls: [],
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => db.entities.IncidentReport.list("-incident_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.IncidentReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setOpen(false);
      setForm({ child_name: "", incident_date: "", description: "", injury_type: "", severity: "minor", action_taken: "", medical_attention: false, photo_urls: [] });
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setForm((prev) => ({ ...prev, photo_urls: [...prev.photo_urls, ...urls] }));
    setUploading(false);
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      reported_by: currentUser?.full_name || "Unknown",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Incident Reports</h1>
          <p className="text-muted-foreground mt-1">Log any accidents, injuries, or health concerns</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive"><Plus className="h-4 w-4 mr-2" /> Report Incident</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Report an Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Child's Name</Label>
                  <Input value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} placeholder="Name" />
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Injury Type</Label>
                  <Select value={form.injury_type} onValueChange={(v) => setForm({ ...form, injury_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["bump", "cut", "bruise", "burn", "fall", "illness", "allergic_reaction", "other"].map((t) => (
                        <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>What Happened</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened..." />
              </div>
              <div>
                <Label>Action Taken</Label>
                <Textarea value={form.action_taken} onChange={(e) => setForm({ ...form, action_taken: e.target.value })} placeholder="What did you do about it..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.medical_attention} onCheckedChange={(v) => setForm({ ...form, medical_attention: v })} />
                <Label>Medical attention needed / sought</Label>
              </div>
              <div>
                <Label>Photos</Label>
                <div className="mt-2">
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload photos"}</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {form.photo_urls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {form.photo_urls.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={!form.child_name || !form.description || createMutation.isPending} className="w-full">
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : incidents.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No incidents reported — that's good news!</CardContent></Card>
        ) : (
          incidents.map((inc, i) => (
            <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-destructive/10 flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold">{inc.child_name} — {inc.injury_type?.replace("_", " ")}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {inc.incident_date && format(new Date(inc.incident_date), "MMM d, yyyy h:mm a")}
                            {" • "}Reported by {inc.reported_by}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={severityColors[inc.severity]}>{inc.severity}</Badge>
                          {inc.medical_attention && <Badge variant="destructive">Medical</Badge>}
                        </div>
                      </div>
                      <p className="text-sm mt-3">{inc.description}</p>
                      {inc.action_taken && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded-lg"><strong>Action:</strong> {inc.action_taken}</p>
                      )}
                      {inc.photo_urls?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {inc.photo_urls.map((url, j) => (
                            <a key={j} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}