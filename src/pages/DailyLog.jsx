import db from '@/api/db';
import { sendPartnerNotification } from '@/lib/notify';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Utensils, Tv, Pill, Moon, Smile, ChevronDown, ChevronUp, Sun } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const moodColors = {
  happy: "bg-success/10 text-success",
  okay: "bg-primary/10 text-primary",
  unsettled: "bg-warning/10 text-warning-foreground",
  upset: "bg-orange-100 text-orange-600",
  unwell: "bg-destructive/10 text-destructive",
};

const moodEmoji = {
  happy: "😊",
  okay: "🙂",
  unsettled: "😕",
  upset: "😢",
  unwell: "🤒",
};

const defaultForm = {
  child_name: "",
  log_date: format(new Date(), "yyyy-MM-dd"),
  meals: { breakfast: "", lunch: "", dinner: "", snacks: "" },
  tv_watched: "",
  screen_time_minutes: "",
  medicine_given: false,
  medicine_details: [],
  bedtime: "",
  wake_time: "",
  mood: "",
  notes: "",
};

function LogCard({ log }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-0">
          <button
            className="w-full p-5 text-left"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Sun className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{log.child_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {log.log_date ? format(new Date(log.log_date), "EEEE, MMMM d yyyy") : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.mood && (
                  <Badge variant="outline" className={`capitalize ${moodColors[log.mood]}`}>
                    {moodEmoji[log.mood]} {log.mood}
                  </Badge>
                )}
                {log.medicine_given && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-600">
                    💊 Medicine
                  </Badge>
                )}
                {log.bedtime && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600">
                    🌙 {log.bedtime}
                  </Badge>
                )}
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Meals */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Utensils className="h-4 w-4 text-primary" /> Meals
                    </div>
                    {log.meals?.breakfast && <p className="text-sm"><span className="text-muted-foreground">Breakfast: </span>{log.meals.breakfast}</p>}
                    {log.meals?.lunch && <p className="text-sm"><span className="text-muted-foreground">Lunch: </span>{log.meals.lunch}</p>}
                    {log.meals?.dinner && <p className="text-sm"><span className="text-muted-foreground">Dinner: </span>{log.meals.dinner}</p>}
                    {log.meals?.snacks && <p className="text-sm"><span className="text-muted-foreground">Snacks: </span>{log.meals.snacks}</p>}
                    {!log.meals?.breakfast && !log.meals?.lunch && !log.meals?.dinner && !log.meals?.snacks && (
                      <p className="text-sm text-muted-foreground">Not logged</p>
                    )}
                  </div>

                  {/* Screen time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Tv className="h-4 w-4 text-primary" /> Screen Time
                    </div>
                    {log.tv_watched ? <p className="text-sm">{log.tv_watched}</p> : <p className="text-sm text-muted-foreground">Not logged</p>}
                    {log.screen_time_minutes && <p className="text-sm text-muted-foreground">{log.screen_time_minutes} mins total</p>}
                  </div>

                  {/* Medicine */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Pill className="h-4 w-4 text-primary" /> Medicine
                    </div>
                    {log.medicine_given && log.medicine_details?.length > 0 ? (
                      log.medicine_details.map((m, i) => (
                        <p key={i} className="text-sm">{m.name} — {m.dose} at {m.time}</p>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{log.medicine_given ? "Given (no details)" : "None given"}</p>
                    )}
                  </div>

                  {/* Sleep */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Moon className="h-4 w-4 text-primary" /> Sleep
                    </div>
                    {log.wake_time && <p className="text-sm"><span className="text-muted-foreground">Woke up: </span>{log.wake_time}</p>}
                    {log.bedtime && <p className="text-sm"><span className="text-muted-foreground">Bedtime: </span>{log.bedtime}</p>}
                    {!log.wake_time && !log.bedtime && <p className="text-sm text-muted-foreground">Not logged</p>}
                  </div>
                </div>

                {log.notes && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground italic">📝 {log.notes}</p>
                  </div>
                )}
                <div className="px-5 pb-4">
                  <p className="text-xs text-muted-foreground">Logged by {log.logged_by}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DailyLog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [medicines, setMedicines] = useState([]);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["daily-logs"],
    queryFn: () => db.entities.DailyLog.list("-log_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.DailyLog.create(data),
    onSuccess: (newItem) => {
      queryClient.setQueryData(["daily-logs"], (old) => [newItem, ...(old || [])]);
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
      setOpen(false);
      setForm(defaultForm);
      setMedicines([]);
      sendPartnerNotification({ title: 'New daily log', body: `${currentUser?.full_name || 'Your co-parent'} added a daily log${newItem.child_name ? ` for ${newItem.child_name}` : ''}` });
    },
  });

  const addMedicine = () => setMedicines([...medicines, { name: "", dose: "", time: "" }]);
  const updateMedicine = (i, field, value) => {
    const updated = [...medicines];
    updated[i][field] = value;
    setMedicines(updated);
  };
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));

  const handleSave = () => {
    createMutation.mutate({
      ...form,
      screen_time_minutes: form.screen_time_minutes ? Number(form.screen_time_minutes) : undefined,
      medicine_details: medicines,
      logged_by: currentUser?.full_name || "Unknown",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Daily Log</h1>
          <p className="text-muted-foreground mt-1">Track meals, screen time, medicine, and bedtime</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Today's Log</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Daily Log Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Child's Name</Label>
                  <Input value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} placeholder="e.g. Emma" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Mood</Label>
                  <Select value={form.mood} onValueChange={(v) => setForm({ ...form, mood: v })}>
                    <SelectTrigger><SelectValue placeholder="How were they?" /></SelectTrigger>
                    <SelectContent>
                      {["happy", "okay", "unsettled", "upset", "unwell"].map((m) => (
                        <SelectItem key={m} value={m}>{moodEmoji[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div />
              </div>

              {/* Meals */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Meals</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Breakfast" value={form.meals.breakfast} onChange={(e) => setForm({ ...form, meals: { ...form.meals, breakfast: e.target.value } })} />
                  <Input placeholder="Lunch" value={form.meals.lunch} onChange={(e) => setForm({ ...form, meals: { ...form.meals, lunch: e.target.value } })} />
                  <Input placeholder="Dinner" value={form.meals.dinner} onChange={(e) => setForm({ ...form, meals: { ...form.meals, dinner: e.target.value } })} />
                  <Input placeholder="Snacks" value={form.meals.snacks} onChange={(e) => setForm({ ...form, meals: { ...form.meals, snacks: e.target.value } })} />
                </div>
              </div>

              {/* TV / Screen */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tv className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Screen Time</Label>
                </div>
                <Input className="mb-2" placeholder="What did they watch? e.g. Bluey, PAW Patrol" value={form.tv_watched} onChange={(e) => setForm({ ...form, tv_watched: e.target.value })} />
                <Input type="number" placeholder="Total screen time (minutes)" value={form.screen_time_minutes} onChange={(e) => setForm({ ...form, screen_time_minutes: e.target.value })} />
              </div>

              {/* Medicine */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Medicine</Label>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Switch checked={form.medicine_given} onCheckedChange={(v) => setForm({ ...form, medicine_given: v })} />
                  <span className="text-sm">Medicine was given</span>
                </div>
                {form.medicine_given && (
                  <div className="space-y-2">
                    {medicines.map((med, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        <Input placeholder="Medicine name" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} />
                        <Input placeholder="Dose" value={med.dose} onChange={(e) => updateMedicine(i, "dose", e.target.value)} />
                        <div className="flex gap-1">
                          <Input placeholder="Time" value={med.time} onChange={(e) => updateMedicine(i, "time", e.target.value)} />
                          <Button size="icon" variant="ghost" onClick={() => removeMedicine(i)} className="flex-shrink-0 text-destructive hover:text-destructive">×</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addMedicine}>+ Add medicine</Button>
                  </div>
                )}
              </div>

              {/* Sleep */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Moon className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Sleep</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Woke up</Label>
                    <Input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bedtime</Label>
                    <Input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Any other notes</Label>
                <Textarea placeholder="Anything else to mention about the day..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <Button onClick={handleSave} disabled={!form.child_name || !form.log_date || createMutation.isPending} className="w-full">
                Save Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No daily logs yet — add today's entry!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => <LogCard key={log.id} log={log} />)}
        </div>
      )}
    </div>
  );
}