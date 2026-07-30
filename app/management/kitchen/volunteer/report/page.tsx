"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Timer } from "lucide-react";

type Kitchen = { id: number; name: string; code: string };

type Shift = {
  id: number;
  volunteer: number;
  volunteer_name: string;
  kitchen_name: string;
  clock_in: string;
  clock_out: string | null;
  notes: string;
  duration_minutes: number;
  is_active: boolean;
};

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchShifts = async (kitchenId: string) => {
    setLoading(true);
    try {
      const query = kitchenId ? `?kitchen=${kitchenId}` : "";
      const res = await API.get(`/volunteer-shifts/${query}`);
      setShifts(res.data);
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
  }, [selectedKitchen]);

  const filteredShifts = search.trim()
    ? shifts.filter((s) => s.volunteer_name.toLowerCase().includes(search.toLowerCase()))
    : shifts;

  const totalMinutes = filteredShifts.reduce((sum, s) => sum + s.duration_minutes, 0);
  const activeCount = filteredShifts.filter((s) => s.is_active).length;
  const uniqueVolunteers = new Set(filteredShifts.map((s) => s.volunteer)).size;

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="mx-auto space-y-5 p-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Volunteer time report</h1>
          <p className="text-sm text-gray-500">Clock-in/clock-out records across your volunteers.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total hours logged</p>
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
                <p className="text-xs text-gray-500">Volunteers involved</p>
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
                <p className="text-xs text-gray-500">Currently clocked in</p>
                <p className={`text-2xl font-semibold ${activeCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
                  {activeCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Kitchen</label>
            <select
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              <option value="">All kitchens</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Search volunteer</label>
            <input
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-left font-bold w-10">No.</TableHead>
                <TableHead className="p-2 text-left font-bold">Volunteer</TableHead>
                <TableHead className="p-2 text-left font-bold">Kitchen</TableHead>
                <TableHead className="p-2 text-left font-bold">Clock in</TableHead>
                <TableHead className="p-2 text-left font-bold">Clock out</TableHead>
                <TableHead className="p-2 text-left font-bold">Working Time</TableHead>
                <TableHead className="p-2 text-left font-bold">Notes</TableHead>
                <TableHead className="p-2 text-left font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6 text-center text-gray-500">
                    No shifts recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift,index) => (
                  <TableRow key={shift.id} className="border-t">
                    <TableCell className="p-2 font-medium">{index+1}</TableCell>
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