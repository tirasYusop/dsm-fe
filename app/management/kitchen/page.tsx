"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api1";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import type { Kitchen } from "@/types/kitchen";
import PageHeader from "@/components/ui/page-header";

const emptyForm = {
  name: "",
  code: "",
  location: "",
  status: "active",
  status_note: "",
  username: "",
  password: "",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "closed", label: "Closed" },
];

export default function KitchenPage() {
  const router = useRouter();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Kitchen | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(
        Array.isArray(res.data)
          ? res.data
          : res.data.results
      );
      setListError(null);
    } catch (err: any) {
      setListError(err?.response?.data?.detail || "Failed to load kitchens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  };

  const openEditDialog = (kitchen: Kitchen, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(kitchen.id);
    setForm({
      name: kitchen.name,
      code: kitchen.code,
      location: kitchen.location || "",
      status: (kitchen as any).status || "active",
      status_note: (kitchen as any).status_note || "",
      username: "",
      password: "",
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        // 1. Update the kitchen's own fields
        await API.patch(`/kitchens/${editingId}/`, {
          name: form.name,
          code: form.code,
          location: form.location,
          status: form.status,
          status_note: form.status_note,
        });

        // 2. If username/password were touched, update credentials separately
        if (form.username || form.password) {
          await API.post(`/kitchens/${editingId}/update-credentials/`, {
            ...(form.username ? { username: form.username } : {}),
            ...(form.password ? { password: form.password } : {}),
          });
        }

        setOpen(false);
        await fetchKitchens();
      } else {
        const res = await API.post("/kitchens/", form);
        setOpen(false);
        await fetchKitchens();
        router.push(`/management/kitchen/${res.data.id}/qr`);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      const message =
        (typeof data === "string" && data) ||
        data?.name?.[0] ||
        data?.code?.[0] ||
        data?.username?.[0] ||
        data?.password?.[0] ||
        data?.error ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        "Failed to save kitchen";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (kitchen: Kitchen, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(kitchen);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/kitchens/${deleteTarget.id}/`);
      setDeleteTarget(null);
      await fetchKitchens();
    } catch (err: any) {
      setListError(err?.response?.data?.detail || "Failed to deactivate kitchen");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div>Loading kitchens...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dapur" subtitle="Urus dapur dan butiran dapur." />
      <div className="flex items-center justify-between">
        <Button onClick={openAddDialog}>+ Tambah Dapur</Button>
      </div>

      {listError && <p className="text-red-500 text-sm">{listError}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {kitchens.map((kitchen: any) => (
          <Card
            key={kitchen.id}
            className="cursor-pointer hover:shadow-lg"
            onClick={() => router.push(`/management/kitchen/${kitchen.id}/qr`)}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>{kitchen.name}</CardTitle>
                {kitchen.status && kitchen.status !== "active" && (
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      kitchen.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {kitchen.status === "maintenance" ? "Under Maintenance" : "Closed"}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={(e) => openEditDialog(kitchen, e)} title="Edit kitchen">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => handleDeleteClick(kitchen, e)} title="Deactivate kitchen">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>Code: {kitchen.code}</p>
              <p>Location: {kitchen.location}</p>
              {kitchen.status_note && (
                <p className="text-xs text-muted-foreground mt-1">{kitchen.status_note}</p>
              )}
              <Button className="mt-4 w-full">Lihat QR</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!listError && kitchens.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Tiada dapur — tekan "+ Tambah Dapur" untuk mendaftar dapur.
        </p>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setFormError(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kitchen" : "Register New Kitchen"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Dapur</Label>
              <Input name="name" placeholder="Nama Dapur" value={form.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Kod Dapur</Label>
              <Input name="code" placeholder="Kod Dapur" value={form.code} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Tempat</Label>
              <Input name="location" placeholder="Kota Kinabalu / Labuan / Sandakan" value={form.location} onChange={handleChange} />
            </div>

            {editingId && (
              <>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Note status (optional)</Label>
                  <Input
                    name="status_note"
                    placeholder="e.g. Closed for deep cleaning until Friday"
                    value={form.status_note}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {!editingId ? (
              <>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Kata Laluan</Label>
                  <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                </div>
              </>
            ) : (
              <div className="border-t pt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current username/password unchanged.
                </p>
                <div className="space-y-2">
                  <Label>New username</Label>
                  <Input name="username" placeholder="Leave blank to keep current" value={form.username} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input name="password" type="password" placeholder="Leave blank to keep current" value={form.password} onChange={handleChange} />
                </div>
              </div>
            )}

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Register Kitchen"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate "{deleteTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This kitchen will be hidden from the active list and its login disabled.
            Its history (shifts, inventory records) is kept, not deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}