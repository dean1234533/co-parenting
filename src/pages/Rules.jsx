import db from '@/api/db';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, BookOpen, Shield, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  communication: "bg-primary/10 text-primary",
  schedule: "bg-accent/10 text-accent",
  financial: "bg-warning/10 text-warning",
  medical: "bg-destructive/10 text-destructive",
  education: "bg-chart-4/10 text-chart-4",
  general: "bg-muted text-muted-foreground",
};

export default function Rules() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general" });
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: () => db.entities.CoParentingRule.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.CoParentingRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setOpen(false);
      setForm({ title: "", description: "", category: "general" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => db.entities.CoParentingRule.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rules"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.CoParentingRule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rules"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Co-Parenting Rules</h1>
          <p className="text-muted-foreground mt-1">Agreed rules and guidelines for both parents</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">New Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rule</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 24 hours notice for changes" />
              </div>
              <div>
                <Label>Details</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Full explanation of this rule..." />
              </div>
              <Button onClick={() => createMutation.mutate({ ...form, active: true })} disabled={!form.title || !form.description || createMutation.isPending} className="w-full">
                Save Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default rules info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Built-in Rule</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Any schedule changes, holiday requests, or other modifications must be communicated at least <strong>24 hours in advance</strong>. This is enforced automatically in the Requests section.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No custom rules added yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={!rule.active ? "opacity-60" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-muted flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold">{rule.title}</h3>
                          <Badge variant="outline" className={`mt-1 capitalize ${categoryColors[rule.category]}`}>
                            {rule.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{rule.active ? "Active" : "Inactive"}</span>
                            <Switch
                              checked={rule.active}
                              onCheckedChange={(v) => toggleMutation.mutate({ id: rule.id, active: v })}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{rule.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}