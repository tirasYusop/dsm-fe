"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Timer, Download } from "lucide-react";
import { Shift, Kitchen } from "@/types/kitchen";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "@/components/ui/page-header";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VolunteerReportPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>(""); // "" = all
  const [loading, setLoading] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchShifts = async (kitchenId: string) => {
    setLoading(true);
    try {
      const query = kitchenId ? `?kitchen=${kitchenId}` : "";
      const res = await API.get(`/volunteer-shifts/${query}`);
      setShifts(res.data.results ?? res.data);
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
    fetchShifts(selectedKitchen);
    setSelectedVolunteer("");
  }, [selectedKitchen]);

  const volunteerOptions = useMemo(() => {
    const names = new Set(shifts.map((s) => s.volunteer_name));
    return Array.from(names).sort();
  }, [shifts]);

  const filteredShifts = selectedVolunteer
    ? shifts.filter((s) => s.volunteer_name === selectedVolunteer)
    : shifts;

  const totalMinutes = filteredShifts.reduce((sum, s) => sum + s.duration_minutes, 0);
  const activeCount = filteredShifts.filter((s) => s.is_active).length;
  const uniqueVolunteers = new Set(filteredShifts.map((s) => s.volunteer)).size;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const kitchenLabel = selectedKitchen
      ? kitchens.find((k) => String(k.id) === selectedKitchen)?.name ?? "All kitchens"
      : "All kitchens";
    const volunteerLabel = selectedVolunteer || "All volunteers";

    doc.setFontSize(14);
    doc.text("Volunteer time report", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Kitchen: ${kitchenLabel}`, 14, 22);
    doc.text(`Volunteer: ${volunteerLabel}`, 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total hours: ${formatDuration(totalMinutes)}`, 14, 37);

    autoTable(doc, {
      startY: 42,
      head: [["No.", "Volunteer", "Kitchen", "Clock in", "Clock out", "Duration", "Notes", "Status"]],
      body: filteredShifts.map((shift, index) => [
        index + 1,
        shift.volunteer_name,
        shift.kitchen_name,
        formatDateTime(shift.clock_in),
        shift.clock_out ? formatDateTime(shift.clock_out) : "—",
        formatDuration(shift.duration_minutes),
        shift.notes || "—",
        shift.is_active ? "Active" : "Completed",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 41, 55] }, 
      columnStyles: { 6: { cellWidth: 40 } }, 
    });

    const filenameParts = ["volunteer-report"];
    if (selectedVolunteer) filenameParts.push(selectedVolunteer.replace(/\s+/g, "-").toLowerCase());
    filenameParts.push(new Date().toISOString().slice(0, 10));

    doc.save(`${filenameParts.join("_")}.pdf`);
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="mx-auto space-y-6">
        <div>
          <PageHeader title="Laporan Sukarelawan" subtitle="Rekod daftar masuk/daftar keluar sukarelawan anda." />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {selectedVolunteer ? `Jam direkodkan — ${selectedVolunteer}` : "Jumlah jam direkodkan"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(totalMinutes)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sukarelawan yang terlibat</p>
                <p className="text-2xl font-semibold text-gray-900">{uniqueVolunteers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${activeCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sedang Aktif Bekerja</p>
                <p className={`text-2xl font-semibold ${activeCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
                  {activeCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dapur</label>
            <select
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              <option value="">Semua Dapur</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Sukarelawan</label>
            <select
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
            >
              <option value="">Semua Sukarelawan</option>
              {volunteerOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={filteredShifts.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />Eksport PDF
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
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
                <TableRow>
                  <TableCell colSpan={8}>Loading...</TableCell>
                </TableRow>
              ) : filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center text-gray-500">
                    Tiada syif direkodkan lagi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift, index) => (
                  <TableRow key={shift.id} className="border-t">
                    <TableCell className="p-2 font-medium">{index + 1}</TableCell>
                    <TableCell className="p-2 font-medium">{shift.volunteer_name}</TableCell>
                    <TableCell className="p-2">{shift.kitchen_name}</TableCell>
                    <TableCell className="p-2">{formatDateTime(shift.clock_in)}</TableCell>
                    <TableCell className="p-2">
                      {shift.clock_out ? formatDateTime(shift.clock_out) : "—"}
                    </TableCell>
                    <TableCell className="p-2">{formatDuration(shift.duration_minutes)}</TableCell>
                    <TableCell className="p-2 text-gray-600">{shift.notes || "—"}</TableCell>
                    <TableCell className="p-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          shift.is_active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {shift.is_active ? "Active" : "Completed"}
                      </span>
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