import db from '@/api/db';
import { sendPartnerNotification } from '@/lib/notify';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Camera, GraduationCap, Palette, Trophy, Star, BookOpen, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const categoryIcons = {
  homework: BookOpen,
  milestone: Star,
  school_report: GraduationCap,
  artwork: Palette,
  sports: Trophy,
  other: Sparkles,
};

const categoryColors = {
  homework: "bg-primary/10 text-primary",
  milestone: "bg-warning/10 text-warning",
  school_report: "bg-accent/10 text-accent",
  artwork: "bg-chart-4/10 text-chart-4",
  sports: "bg-success/10 text-success",
  other: "bg-muted text-muted-foreground",
};

export default function Progress() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    child_name: "", category: "", title: "", description: "", date: "", photo_urls: [],
  });
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => db.entities.ProgressEntry.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.ProgressEntry.create(data),
    onSuccess: (newItem) => {
      queryClient.setQueryData(["progress"], (old) => [newItem, ...(old || [])]);
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      setOpen(false);
      setForm({ child_name: "", category: "", title: "", description: "", date: "", photo_urls: [] });
      sendPartnerNotification({ title: 'New progress entry', body: `${currentUser?.full_name || 'Your co-parent'} logged a milestone${newItem.child_name ? ` for ${newItem.child_name}` : ''}: "${newItem.title}"` });
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
      posted_by: currentUser?.full_name || "Unknown",
    });
  };

  const filteredEntries = filter === "all" ? entries : entries.filter((e) => e.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Progress & Homework</h1>
          <p className="text-muted-foreground mt-1">Track schoolwork, milestones, and memories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">New Progress Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Child's Name</Label>
                  <Input value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} placeholder="Name" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="school_report">School Report</SelectItem>
                      <SelectItem value="artwork">Artwork</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's this about" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." />
              </div>
              <div>
                <Label>Photos / Images</Label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors mt-2">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload photos or images of work"}</span>
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
              <Button onClick={handleCreate} disabled={!form.child_name || !form.title || !form.category || createMutation.isPending} className="w-full">
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
          <TabsTrigger value="school_report">Reports</TabsTrigger>
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Entries Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No entries yet — start capturing those special moments!</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry, i) => {
            const Icon = categoryIcons[entry.category] || Sparkles;
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  {entry.photo_urls?.length > 0 && (
                    <div className="aspect-video overflow-hidden">
                      <img src={entry.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={categoryColors[entry.category]}>
                        <Icon className="h-3 w-3 mr-1" />
                        {entry.category?.replace("_", " ")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.child_name}</p>
                    {entry.description && <p className="text-sm mt-2 line-clamp-3">{entry.description}</p>}
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{entry.date && format(new Date(entry.date), "MMM d, yyyy")}</span>
                      <span>by {entry.posted_by}</span>
                    </div>
                    {entry.photo_urls?.length > 1 && (
                      <div className="flex gap-1.5 mt-3">
                        {entry.photo_urls.slice(1, 4).map((url, j) => (
                          <img key={j} src={url} alt="" className="w-12 h-12 object-cover rounded" />
                        ))}
                        {entry.photo_urls.length > 4 && (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            +{entry.photo_urls.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}