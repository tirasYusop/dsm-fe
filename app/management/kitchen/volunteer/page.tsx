"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableRow, TableCell } from "@/components/ui/table";
import { UserPlus, Trash2, Phone, GraduationCap, Building2 } from "lucide-react";
import PillTabs from "@/components/ui/pill-tabs";
import PaginationControls from "@/components/common/PaginationControls";
import type { Kitchen, VolunteerProfile } from "@/types/kitchen";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";

const COLUMNS = [
  { key: "bil", label: "Bil" },
  { key: "name", label: "Nama" },
  { key: "matrik", label: "Matrik no" },
  { key: "phone", label: "Phone" },
  { key: "faculty", label: "Fakulti" },
  { key: "kolej", label: "Kolej" },
  { key: "actions", label: "Tindakan", align: "right" as const },
];

const emptyForm = {
  name: "",
  matrik_no: "",
  phone_number: "",
  faculty: "",
  kolej: "",
};

export default function ManagementVolunteersPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalVolunteers / pageSize));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VolunteerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchKitchens = async () => {
    try {
      const res = await API.get<PaginatedResponse<Kitchen> | Kitchen[]>("/kitchens/");
      const kitchenData = getResults(res.data);
      setKitchens(kitchenData);
      if (kitchenData.length > 0) {
        setSelectedKitchen(String(kitchenData[0].id));
      }
    } catch (err) {
      console.log(err);
      setKitchens([]);
    }
  };

  const fetchVolunteers = async (kitchenId: string, currentPage = 1) => {
    setLoading(true);
    try {
      const res = await API.get<PaginatedResponse<VolunteerProfile> | VolunteerProfile[]>(`/volunteer-profiles/?kitchen=${kitchenId}&page=${currentPage}`);
      const results = getResults(res.data);
      const meta = getPageMeta(res.data, pageSize);

      setVolunteers(results);
      setTotalVolunteers(meta.count);
      setPageSize(meta.page_size);
      setNextPage(meta.next);
      setPreviousPage(meta.previous);
    } catch (err) {
      console.log(err);
      setVolunteers([]);
      setTotalVolunteers(0);
      setNextPage(null);
      setPreviousPage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKitchens(); }, []);

  useEffect(() => {
    if (selectedKitchen) {
      fetchVolunteers(selectedKitchen, page);
    }
  }, [selectedKitchen, page]);

  const kitchenTabs = useMemo(() => kitchens.map((k) => ({ value: String(k.id), label: k.code || k.name })), [kitchens]);
  const handleKitchenChange = (value: string) => { setSelectedKitchen(value); setPage(1); };

  const openAddDialog = () => {
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Sila masukkan nama");
      return;
    }
    if (!selectedKitchen) {
      setFormError("Sila pilih dapur");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await API.post("/volunteer-profiles/", {
        name: form.name,
        matrik_no: form.matrik_no,
        phone_number: form.phone_number,
        faculty: form.faculty,
        kolej: form.kolej,
        kitchen: selectedKitchen,
      });

      setOpen(false);
      fetchVolunteers(selectedKitchen, page);
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? "Failed to add volunteer");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (v: VolunteerProfile) => {
    setDeleteTarget(v);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/volunteer-profiles/${deleteTarget.id}/`);
      setDeleteTarget(null);

      if (volunteers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchVolunteers(selectedKitchen, page);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Failed to remove volunteer");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredVolunteers = search.trim()
    ? volunteers.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          (v.matrik_no ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : volunteers;

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-5">
        <PageHeader
          title="Pengurusan Sukarelawan"
          subtitle="Urus senarai sukarelawan mengikut dapur."
          action={
            <Button onClick={openAddDialog} className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Tambah Sukarelawan
            </Button>
          }
        />

        {/* Filters: stacked on mobile, side-by-side from sm: up */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto">
            <PillTabs options={kitchenTabs} value={selectedKitchen} onChange={handleKitchenChange} />
          </div>

          <input
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-xs"
            placeholder="Cari nama / matrik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Desktop / tablet: table, hidden below sm */}
        <div className="hidden sm:block">
          <DataTable
            columns={COLUMNS}
            data={filteredVolunteers}
            loading={loading}
            emptyMessage="Tiada sukarelawan yang mendaftar untuk dapur ini lagi."
            renderRow={(v, index) => (
              <TableRow key={v.id} className="border-t">
                <TableCell className="w-10 p-2">{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="p-2 font-medium">{v.name}</TableCell>
                <TableCell className="p-2">{v.matrik_no || "—"}</TableCell>
                <TableCell className="p-2">{v.phone_number || "—"}</TableCell>
                <TableCell className="p-2">{v.faculty || "—"}</TableCell>
                <TableCell className="p-2">{v.kolej || "—"}</TableCell>
                <TableCell className="p-2 text-right">
                  <button
                    onClick={() => handleDeleteClick(v)}
                    aria-label={`Remove ${v.name}`}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            )}
          />
        </div>

        {/* Mobile: stacked cards, hidden from sm up */}
        <div className="space-y-3 sm:hidden">
          {loading ? (
            <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              Tiada sukarelawan yang mendaftar untuk dapur ini lagi.
            </div>
          ) : (
            filteredVolunteers.map((v, index) => (
              <div key={v.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">#{(page - 1) * pageSize + index + 1}</p>
                    <p className="truncate font-semibold text-gray-900">{v.name}</p>
                    {v.matrik_no && (
                      <p className="truncate text-sm text-gray-500">{v.matrik_no}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(v)}
                    aria-label={`Remove ${v.name}`}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {(v.phone_number || v.faculty || v.kolej) && (
                  <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm text-gray-600">
                    {v.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{v.phone_number}</span>
                      </div>
                    )}
                    {v.faculty && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{v.faculty}</span>
                      </div>
                    )}
                    {v.kolej && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{v.kolej}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalVolunteers > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            totalCount={totalVolunteers}
            pageSize={pageSize}
            itemLabel="volunteers"
          />
        )}
      </div>

      {/* Add volunteer dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setFormError(null); }}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle>Tambah Sukarelawan</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input name="name" placeholder="Nama" value={form.name} onChange={handleFormChange} required />
            </div>

            <div className="space-y-2">
              <Label>Matrik no</Label>
              <Input name="matrik_no" placeholder="Matrik no" value={form.matrik_no} onChange={handleFormChange} />
            </div>

            <div className="space-y-2">
              <Label>No Telefon</Label>
              <Input name="phone_number" placeholder="No Telefon" value={form.phone_number} onChange={handleFormChange} />
            </div>

            <div className="space-y-2">
              <Label>Fakulti</Label>
              <Input name="faculty" placeholder="Fakulti" value={form.faculty} onChange={handleFormChange} />
            </div>

            <div className="space-y-2">
              <Label>Kolej</Label>
              <Input name="kolej" placeholder="Kolej" value={form.kolej} onChange={handleFormChange} />
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Adding..." : "Tambah Sukarelawan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Keluarkan "{deleteTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sukarelawan ini akan dikeluarkan daripada senarai dapur ini.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting} className="w-full sm:w-auto">
              {deleting ? "Removing..." : "Keluarkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}