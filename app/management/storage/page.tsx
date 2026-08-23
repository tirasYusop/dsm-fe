"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import StorageStatusBadge from "@/components/inventory/storageStatusBadge";
import { TableRow, TableCell } from "@/components/ui/table";
import FilterBar from "@/components/filterBar";
import PillTabs from "@/components/ui/pill-tabs";
import ExportButton from "@/components/exportButton";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";
import type { Kitchen, StorageLog } from "@/types/kitchen";

const COLUMNS = [
  { key: "no", label: "Bil.", className: "w-10" },
  { key: "item", label: "Item" },
  { key: "student", label: "Pelajar" },
  { key: "kitchen", label: "Dapur" },
  { key: "stored", label: "Tarikh Disimpan" },
  { key: "limit", label: "Had" },
  { key: "status", label: "Status" },
];

export default function ManagementStudentStoragePage() {
  const [logs, setLogs] = useState<StorageLog[]>([]);
  const [alerts, setAlerts] = useState<StorageLog[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [studentQuery, setStudentQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));

  const fetchKitchens = async () => {
    try {
      const res = await API.get<PaginatedResponse<Kitchen> | Kitchen[]>("/kitchens/");
      const results = getResults(res.data);
      setKitchens(results);
      if (results.length > 0) {
        setSelectedKitchen(String(results[0].id));
      }
    } catch (err) {
      console.log(err);
      setKitchens([]);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (selectedKitchen) params.kitchen = selectedKitchen;

      const [logsRes, alertsRes] = await Promise.all([
        API.get<PaginatedResponse<StorageLog> | StorageLog[]>("/student-storage/", { params }),
        API.get<StorageLog[]>("/student-storage/alerts/", {
          params: selectedKitchen ? { kitchen: selectedKitchen } : {},
        }),
      ]);

      const results = getResults(logsRes.data);
      const meta = getPageMeta(logsRes.data, pageSize);

      setLogs(results);
      setTotalLogs(meta.count);
      setPageSize(meta.page_size);
      setNextPage(meta.next);
      setPreviousPage(meta.previous);
      setAlerts(alertsRes.data ?? []);
    } catch (err) {
      console.log(err);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    if (!selectedKitchen) return;
    fetchLogs();
  }, [selectedKitchen, page]);

  const handleKitchenChange = (id: string) => {
    setSelectedKitchen(id);
    setPage(1);
  };

  const filteredLogs = studentQuery.trim()
    ? logs.filter(
        (log) =>
          log.student_name.toLowerCase().includes(studentQuery.toLowerCase()) ||
          log.student_email.toLowerCase().includes(studentQuery.toLowerCase())
      )
    : logs;

  const hasActiveFilters = !!studentQuery.trim();
  const clearFilters = () => {
    setStudentQuery("");
  };

  const kitchenTabs = useMemo(
    () => kitchens.map((k) => ({ value: String(k.id), label: k.code })),
    [kitchens]
  );

  const selectedKitchenLabel =
    kitchens.find((k) => String(k.id) === selectedKitchen)?.code ?? "";

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Ruang Simpanan Item Pelajar"
          subtitle="Pelajar telah merekodkan kemasukan bahan mentah ke dalam stor dapur. Item yang telah disimpan melebihi 3 hari ditandakan."
          action={
            <div className="w-full sm:w-auto">
              <ExportButton
                title={`Ruang Simpanan Item Pelajar - ${selectedKitchenLabel}`}
                filename={`student-storage-${selectedKitchenLabel}`}
                columns={["Bil", "Item", "Pelajar", "Dapur", "Tarikh Disimpan", "Had"]}
                rows={filteredLogs.map((log, i) => [
                  (page - 1) * pageSize + i + 1,
                  log.item_name,
                  log.student_name,
                  log.kitchen_name,
                  log.date_stored,
                  log.expiry_date,
                ])}
                subtitle={`Dapur: ${selectedKitchenLabel}`}
              />
            </div>
          }
        />

        {alerts.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              {alerts.length} item{alerts.length > 1 ? "s" : ""} telah tamat tempoh atau tamat tempoh hari ini
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              {alerts.map((a) => (
                <li key={a.id}>
                  {a.item_name} — {a.kitchen_name} ({a.student_name})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto">
            <PillTabs options={kitchenTabs} value={selectedKitchen} onChange={handleKitchenChange} />
          </div>

          <FilterBar
            search={{ value: studentQuery, onChange: setStudentQuery, placeholder: "Name or email" }}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>
        

        {/* Desktop / tablet: table */}
        <div className="hidden sm:block">
          <DataTable
            columns={COLUMNS}
            data={filteredLogs}
            loading={loading}
            emptyMessage="Tiada log simpanan lagi."
            renderRow={(log, index) => (
              <TableRow key={log.id} className="border-t">
                <TableCell className="p-2">{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="p-2">{log.item_name}</TableCell>
                <TableCell className="p-2">
                  <p className="font-medium text-gray-900">{log.student_name}</p>
                  <p className="text-xs text-gray-500">{log.student_email}</p>
                </TableCell>
                <TableCell className="p-2">{log.kitchen_name}</TableCell>
                <TableCell className="p-2">{log.date_stored}</TableCell>
                <TableCell className="p-2">{log.expiry_date}</TableCell>
                <TableCell className="p-2">
                  <StorageStatusBadge log={log} />
                </TableCell>
              </TableRow>
            )}
          />
        </div>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {loading ? (
            <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              Tiada log simpanan lagi.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={log.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">#{(page - 1) * pageSize + index + 1}</p>
                    <p className="truncate font-semibold text-gray-900">{log.item_name}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StorageStatusBadge log={log} />
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
                  <p className="font-medium text-gray-800">{log.student_name}</p>
                  <p className="text-xs text-gray-500">{log.student_email}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Dapur</p>
                    <p className="font-medium text-gray-800">{log.kitchen_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tarikh Disimpan</p>
                    <p className="font-medium text-gray-800">{log.date_stored}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Had</p>
                    <p className="font-medium text-gray-800">{log.expiry_date}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalLogs > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            totalCount={totalLogs}
            pageSize={pageSize}
            itemLabel="logs"
          />
        )}
      </div>
    </RoleGuard>
  );
}