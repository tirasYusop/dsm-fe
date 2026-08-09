"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import StorageStatusBadge from "@/components/inventory/storageStatusBadge";
import { TableRow, TableCell } from "@/components/ui/table";
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

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = selectedKitchen ? `?kitchen=${selectedKitchen}` : "";
      const [logsRes, alertsRes] = await Promise.all([
        API.get(`/student-storage/${query}`),
        API.get(`/student-storage/alerts/${query}`),
      ]);
      setLogs(logsRes.data.results ?? logsRes.data);
      setAlerts(alertsRes.data.results ?? alertsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedKitchen]);

  const filteredLogs = studentQuery.trim()
    ? logs.filter(
        (log) =>
          log.student_name.toLowerCase().includes(studentQuery.toLowerCase()) ||
          log.student_email.toLowerCase().includes(studentQuery.toLowerCase())
      )
    : logs;

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Ruang Simpanan Item Pelajar"
          subtitle="Pelajar telah merekodkan kemasukan bahan mentah ke dalam stor dapur. Item yang telah disimpan melebihi 3 hari ditandakan."
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

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tapis mengikut dapur</label>
            <select
              className="w-56 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              <option value="">All kitchens</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>{k.code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Cari pelajar</label>
            <input
              className="w-56 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Name or email"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filteredLogs}
          loading={loading}
          emptyMessage="Tiada log simpanan lagi."
          renderRow={(log, index) => (
            <TableRow key={log.id} className="border-t">
              <TableCell className="p-2">{index + 1}</TableCell>
              <TableCell className="p-2">{log.item_name}</TableCell>
              <TableCell className="p-2">
                <p className="font-medium text-gray-900">{log.student_name}</p>
                <p className="text-xs text-gray-500">{log.student_email}</p>
              </TableCell>
              <TableCell className="p-2">{log.kitchen_name}</TableCell>
              <TableCell className="p-2">{log.date_stored}</TableCell>
              <TableCell className="p-2">{log.expiry_date}</TableCell>
              <TableCell className="p-2"><StorageStatusBadge log={log} /></TableCell>
            </TableRow>
          )}
        />
      </div>
    </RoleGuard>
  );
}