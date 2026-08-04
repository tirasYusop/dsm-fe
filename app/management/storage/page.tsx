"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import StorageStatusBadge from "@/components/inventory/storageStatusBadge";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import type {Kitchen , StorageLog} from "@/types/kitchen"

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
      setKitchens(res.data);
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
      setLogs(logsRes.data);
      setAlerts(alertsRes.data);
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
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Ruang Simpanan Item Pelajar</h1>
          <p className="text-sm text-gray-500">
            Pelajar telah merekodkan kemasukan bahan mentah ke dalam stor dapur. Item yang telah disimpan melebihi 3 hari ditandakan.
          </p>
        </div>

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
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              <option value="">All kitchens</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Cari pelajar</label>
            <input
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Name or email"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-left font-bold w-10">Bil.</TableHead>
                <TableHead className="p-2 text-left font-bold">Item</TableHead>
                <TableHead className="p-2 text-left font-bold">Pelajar</TableHead>
                <TableHead className="p-2 text-left font-bold">Dapur</TableHead>
                <TableHead className="p-2 text-left font-bold">Tarikh Disimpan</TableHead>
                <TableHead className="p-2 text-left font-bold">Had</TableHead>
                <TableHead className="p-2 text-left font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading...</TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-4 text-center text-gray-500">
                    Tiada log simpanan lagi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log,index) => (
                  <TableRow key={log.id} className="border-t">
                    <TableCell className="p-2 font-medium">{index +1}</TableCell>
                    <TableCell className="p-2 font-medium">{log.item_name}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleGuard>
  );
}