"use client";

import React, { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import { TableRow, TableCell } from "@/components/ui/table";
import { getResults, type PaginatedResponse } from "@/lib/pagination";
import type { Asset } from "@/types/asset";
import type { Report, StatusUpdate } from "@/types/kitchen";

type ReportStatus = Report["status"];
type ReportSeverity = Report["severity"];
type ReportCategory = "equipment" | "hygiene" | "safety" | "stock" | "other";

interface VolunteerOption {
  id: number;
  name: string;
}

const CATEGORY_OPTIONS: { value: ReportCategory; label: string }[] = [
  { value: "equipment", label: "Peralatan" },
  { value: "hygiene", label: "Kebersihan" },
  { value: "safety", label: "Keselamatan" },
  { value: "stock", label: "Stok / Bekalan" },
  { value: "other", label: "Lain-lain" },
];

const SEVERITY_OPTIONS: { value: ReportSeverity; label: string }[] = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sederhana" },
  { value: "high", label: "Tinggi" },
];

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

const STATUS_HINT: Record<ReportStatus, string> = {
  open: "Menunggu tindakan pihak pengurusan.",
  in_progress: "Sedang diuruskan oleh pihak pengurusan.",
  resolved: "Isu telah diselesaikan.",
};

const COLUMNS = [
  { key: "title", label: "Isu" },
  { key: "category", label: "Kategori" },
  { key: "severity", label: "Tahap" },
  { key: "date", label: "Tarikh" },
  { key: "status", label: "Status" },
];

const EMPTY_FORM = {
  reportedBy: "",
  title: "",
  description: "",
  category: "equipment" as ReportCategory,
  severity: "medium" as ReportSeverity,
  assetId: "",
};

async function fetchInto<T>(url: string, setter: (v: T) => void, fallback: T) {
  try {
    const res = await API.get<T>(url);
    setter(res.data ?? fallback);
  } catch (err) {
    console.log(err);
    setter(fallback);
  }
}

function StatusBadge({ status, label }: { status: ReportStatus; label: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {label}
    </span>
  );
}

function latestStatusUpdate(history: StatusUpdate[]): StatusUpdate | null {
  return history.length ? history[history.length - 1] : null;
}

