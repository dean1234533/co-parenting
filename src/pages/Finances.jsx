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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, PoundSterling, TrendingUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const CATEGORIES = [
  "mortgage", "rent", "child_maintenance", "school_fees", "clothing",
  "food", "medical", "activities", "childcare", "utilities", "other"
];

export default function Finances() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "", title: "", amount: "", date: "", paid_by: "", notes: "",
    recurring: false, recurring_frequency: "",
  });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => db.auth.me(),
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => db.entities.Expense.list("-date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      setForm({ category: "", title: "", amount: "", date: "", paid_by: "", notes: "", recurring: false, recurring_frequency: "" });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      amount: parseFloat(form.amount) || 0,
      paid_by: form.paid_by || currentUser?.full_name || "Unknown",
    });
  };

  // Calculate totals
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const recurringExpenses = expenses.filter((e) => e.recurring);
  const monthlyRecurring = recurringExpenses.reduce((sum, e) => {
    if (e.recurring_frequency === "weekly") return sum + (e.amount || 0) * 4;
    if (e.recurring_frequency === "yearly") return sum + (e.amount || 0) / 12;
    return sum + (e.amount || 0);
  }, 0);

  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Financial Hub</h1>
          <p className="text-muted-foreground mt-1">Track all expenses, maintenance, and costs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>What For</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. School uniform" />
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
                <Label>Paid By</Label>
                <Input value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} placeholder="Who paid" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional info..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.recurring} onCheckedChange={(v) => setForm({ ...form, recurring: v })} />
                <Label>Recurring expense</Label>
              </div>
              {form.recurring && (
                <div>
                  <Label>Frequency</Label>
                  <Select value={form.recurring_frequency} onValueChange={(v) => setForm({ ...form, recurring_frequency: v })}>
                    <SelectTrigger><SelectValue placeholder="How often" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleCreate} disabled={!form.title || !form.amount || !form.category || createMutation.isPending} className="w-full">
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <PoundSterling className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Recorded</p>
              <p className="text-2xl font-bold font-heading">£{totalSpent.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <RefreshCw className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Recurring</p>
              <p className="text-2xl font-bold font-heading">£{monthlyRecurring.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold font-heading">{Object.keys(byCategory).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">By Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory).sort(([,a], [,b]) => b - a).map(([cat, total]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-primary" />
                    <span className="text-sm font-medium capitalize">{cat.replace(/_/g, " ")}</span>
                  </div>
                  <span className="font-semibold">£{total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="font-heading text-lg">All Expenses</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-sm">{exp.date && format(new Date(exp.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{exp.title}</span>
                        {exp.recurring && <Badge variant="outline" className="ml-2 text-xs"><RefreshCw className="h-3 w-3 mr-1" />{exp.recurring_frequency}</Badge>}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{exp.category?.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-sm">{exp.paid_by}</TableCell>
                      <TableCell className="text-right font-semibold">£{exp.amount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}