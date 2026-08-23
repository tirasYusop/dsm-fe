"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Timer } from "lucide-react";
import { Shift, Kitchen } from "@/types/kitchen";
import PageHeader from "@/components/ui/page-header";
import FilterBar from "@/components/filterBar";
import PillTabs from "@/components/ui/pill-tabs";
import ExportButton from "@/components/exportButton";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function VolunteerReportPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      const kitchenData = res.data.results ?? res.data;
      setKitchens(kitchenData);
      if (kitchenData.length > 0) {
        setSelectedKitchen(String(kitchenData[0].id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchShifts = async (kitchenId: string, date: string, currentPage: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { kitchen: kitchenId, page: currentPage };
      if (date) params.date = date;

      const res = await API.get<PaginatedResponse<Shift> | Shift[]>("/volunteer-shifts/", { params });
      const results = getResults(res.data);
      const meta = getPageMeta(res.data, pageSize);

      setShifts(results);
      setTotalRecords(meta.count);
      setPageSize(meta.page_size);
      setNextPage(meta.next);
      setPreviousPage(meta.previous);
    } catch (err) {
      console.log(err);
      setShifts([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedKitchen, selectedDate]);

  useEffect(() => {
    if (selectedKitchen) {
      fetchShifts(selectedKitchen, selectedDate, page);
    }
  }, [selectedKitchen, selectedDate, page]);

  const kitchenTabs = useMemo(
    () => kitchens.map((k) => ({ value: String(k.id), label: k.code || k.name })),
    [kitchens]
  );

  const filteredShifts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shifts.filter((s) => {
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "completed" && s.is_active) return false;
      if (q && !s.volunteer_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [shifts, statusFilter, search]);

  const totalMinutes = filteredShifts.reduce((sum, s) => sum + s.duration_minutes, 0);
  const activeCount = filteredShifts.filter((s) => s.is_active).length;
  const uniqueVolunteers = new Set(filteredShifts.map((s) => s.volunteer)).size;

  const isToday = selectedDate === todayStr();
  const hasActiveFilters = !!statusFilter || !!search.trim() || !isToday;
  const clearFilters = () => {
    setStatusFilter("");
    setSearch("");
    setSelectedDate(todayStr());
  };

  const kitchenLabel = kitchens.find((k) => String(k.id) === selectedKitchen)?.code ?? "";

  const exportRows = filteredShifts.map((shift, index) => [
    (page - 1) * pageSize + index + 1,
    shift.volunteer_name,
    shift.kitchen_name,
    formatDateTime(shift.clock_in),
    shift.clock_out ? formatDateTime(shift.clock_out) : "—",
    formatDuration(shift.duration_minutes),
    shift.notes || "—",
    shift.is_active ? "Active" : "Completed",
  ]);

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="mx-auto space-y-6">
        <PageHeader
          title="Laporan Sukarelawan"
          subtitle="Rekod daftar masuk/daftar keluar sukarelawan anda."
          action={
            <div className="w-full sm:w-auto">
              <ExportButton
                title="Volunteer time report"
                filename="volunteer-report"
                columns={["No.", "Volunteer", "Kitchen", "Clock in", "Clock out", "Duration", "Notes", "Status"]}
                rows={exportRows}
                subtitle={`Kitchen: ${kitchenLabel} · Tarikh: ${selectedDate} · Total (halaman ini): ${formatDuration(totalMinutes)} · Eksport halaman semasa sahaja`}
              />
            </div>
          }
        />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center gap-1.5 p-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:text-left">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Jumlah jam direkodkan</p>
              <p className="text-base font-semibold text-gray-900 sm:text-2xl">{formatDuration(totalMinutes)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center gap-1.5 p-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:text-left">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-10 sm:w-10">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Sukarelawan yang terlibat</p>
              <p className="text-base font-semibold text-gray-900 sm:text-2xl">{uniqueVolunteers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center gap-1.5 p-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:text-left">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${
                activeCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Sedang Aktif Bekerja</p>
              <p className={`text-base font-semibold sm:text-2xl ${activeCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
                {activeCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="overflow-x-auto">
          <PillTabs options={kitchenTabs} value={selectedKitchen} onChange={setSelectedKitchen} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar
            search={{ value: search, onChange: setSearch, placeholder: "Cari nama sukarelawan..." }}
            selects={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                ],
                allLabel: "Semua Status",
              },
            ]}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Tarikh</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-auto"
              value={selectedDate}
              max={todayStr()}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr())}
                className="flex-shrink-0 text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
              >
                Hari ini
              </button>
            )}
          </div>
        </div>

        {/* Desktop / tablet: table */}
        <div className="hidden overflow-hidden rounded-lg border bg-white sm:block">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-left font-bold w-10">Bil.</TableHead>
                <TableHead className="p-2 text-left font-bold">Sukarelawan</TableHead>
                <TableHead className="p-2 text-left font-bold">Dapur</TableHead>
                <TableHead className="p-2 text-left font-bold">Clock in</TableHead>
                <TableHead className="p-2 text-left font-bold">Clock out</TableHead>
                <TableHead className="p-2 text-left font-bold">Waktu Bekerja</TableHead>
                <TableHead className="p-2 text-left font-bold">Nota</TableHead>
                <TableHead className="p-2 text-left font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
              ) : filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center text-gray-500">
                    Tiada syif direkodkan lagi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift, index) => (
                  <TableRow key={shift.id} className="border-t">
                    <TableCell className="p-2 font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="p-2 font-medium">{shift.volunteer_name}</TableCell>
                    <TableCell className="p-2">{shift.kitchen_name}</TableCell>
                    <TableCell className="p-2">{formatDateTime(shift.clock_in)}</TableCell>
                    <TableCell className="p-2">{shift.clock_out ? formatDateTime(shift.clock_out) : "—"}</TableCell>
                    <TableCell className="p-2">{formatDuration(shift.duration_minutes)}</TableCell>
                    <TableCell className="p-2 text-gray-600">{shift.notes || "—"}</TableCell>
                    <TableCell className="p-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${shift.is_active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {shift.is_active ? "Active" : "Completed"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {loading ? (
            <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              Tiada syif direkodkan lagi.
            </div>
          ) : (
            filteredShifts.map((shift, index) => (
              <div key={shift.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">#{(page - 1) * pageSize + index + 1}</p>
                    <p className="truncate font-semibold text-gray-900">{shift.volunteer_name}</p>
                    <p className="text-sm text-gray-500">{shift.kitchen_name}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      shift.is_active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {shift.is_active ? "Active" : "Completed"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Clock in</p>
                    <p className="font-medium text-gray-800">{formatDateTime(shift.clock_in)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Clock out</p>
                    <p className="font-medium text-gray-800">
                      {shift.clock_out ? formatDateTime(shift.clock_out) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Waktu Bekerja</p>
                    <p className="font-medium text-gray-800">{formatDuration(shift.duration_minutes)}</p>
                  </div>
                </div>

                {shift.notes && (
                  <div className="mt-2 border-t border-gray-100 pt-2 text-sm text-gray-600">
                    <p className="text-xs text-gray-400">Nota</p>
                    <p className="truncate">{shift.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalRecords > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            totalCount={totalRecords}
            pageSize={pageSize}
            itemLabel="syif"
          />
        )}
      </div>
    </RoleGuard>
  );
}