"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import { TableRow, TableCell } from "@/components/ui/table";
import FilterBar from "@/components/filterBar";
import PillTabs from "@/components/ui/pill-tabs";
import ExportButton from "@/components/exportButton";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";
import type { Kitchen } from "@/types/kitchen";
import { Button } from "@/components/ui/button";
import type {Report,StatusUpdate} from "@/types/kitchen"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


type ReportStatus = "open" | "in_progress" | "resolved";

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

const SEVERITY_STYLES: Record<Report["severity"], string> = {
  low: "text-gray-500",
  medium: "text-amber-600",
  high: "text-red-600 font-semibold",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "open", label: "Dibuka" },
  { value: "in_progress", label: "Dalam Tindakan" },
  { value: "resolved", label: "Selesai" },
];

const ACTION_STATUSES: { value: "in_progress" | "resolved"; label: string }[] = [
  { value: "in_progress", label: "Dalam Tindakan" },
  { value: "resolved", label: "Selesai" },
];

const COLUMNS = [
  { key: "title", label: "Isu" },
  { key: "reporter", label: "Dilaporkan Oleh" },
  { key: "kitchen", label: "Dapur" },
  { key: "severity", label: "Tahap" },
  { key: "date", label: "Tarikh" },
  { key: "status", label: "Status" },
  { key: "action", label: "" },
];

