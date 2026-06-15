import db from '@/api/db';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, Camera, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const CATEGORIES = [
  "mortgage", "rent", "child_maintenance", "school_fees", "clothing",
  "food", "medical", "activities", "childcare", "utilities", "other"
];

export default function Receipts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", date: "", category: "", receipt_url: "", paid_by: "" });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  // Reuse Expense entity for receipts (filtered to ones with receipt_url)
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: () => db.entities.Expense.list("-date", 100),
  });

  const receipts = expenses.filter((e) => e.receipt_url);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      setForm({ title: "", amount: "", date: "", category: "", receipt_url: "", paid_by: "" });
    },
  });

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, receipt_url: file_url }));
    setUploading(false);
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      amount: parseFloat(form.amount) || 0,
      paid_by: form.paid_by || currentUser?.full_name || "Unknown",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Receipts</h1>
          <p className="text-muted-foreground mt-1">Upload receipts to show what money was spent on</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Upload Receipt</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">New Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>What Was It For</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kids' school shoes" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount (£)</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Paid By</Label>
                <Input value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} placeholder="Who paid" />
              </div>
              <div>
                <Label>Receipt Photo</Label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors mt-2">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Take or upload receipt photo"}</span>
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                </label>
                {form.receipt_url && (
                  <img src={form.receipt_url} alt="Receipt" className="mt-3 w-full max-h-48 object-contain rounded-lg border" />
                )}
              </div>
              <Button onClick={handleCreate} disabled={!form.title || !form.receipt_url || createMutation.isPending} className="w-full">
                Save Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Receipts Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : receipts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No receipts uploaded yet</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <a href={r.receipt_url} target="_blank" rel="noopener noreferrer">
                    <img src={r.receipt_url} alt="Receipt" className="w-full h-full object-contain hover:opacity-80 transition-opacity" />
                  </a>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary">£{r.amount?.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{r.category?.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{r.date && format(new Date(r.date), "MMM d, yyyy")}</span>
                    <span>Paid by {r.paid_by}</span>
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