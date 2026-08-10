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
import ExportButton from "@/components/exportButton";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function VolunteerReportPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");
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

  const filteredShifts = selectedVolunteer ? shifts.filter((s) => s.volunteer_name === selectedVolunteer) : shifts;

  const totalMinutes = filteredShifts.reduce((sum, s) => sum + s.duration_minutes, 0);
  const activeCount = filteredShifts.filter((s) => s.is_active).length;
  const uniqueVolunteers = new Set(filteredShifts.map((s) => s.volunteer)).size;

  const hasActiveFilters = !!selectedKitchen || !!selectedVolunteer;
  const clearFilters = () => {
    setSelectedKitchen("");
    setSelectedVolunteer("");
  };

  const kitchenLabel = selectedKitchen
    ? kitchens.find((k) => String(k.id) === selectedKitchen)?.name ?? "All kitchens"
    : "All kitchens";
  const volunteerLabel = selectedVolunteer || "All volunteers";

  const exportRows = filteredShifts.map((shift, index) => [
    index + 1,
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
            <ExportButton
              title="Volunteer time report"
              filename="volunteer-report"
              columns={["No.", "Volunteer", "Kitchen", "Clock in", "Clock out", "Duration", "Notes", "Status"]}
              rows={exportRows}
              subtitle={`Kitchen: ${kitchenLabel} · Volunteer: ${volunteerLabel} · Total: ${formatDuration(totalMinutes)}`}
            />
          }
        />

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

        <FilterBar
          selects={[
            {
              value: selectedKitchen,
              onChange: setSelectedKitchen,
              options: kitchens.map((k) => ({ value: String(k.id), label: k.name })),
              allLabel: "Semua Dapur",
            },
            {
              value: selectedVolunteer,
              onChange: setSelectedVolunteer,
              options: volunteerOptions.map((name) => ({ value: name, label: name })),
              allLabel: "Semua Sukarelawan",
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />

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
                    <TableCell className="p-2 font-medium">{index + 1}</TableCell>
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
      </div>
    </RoleGuard>
  );
}