export default function ManagementReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));

  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [nextStatus, setNextStatus] = useState<"in_progress" | "resolved">("in_progress");
  const [resolving, setResolving] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get<PaginatedResponse<Kitchen> | Kitchen[]>("/kitchens/");
      setKitchens(getResults(res.data));
    } catch (err) {
      console.log(err);
      setKitchens([]);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (selectedKitchen) params.kitchen = selectedKitchen;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get<PaginatedResponse<Report> | Report[]>("/reports/", { params });
      const results = getResults(res.data);
      const meta = getPageMeta(res.data, pageSize);

      setReports(results);
      setTotalReports(meta.count);
      setPageSize(meta.page_size);
      setNextPage(meta.next);
      setPreviousPage(meta.previous);
    } catch (err) {
      console.log(err);
      setReports([]);
      setTotalReports(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedKitchen, statusFilter, page]);

  const handleKitchenChange = (id: string) => {
    setSelectedKitchen(id);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filteredReports = query.trim()
    ? reports.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.reporter_name.toLowerCase().includes(query.toLowerCase())
      )
    : reports;

  const kitchenTabs = useMemo(
    () => kitchens.map((k) => ({ value: String(k.id), label: k.code })),
    [kitchens]
  );

  const selectedKitchenLabel =
    kitchens.find((k) => String(k.id) === selectedKitchen)?.code ?? "Semua Dapur";

  const statusLabel =
    STATUS_FILTERS.find((s) => s.value === statusFilter)?.label ?? "Semua Status";

  const openResolveModal = (report: Report) => {
    setActiveReport(report);
    setResolutionNotes("");
    setNextStatus(report.status === "in_progress" ? "resolved" : "in_progress");
  };

  const submitResolution = async () => {
    if (!activeReport) return;
    setResolving(true);
    try {
      await API.patch(`/reports/${activeReport.id}/resolve/`, {
        status: nextStatus,
        resolution_notes: resolutionNotes,
      });
      setActiveReport(null);
      fetchReports();
    } catch (err) {
      console.log(err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Aduan Isu Dapur"
          subtitle="Semak dan uruskan aduan isu yang dihantar oleh sukarelawan."
          action={
            <div className="w-full sm:w-auto">
              <ExportButton
                title={`Laporan Isu Dapur - ${selectedKitchenLabel}`}
                filename={`kitchen-reports-${selectedKitchenLabel}`}
                columns={[
                  "Bil",
                  "Tajuk",
                  "Kategori",
                  "Tahap",
                  "Dilaporkan Oleh",
                  "Dapur",
                  "Aset",
                  "Tarikh",
                  "Status",
                  "Penerangan",
                  "Nota Tindakan",
                ]}
                rows={filteredReports.map((r, i) => [
                  (page - 1) * pageSize + i + 1,
                  r.title,
                  r.category_display,
                  r.severity_display,
                  r.reported_by_name ?? r.reporter_name,
                  r.kitchen_name,
                  r.asset_name ?? "-",
                  new Date(r.created_at).toLocaleDateString(),
                  r.status_display,
                  r.description,
                  r.resolution_notes || "-",
                ])}
                subtitle={`Dapur: ${selectedKitchenLabel} · Status: ${statusLabel}`}
              />
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <FilterBar
              search={{ value: query, onChange: setQuery, placeholder: "Tajuk atau nama pelapor" }}
              hasActiveFilters={!!query.trim() || !!statusFilter}
              onClear={() => {
                setQuery("");
                handleStatusChange("");
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-48"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <PillTabs options={kitchenTabs} value={selectedKitchen} onChange={handleKitchenChange} />
        </div>

        <DataTable
          columns={COLUMNS}
          data={filteredReports}
          loading={loading}
          emptyMessage="Tiada laporan lagi."
          renderRow={(report) => (
            <TableRow
              key={report.id}
              className="border-t cursor-pointer hover:bg-gray-50"
              onClick={() => openResolveModal(report)}
            >
              <TableCell className="p-2">
                <p className="font-medium text-gray-900">{report.title}</p>
                <p className="text-xs text-gray-500">
                  {report.category_display}
                  {report.asset_name ? ` · ${report.asset_name}` : ""}
                </p>
              </TableCell>
              <TableCell className="p-2">{report.reported_by_name ?? report.reporter_name}</TableCell>
              <TableCell className="p-2">{report.kitchen_name}</TableCell>
              <TableCell className={`p-2 ${SEVERITY_STYLES[report.severity]}`}>
                {report.severity_display}
              </TableCell>
              <TableCell className="p-2">
                {new Date(report.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="p-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]}`}>
                  {report.status_display}
                </span>
              </TableCell>
              <TableCell className="p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openResolveModal(report);
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  {report.status === "resolved" ? "Lihat" : "Uruskan"}
                </button>
              </TableCell>
            </TableRow>
          )}
        />

        {totalReports > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            totalCount={totalReports}
            pageSize={pageSize}
            itemLabel="reports"
          />
        )}

        <Dialog open={!!activeReport} onOpenChange={(o) => !o && !resolving && setActiveReport(null)}>
          <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col overflow-hidden p-0 sm:w-full sm:max-w-md">
            {activeReport && (
              <>
                <DialogHeader className="flex-shrink-0 border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[activeReport.status]}`}>
                      {activeReport.status_display}
                    </span>
                    <span className={`text-xs ${SEVERITY_STYLES[activeReport.severity]}`}>
                      {activeReport.severity_display}
                    </span>
                  </div>
                  <DialogTitle className="truncate text-left">{activeReport.title}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                    <p><span className="text-gray-400">Dilaporkan oleh:</span> {activeReport.reported_by_name ?? activeReport.reporter_name}</p>
                    <p><span className="text-gray-400">Dapur:</span> {activeReport.kitchen_name}</p>
                    <p><span className="text-gray-400">Kategori:</span> {activeReport.category_display}</p>
                    <p><span className="text-gray-400">Tarikh:</span> {new Date(activeReport.created_at).toLocaleDateString()}</p>
                    {activeReport.asset_name && (
                      <p className="col-span-2"><span className="text-gray-400">Aset:</span> {activeReport.asset_name}</p>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{activeReport.description}</p>

                  {activeReport.photo_url && (
                    <img
                      src={activeReport.photo_url}
                      alt="Report"
                      className="max-h-56 w-full rounded-md border border-gray-100 object-cover"
                    />
                  )}

                  {activeReport.status_history?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Sejarah Tindakan</p>
                      <ol className="space-y-3 border-l-2 border-gray-100 pl-4">
                        {activeReport.status_history.map((update) => (
                          <li key={update.id} className="relative">
                            <span
                              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                                update.status === "resolved"
                                  ? "bg-green-500"
                                  : update.status === "in_progress"
                                  ? "bg-amber-500"
                                  : "bg-red-400"
                              }`}
                            />
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{update.status_display}</span>
                              <span>·</span>
                              <span>{new Date(update.created_at).toLocaleString()}</span>
                              {update.updated_by_name && (
                                <>
                                  <span>·</span>
                                  <span>{update.updated_by_name}</span>
                                </>
                              )}
                            </div>
                            {update.notes && (
                              <p className="mt-0.5 text-sm text-gray-600">{update.notes}</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Only show the action panel if the report isn't already resolved */}
                  {activeReport.status !== "resolved" && (
                    <div className="space-y-3 rounded-lg bg-gray-50 p-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Tindakan</label>
                        <select
                          value={nextStatus}
                          onChange={(e) => setNextStatus(e.target.value as "in_progress" | "resolved")}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                        >
                          {ACTION_STATUSES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Nota Tindakan Baharu</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                          placeholder="Cth: Teknisi dijadualkan hari Khamis"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 mb-3 mr-3 sm:flex-row sm:justify-end sm:gap-3">
                  {activeReport.status === "resolved" ? (
                    <Button
                      onClick={() => setActiveReport(null)}
                      className="w-full py-2.5 text-sm font-medium sm:w-auto sm:px-6 sm:py-2"
                    >
                      Tutup
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setActiveReport(null)}
                        disabled={resolving}
                        className="w-full py-2.5 text-sm sm:w-auto sm:px-5 sm:py-2"
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={submitResolution}
                        disabled={resolving}
                        className="w-full py-2.5 text-sm font-medium sm:w-auto sm:px-6 sm:py-2"
                      >
                        {resolving ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}