"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableRow, TableCell } from "@/components/ui/table";
import { UserPlus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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

  const [name, setName] = useState("");
  const [matrikNo, setMatrikNo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faculty, setFaculty] = useState("");
  const [kolej, setKolej] = useState("");
  const [saving, setSaving] = useState(false);

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
      const res = await API.get<PaginatedResponse<VolunteerProfile> | VolunteerProfile[]>(
        `/volunteer-profiles/?kitchen=${kitchenId}&page=${currentPage}`
      );
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

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    if (selectedKitchen) {
      fetchVolunteers(selectedKitchen, page);
    }
  }, [selectedKitchen, page]);

  const handleAdd = async () => {
    if (!name.trim()) {
      alert("Sila masukkan nama");
      return;
    }
    if (!selectedKitchen) {
      alert("Sila pilih dapur");
      return;
    }

    setSaving(true);
    try {
      await API.post("/volunteer-profiles/", {
        name,
        matrik_no: matrikNo,
        phone_number: phoneNumber,
        faculty,
        kolej,
        kitchen: selectedKitchen,
      });

      setName("");
      setMatrikNo("");
      setPhoneNumber("");
      setFaculty("");
      setKolej("");

      fetchVolunteers(selectedKitchen, page);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Failed to add volunteer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Keluarkan sukarelawan ini daripada senarai?")) {
      return;
    }

    try {
      await API.delete(`/volunteer-profiles/${id}/`);

      if (volunteers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchVolunteers(selectedKitchen, page);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Failed to remove volunteer");
    }
  };

  const handleKitchenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKitchen(e.target.value);
    setPage(1);
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
        <PageHeader title="Pengurusan Sukarelawan" subtitle="Urus senarai sukarelawan mengikut dapur." />

        <div className="flex flex-col gap-3 sm:flex-row justify-between ">
          <label className="block text-sm font-medium text-gray-700">Dapur</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-fit"
            value={selectedKitchen}
            onChange={handleKitchenChange}
          >
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <UserPlus className="h-4 w-4 text-gray-400" />
              Tambah Sukarelawan
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Matrik no"
                value={matrikNo}
                onChange={(e) => setMatrikNo(e.target.value.toUpperCase())}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="No Telefon"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.toUpperCase())}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Fakulti"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value.toUpperCase())}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Kolej"
                value={kolej}
                onChange={(e) => setKolej(e.target.value.toUpperCase())}
              />
            </div>

            <Button className="mt-5 w-full  sm:w-auto sm:self-end" onClick={handleAdd} disabled={saving}>
              {saving ? "Adding..." : "Tambah Sukarelawan"}
            </Button>
          </CardContent>
        </Card>

        <input
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Cari nama / matrik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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
                  onClick={() => handleDelete(v.id)}
                  aria-label={`Remove ${v.name}`}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          )}
        />

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
    </RoleGuard>
  );
}