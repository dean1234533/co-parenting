import db from '@/api/db';
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Baby, Plus, Pencil, Trash2, Camera, School, Stethoscope,
  Phone, AlertCircle, Pill, FileText, User,
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { motion } from "framer-motion";

const EMPTY_CHILD = {
  name: "",
  dateOfBirth: "",
  photo_url: "",
  schoolName: "",
  grade: "",
  teacherName: "",
  doctorName: "",
  doctorPhone: "",
  allergies: "",
  medications: "",
  emergencyContact: "",
  emergencyPhone: "",
  notes: "",
};

function age(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const years = differenceInYears(new Date(), d);
  if (years < 1) {
    const months = differenceInMonths(new Date(), d);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  return `${years} yr${years !== 1 ? "s" : ""}`;
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function ChildForm({ initial = EMPTY_CHILD, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...EMPTY_CHILD, ...initial });
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, photo_url: file_url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Photo + basic */}
      <div className="flex gap-4 items-start">
        <label className="relative cursor-pointer flex-shrink-0">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
              <Baby className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Camera className="h-3 w-3 text-primary-foreground" />
          </span>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
        <div className="flex-1 space-y-3">
          <div>
            <Label>Child's Name <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Emma" />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          </div>
        </div>
      </div>
      {uploading && <p className="text-xs text-muted-foreground">Uploading photo…</p>}

      {/* School */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <School className="h-4 w-4" /> School
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>School Name</Label>
            <Input value={form.schoolName} onChange={set("schoolName")} placeholder="Lincoln Elementary" />
          </div>
          <div>
            <Label>Grade / Year</Label>
            <Input value={form.grade} onChange={set("grade")} placeholder="Grade 3" />
          </div>
          <div className="col-span-2">
            <Label>Teacher</Label>
            <Input value={form.teacherName} onChange={set("teacherName")} placeholder="Ms. Johnson" />
          </div>
        </div>
      </div>

      {/* Medical */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Stethoscope className="h-4 w-4" /> Medical
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Doctor / Pediatrician</Label>
            <Input value={form.doctorName} onChange={set("doctorName")} placeholder="Dr. Smith" />
          </div>
          <div>
            <Label>Doctor's Phone</Label>
            <Input value={form.doctorPhone} onChange={set("doctorPhone")} placeholder="555-000-0000" />
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <div>
            <Label>Allergies</Label>
            <Textarea value={form.allergies} onChange={set("allergies")} placeholder="Peanuts, bee stings…" rows={2} />
          </div>
          <div>
            <Label>Medications</Label>
            <Textarea value={form.medications} onChange={set("medications")} placeholder="Medication name, dose, schedule…" rows={2} />
          </div>
        </div>
      </div>

      {/* Emergency */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Phone className="h-4 w-4" /> Emergency Contact
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Contact Name</Label>
            <Input value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="Grandma Sue" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.emergencyPhone} onChange={set("emergencyPhone")} placeholder="555-000-0000" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="flex items-center gap-1.5 mb-1.5">
          <FileText className="h-4 w-4 text-muted-foreground" /> Notes
        </Label>
        <Textarea value={form.notes} onChange={set("notes")} placeholder="Anything else both parents should know…" rows={3} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name.trim() || saving} className="flex-1">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function Children() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editChild, setEditChild] = useState(null);
  const [deleteChild, setDeleteChild] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: () => db.entities.Child.list("name"),
    onSuccess: (data) => {
      if (data.length > 0 && !activeTab) setActiveTab(data[0].id);
    },
  });

  // Keep active tab valid
  const displayedChildren = children;
  const safeTab = activeTab && displayedChildren.find((c) => c.id === activeTab)
    ? activeTab
    : displayedChildren[0]?.id ?? null;

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Child.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setAddOpen(false);
      setActiveTab(created.id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Child.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setEditChild(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Child.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setDeleteChild(null);
      setActiveTab(null);
    },
  });

  const current = displayedChildren.find((c) => c.id === safeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Children</h1>
          <p className="text-muted-foreground mt-1">Each child's profile in one place</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Child
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedChildren.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Baby className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-semibold">No children added yet</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                Add each child so both parents have their info — school, doctor, allergies and more — in one shared place.
              </p>
              <Button onClick={() => setAddOpen(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Your First Child
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Tabs value={safeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto flex-wrap gap-1 mb-2">
            {displayedChildren.map((child) => (
              <TabsTrigger key={child.id} value={child.id} className="gap-2">
                {child.photo_url ? (
                  <img src={child.photo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <Baby className="h-4 w-4" />
                )}
                {child.name}
                {child.dateOfBirth && (
                  <span className="text-xs opacity-60">{age(child.dateOfBirth)}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {displayedChildren.map((child) => (
            <TabsContent key={child.id} value={child.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Header card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-5">
                      {child.photo_url ? (
                        <img src={child.photo_url} alt={child.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Baby className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-heading font-bold">{child.name}</h2>
                        {child.dateOfBirth && (
                          <p className="text-muted-foreground text-sm mt-0.5">
                            Born {format(new Date(child.dateOfBirth), "MMMM d, yyyy")} · {age(child.dateOfBirth)} old
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditChild(child)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteChild(child)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* School */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <School className="h-4 w-4 text-primary" /> School
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {child.schoolName || child.grade || child.teacherName ? (
                        <>
                          <InfoRow icon={School} label="School" value={child.schoolName} />
                          <InfoRow icon={User} label="Grade / Year" value={child.grade} />
                          <InfoRow icon={User} label="Teacher" value={child.teacherName} />
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No school info added yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Medical */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" /> Medical
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {child.doctorName || child.doctorPhone || child.allergies || child.medications ? (
                        <>
                          <InfoRow icon={Stethoscope} label="Doctor" value={child.doctorName} />
                          <InfoRow icon={Phone} label="Doctor's Phone" value={child.doctorPhone} />
                          <InfoRow icon={AlertCircle} label="Allergies" value={child.allergies} />
                          <InfoRow icon={Pill} label="Medications" value={child.medications} />
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No medical info added yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {child.emergencyContact || child.emergencyPhone ? (
                        <>
                          <InfoRow icon={User} label="Name" value={child.emergencyContact} />
                          <InfoRow icon={Phone} label="Phone" value={child.emergencyPhone} />
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No emergency contact added yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {child.notes ? (
                        <p className="text-sm whitespace-pre-wrap">{child.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No notes yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" /> Add Child
            </DialogTitle>
          </DialogHeader>
          <ChildForm
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setAddOpen(false)}
            saving={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editChild} onOpenChange={(o) => !o && setEditChild(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit {editChild?.name}
            </DialogTitle>
          </DialogHeader>
          {editChild && (
            <ChildForm
              initial={editChild}
              onSave={(data) => updateMutation.mutate({ id: editChild.id, data })}
              onCancel={() => setEditChild(null)}
              saving={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteChild} onOpenChange={(o) => !o && setDeleteChild(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteChild?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteChild?.name}'s profile. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteChild.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
