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
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";

const eventTypeColors = {
  pickup: "bg-primary text-primary-foreground",
  dropoff: "bg-accent text-accent-foreground",
  school: "bg-warning text-warning-foreground",
  medical: "bg-destructive text-destructive-foreground",
  activity: "bg-chart-4 text-white",
  holiday: "bg-success text-success-foreground",
  birthday: "bg-chart-5 text-white",
  other: "bg-muted-foreground text-white",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", event_type: "", child_name: "" });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => db.entities.CalendarEvent.list("-date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.CalendarEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      setOpen(false);
      setForm({ title: "", description: "", date: "", time: "", event_type: "", child_name: "" });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      added_by: currentUser?.full_name || "Unknown",
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month
  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null).concat(days);

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter((e) => e.date && isSameDay(new Date(e.date), date));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">Shared schedule for pickups, drop-offs, and events</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Event Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["pickup", "dropoff", "school", "medical", "activity", "holiday", "birthday", "other"].map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <Label>Time (optional)</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Child (optional)</Label>
                <Input value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} placeholder="Which child" />
              </div>
              <div>
                <Label>Details (optional)</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="More info..." />
              </div>
              <Button onClick={handleCreate} disabled={!form.title || !form.date || !form.event_type || createMutation.isPending} className="w-full">
                Save Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="font-heading text-xl">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">{day}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 min-h-[60px] rounded-lg text-left transition-all text-sm
                      ${isToday(day) ? "bg-primary/10 font-bold" : "hover:bg-muted"}
                      ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
                      ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}
                    `}
                  >
                    <span className={isToday(day) ? "text-primary" : ""}>{format(day, "d")}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[e.event_type]?.split(" ")[0] || "bg-primary"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-sm text-center py-4">Click on a day to see events</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No events on this day</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((evt) => (
                  <motion.div key={evt.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={eventTypeColors[evt.event_type]} variant="secondary">
                          {evt.event_type}
                        </Badge>
                        {evt.time && <span className="text-xs text-muted-foreground">{evt.time}</span>}
                      </div>
                      <h4 className="font-semibold text-sm">{evt.title}</h4>
                      {evt.child_name && <p className="text-xs text-muted-foreground mt-0.5">{evt.child_name}</p>}
                      {evt.description && <p className="text-xs mt-1">{evt.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Added by {evt.added_by}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}