function ReportDetail({ report }: { report: Report }) {
  const latest = latestStatusUpdate(report.status_history ?? []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 break-words">{report.description}</p>

      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="Report"
          className="rounded-md w-full h-auto max-h-48 object-cover border border-gray-200"
        />
      )}

      <div className="rounded-md border border-gray-200 bg-white p-3">
        <p className="text-xs font-medium text-gray-500 mb-1">Kemas Kini Terkini</p>
        {report.status === "open" ? (
          <p className="text-sm text-gray-600">{STATUS_HINT.open}</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 break-words">
              {report.resolution_notes || STATUS_HINT[report.status]}
            </p>
            {latest && (
              <p className="text-xs text-gray-400 mt-1">
                Dikemaskini: {new Date(latest.created_at).toLocaleString()}
                {latest.updated_by_name && ` oleh ${latest.updated_by_name}`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VolunteerReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const updateForm = <K extends keyof typeof EMPTY_FORM>(field: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get<PaginatedResponse<Report> | Report[]>("/reports/");
      setReports(getResults(res.data));
    } catch (err) {
      console.log(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchInto<Asset[]>("/assets/active/", setAssets, []);
    fetchInto<VolunteerOption[]>("/volunteer-profiles/", setVolunteers, []);
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setPhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.reportedBy) {
      setError("Sila pilih nama sukarelawan.");
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      setError("Sila isi tajuk dan penerangan.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("reported_by", form.reportedBy);
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("severity", form.severity);
      if (form.assetId) formData.append("asset", form.assetId);
      if (photo) formData.append("photo", photo);

      await API.post("/reports/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      resetForm();
      fetchReports();
    } catch (err) {
      console.log(err);
      setError("Gagal menghantar laporan. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="w-full max-w-full overflow-x-hidden space-y-6 px-3 sm:px-0">
        <PageHeader
          title="Buat Laporan"
          subtitle="Laporkan sebarang isu di dapur — peralatan rosak, kebersihan, keselamatan, atau lain-lain."
        />
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border bg-white p-3 sm:p-4 space-y-4 w-full max-w-full"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sukarelawan</label>
            <select
              value={form.reportedBy}
              onChange={(e) => updateForm("reportedBy", e.target.value)}
              className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm"
            >
              <option value="">— Pilih nama anda —</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value as ReportCategory)}
                className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahap Keseriusan</label>
              <select
                value={form.severity}
                onChange={(e) => updateForm("severity", e.target.value as ReportSeverity)}
                className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Berkaitan Aset (pilihan)
            </label>
            <select
              value={form.assetId}
              onChange={(e) => updateForm("assetId", e.target.value)}
              className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm"
            >
              <option value="">— Tiada aset spesifik —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name_brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="Cth: Peti sejuk bocor"
              // text-base (16px) on mobile prevents iOS Safari from auto-zooming on focus
              className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={4}
              placeholder="Terangkan isu dengan lebih terperinci..."
              className="w-full max-w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (pilihan)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="block w-full max-w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600 break-words">{error}</p>}
          {success && <p className="text-sm text-green-600 break-words">Laporan berjaya dihantar.</p>}

          {/* full-width tap target on mobile, auto-width from sm up */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Menghantar..." : "Hantar Laporan"}
          </button>
        </form>

        <div className="w-full max-w-full">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Laporan Saya</h2>

          {/* Mobile (< sm): stacked cards, nothing to scroll or overflow */}
          <div className="sm:hidden space-y-2">
            {loading && (
              <div className="rounded-lg border bg-white p-4 text-sm text-gray-500">Memuatkan...</div>
            )}
            {!loading && reports.length === 0 && (
              <div className="rounded-lg border bg-white p-4 text-sm text-gray-500">
                Anda belum membuat sebarang laporan.
              </div>
            )}
            {!loading && reports.map((report) => {
              const isOpen = expandedId === report.id;
              return (
                <div key={report.id} className="rounded-lg border bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : report.id)}
                    className="w-full text-left p-3 flex flex-col gap-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm break-words">{report.title}</p>
                      <span className="shrink-0">
                        <StatusBadge status={report.status} label={report.status_display} />
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 break-words">
                      {report.category_display} · {report.severity_display} ·{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    {(report.reported_by_name || report.asset_name) && (
                      <p className="text-xs text-gray-400 break-words">
                        {report.reported_by_name && `Oleh: ${report.reported_by_name}`}
                        {report.asset_name && ` · Aset: ${report.asset_name}`}
                      </p>
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t bg-gray-50 p-3">
                      <ReportDetail report={report} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <div className="min-w-[560px]">
              <DataTable
                columns={COLUMNS}
                data={reports}
                loading={loading}
                emptyMessage="Anda belum membuat sebarang laporan."
                renderRow={(report) => (
                  <React.Fragment key={report.id}>
                    <TableRow
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    >
                      <TableCell className="p-2">
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-xs text-gray-500">
                          {report.reported_by_name && `Oleh: ${report.reported_by_name}`}
                          {report.asset_name && ` · Aset: ${report.asset_name}`}
                        </p>
                      </TableCell>
                      <TableCell className="p-2">{report.category_display}</TableCell>
                      <TableCell className="p-2">{report.severity_display}</TableCell>
                      <TableCell className="p-2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="p-2">
                        <StatusBadge status={report.status} label={report.status_display} />
                      </TableCell>
                    </TableRow>
                    {expandedId === report.id && (
                      <TableRow key={`${report.id}-detail`} className="bg-gray-50">
                        {/* was hardcoded to 5 — now tracks COLUMNS so it can't drift out of sync */}
                        <TableCell colSpan={COLUMNS.length} className="p-4">
                          <ReportDetail report={report} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}