import db from '@/api/db';
import { sendPartnerNotification } from '@/lib/notify';

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, X, Clock, AlertCircle, Plane, CalendarDays, MoreHorizontal, ShieldAlert } from "lucide-react";
import { containsProfanity } from "@/lib/profanityFilter";
import { format, differenceInHours, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons = {
  running_late: Clock,
  holiday: Plane,
  schedule_change: CalendarDays,
  other: MoreHorizontal,
};

const typeLabels = {
  running_late: "Running Late",
  holiday: "Holiday",
  schedule_change: "Schedule Change",
  other: "Other",
};

export default function Requests() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "", title: "", description: "", date_from: "", date_to: "" });
  const [ruleWarning, setRuleWarning] = useState("");
  const [requests, setRequests] = useState([]);
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const currentUser = { id: user?.id, full_name: profile?.displayName };

  // Real-time listener so both users see updates the instant they happen
  useEffect(() => {
    const familyId = profile?.familyId;
    if (!familyId) return;

    const q = query(
      collection(firestore, 'requests'),
      where('familyId', '==', familyId),
      orderBy('created_date', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [profile?.familyId]);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Request.create(data),
    onSuccess: (newItem) => {
      queryClient.setQueryData(["requests"], (old) => [newItem, ...(old || [])]);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setOpen(false);
      setForm({ type: "", title: "", description: "", date_from: "", date_to: "" });
      setRuleWarning("");
      sendPartnerNotification({
        title: 'New Request',
        body: `${profile?.displayName || 'Your co-parent'} has submitted a new request`,
        data: { type: 'request' },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Request.update(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      if (data.status === "denied") {
        sendPartnerNotification({
          title: 'Request Denied',
          body: `Your request was denied. Reason: ${data.response_note}. Check the Denied tab for details.`,
          data: { type: 'request' },
        });
      } else if (data.status === "approved") {
        sendPartnerNotification({
          title: 'Request Approved',
          body: `Your request has been approved`,
          data: { type: 'request' },
        });
      }
    },
  });

  const handleCreate = () => {
    // Check 24-hour rule
    if (form.date_from && form.type !== "running_late") {
      const hoursUntil = differenceInHours(parseISO(form.date_from), new Date());
      if (hoursUntil < 24) {
        setRuleWarning("Rule: Changes must be communicated at least 24 hours in advance. This request is less than 24 hours away.");
        return;
      }
    }

    createMutation.mutate({
      ...form,
      requester_name: profile?.displayName || "Unknown",
      familyId: profile?.familyId,
      status: "pending",
    });
  };

  const handleRespond = (id, status, note) => {
    updateMutation.mutate({ id, data: { status, response_note: note || "" } });
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const deniedRequests = requests.filter((r) => r.status === "denied");
  const approvedRequests = requests.filter((r) => r.status === "approved");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Requests & Approvals</h1>
          <p className="text-muted-foreground mt-1">Late notices, holidays, schedule changes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Request</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">New Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running_late">Running Late</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="schedule_change">Schedule Change</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief description" />
              </div>
              <div>
                <Label>Details</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Full details..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>From Date</Label>
                  <Input type="date" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} />
                </div>
                <div>
                  <Label>To Date (optional)</Label>
                  <Input type="date" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} />
                </div>
              </div>
              {ruleWarning && (
                <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>{ruleWarning}</p>
                </div>
              )}
              <Button onClick={handleCreate} disabled={!form.type || !form.title || createMutation.isPending} className="w-full">
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingRequests.length > 0 && <Badge className="ml-2 bg-warning text-warning-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="denied">
            Denied {deniedRequests.length > 0 && <Badge className="ml-2 bg-destructive text-destructive-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">{deniedRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-3">
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending requests</p>
              ) : (
                pendingRequests.map((req) => (
                  <RequestCard key={req.id} request={req} onRespond={handleRespond} currentUser={currentUser} />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="denied" className="mt-4">
          <div className="space-y-3">
            {deniedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No denied requests</p>
            ) : (
              <>
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>These requests were denied. The reason for each denial is shown below. A denial is only valid if there is a genuine reason — if your co-parent has followed the agreed rules, the request should have been approved.</p>
                </div>
                {deniedRequests.map((req) => (
                  <RequestCard key={req.id} request={req} currentUser={currentUser} />
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-3">
            {approvedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No approved requests</p>
            ) : (
              approvedRequests.map((req) => (
                <RequestCard key={req.id} request={req} currentUser={currentUser} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RequestCard({ request, onRespond, currentUser }) {
  const [approveNote, setApproveNote] = useState("");
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [denyError, setDenyError] = useState("");
  const Icon = typeIcons[request.type] || MoreHorizontal;
  const isOwn = request.created_by_id === currentUser?.id;

  const handleDenySubmit = () => {
    const trimmed = denyReason.trim();
    if (trimmed.length < 20) {
      setDenyError("Please provide a detailed reason (at least 20 characters).");
      return;
    }
    if (containsProfanity(trimmed)) {
      setDenyError("Your reason contains inappropriate language. Please keep it respectful.");
      return;
    }
    onRespond(request.id, "denied", trimmed);
    setShowDenyDialog(false);
    setDenyReason("");
    setDenyError("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {typeLabels[request.type]} • by {request.requester_name || "Unknown"}
                  </p>
                </div>
                <Badge
                  variant={request.status === "approved" ? "default" : request.status === "denied" ? "destructive" : "outline"}
                  className={request.status === "approved" ? "bg-success" : request.status === "pending" ? "bg-warning/10 text-warning border-warning/20" : ""}
                >
                  {request.status}
                </Badge>
              </div>

              {request.description && <p className="text-sm mt-2">{request.description}</p>}

              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {request.date_from && <span>From: {format(new Date(request.date_from), "MMM d, yyyy")}</span>}
                {request.date_to && <span>To: {format(new Date(request.date_to), "MMM d, yyyy")}</span>}
              </div>

              {/* Approval note */}
              {request.status === "approved" && request.response_note && (
                <p className="text-sm mt-2 p-2 bg-success/10 text-success rounded-lg italic">"{request.response_note}"</p>
              )}

              {/* Denial reason — shown prominently to both parties */}
              {request.status === "denied" && request.response_note && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-semibold text-destructive mb-1 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Reason for denial
                  </p>
                  <p className="text-sm text-foreground">"{request.response_note}"</p>
                </div>
              )}

              {/* Respond controls — only visible to the other person on pending requests */}
              {request.status === "pending" && !isOwn && onRespond && (
                <div className="mt-3 space-y-2">
                  <Input
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    placeholder="Add a note when approving (optional)..."
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onRespond(request.id, "approved", approveNote)} className="bg-success hover:bg-success/90">
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setShowDenyDialog(true)}>
                      <X className="h-3 w-3 mr-1" /> Deny
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deny reason dialog */}
      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Reason for Denial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning-foreground">
              <p className="font-semibold mb-1">Important</p>
              <p>You may only deny this request if you have a <strong>valid reason</strong>. If your co-parent has followed the agreed co-parenting rules, you do not have the right to deny their request without justification.</p>
            </div>
            <div>
              <Label>Your reason <span className="text-destructive">*</span></Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Explain clearly why you are denying this request..."
                value={denyReason}
                onChange={(e) => { setDenyReason(e.target.value); setDenyError(""); }}
              />
              <p className="text-xs text-muted-foreground mt-1">{denyReason.trim().length} / 20 characters minimum</p>
            </div>
            {denyError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {denyError}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowDenyDialog(false); setDenyReason(""); setDenyError(""); }}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDenySubmit}>
                Submit Denial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}