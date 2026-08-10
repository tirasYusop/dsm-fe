"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import StorageStatusBadge from "@/components/inventory/storageStatusBadge";
import { TableRow, TableCell } from "@/components/ui/table";
import FilterBar from "@/components/filterBar";
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
      setKitchens(getResults(res.data));
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
    setPage(1);
  }, [selectedKitchen]);

  useEffect(() => {
    fetchLogs();
  }, [selectedKitchen, page]);

  // Search filters within the current page only — see note below.
  const filteredLogs = studentQuery.trim()
    ? logs.filter(
        (log) =>
          log.student_name.toLowerCase().includes(studentQuery.toLowerCase()) ||
          log.student_email.toLowerCase().includes(studentQuery.toLowerCase())
      )
    : logs;

  const hasActiveFilters = !!selectedKitchen || !!studentQuery.trim();
  const clearFilters = () => {
    setSelectedKitchen("");
    setStudentQuery("");
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Ruang Simpanan Item Pelajar"
          subtitle="Pelajar telah merekodkan kemasukan bahan mentah ke dalam stor dapur. Item yang telah disimpan melebihi 3 hari ditandakan."
          action={
            <ExportButton
              title="Ruang Simpanan Item Pelajar"
              filename="student-storage"
              columns={["Bil", "Item", "Pelajar", "Dapur", "Tarikh Disimpan", "Had"]}
              rows={filteredLogs.map((log, i) => [
                (page - 1) * pageSize + i + 1,
                log.item_name,
                log.student_name,
                log.kitchen_name,
                log.date_stored,
                log.expiry_date,
              ])}
              subtitle="Eksport halaman semasa sahaja"
            />
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

        <FilterBar
          search={{ value: studentQuery, onChange: setStudentQuery, placeholder: "Name or email" }}
          selects={[
            {
              value: selectedKitchen,
              onChange: setSelectedKitchen,
              options: kitchens.map((k) => ({ value: String(k.id), label: k.code })),
              allLabel: "All kitchens",
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />

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