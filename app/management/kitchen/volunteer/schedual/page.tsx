"use client";

import { useEffect, useState, useCallback } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Kitchen, ShiftSlot, WeekDay, VolunteerProfile } from "@/types/kitchen";
import PageHeader from "@/components/ui/page-header";

function startOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

const SLOT_TYPE_STYLE: Record<string, string> = {
  food_prep: "bg-amber-50 text-amber-700",
  customer_service: "bg-blue-50 text-blue-700",
};

const SLOT_TYPE_LABEL: Record<string, string> = {
  food_prep: "Penyediaan makanan",
  customer_service: "Khidmat pelanggan",
};

export default function VolunteerSchedulePage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(startOfWeek(new Date()));
  const [days, setDays] = useState<WeekDay[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [picker, setPicker] = useState<{ date: string; slotId: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(res.data.results ?? res.data);
      if (!selectedKitchen && res.data.length > 0) {
        setSelectedKitchen(String(res.data.results ?? res.data[0].id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchWeek = useCallback(async () => {
    if (!selectedKitchen) return;
    setLoading(true);
    try {
      const res = await API.get(`/scheduled-shifts/week/?kitchen=${selectedKitchen}&start=${weekStart}`);
      setDays(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [selectedKitchen, weekStart]);

  const fetchVolunteers = useCallback(async () => {
    if (!selectedKitchen) return;
    try {
      const res = await API.get(`/volunteer-profiles/?kitchen=${selectedKitchen}`);
      setVolunteers(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    }
  }, [selectedKitchen]);

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    fetchWeek();
    fetchVolunteers();
  }, [fetchWeek, fetchVolunteers]);

  const handleAssign = async (date: string, slotId: number, volunteerId: number) => {
    try {
      await API.post("/scheduled-shifts/", { slot: slotId, volunteer: volunteerId, date });
      setPicker(null);
      fetchWeek();
    } catch (err: any) {
      alert(err?.response?.data?.non_field_errors?.[0] || "Couldn't assign this slot.");
    }
  };

  const handleUnassign = async (id: number) => {
    try {
      await API.delete(`/scheduled-shifts/${id}/`);
      fetchWeek();
    } catch (err) {
      console.log(err);
    }
  };

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  const slotIds = [...new Set(days.flatMap((d) => d.slots.map((s) => s.slot.id)))];
  const slotById: Record<number, ShiftSlot> = {};
  days.forEach((d) => d.slots.forEach((s) => (slotById[s.slot.id] = s.slot)));

  const totalFilled = days.reduce((sum, d) => sum + d.slots.reduce((s, sl) => s + sl.assigned.length, 0), 0);
  const totalOpen = days.reduce((sum, d) => sum + d.slots.reduce((s, sl) => s + sl.open_spots, 0), 0);

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="mx-auto space-y-6">
        <div>
          <PageHeader title="Jadual Bertugas sukarelawan" subtitle="Daftarkan sukarelawan di sini, mereka akan memilih nama masing-masing untuk merekod waktu masuk/keluar di halaman sukarelawan." />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Jumlah Slot Diisi untuk minggu ini</p>
              <p className="text-2xl font-semibold text-gray-900">{totalFilled}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Jumlah Slot kosong minggu ini</p>
              <p className={`text-2xl font-semibold ${totalOpen > 0 ? "text-amber-600" : "text-gray-900"}`}>
                {totalOpen}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dapur</label>
            <select
              className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => shiftWeek(-1)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" />Sebelum
            </button>
            <span className="text-sm font-medium text-gray-700">
              {new Date(weekStart).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button onClick={() => shiftWeek(1)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              Seterus<ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-left font-bold w-36">Slot</TableHead>
                {days.map((d) => (
                  <TableHead key={d.date} className="p-2 text-center font-bold">
                    {new Date(d.date).toLocaleDateString([], { weekday: "short" })}
                    <div className="text-xs font-normal text-gray-400">{new Date(d.date).getDate()}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
              ) : slotIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center text-gray-500">
                    Tiada slot syif ditetapkan untuk dapur ini lagi.
                  </TableCell>
                </TableRow>
              ) : (
                slotIds.map((slotId) => {
                  const slot = slotById[slotId];
                  return (
                    <TableRow key={slotId} className="border-t align-top">
                      <TableCell className="p-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SLOT_TYPE_STYLE[slot.slot_type]}`}>
                          {SLOT_TYPE_LABEL[slot.slot_type]}
                        </span>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </p>
                      </TableCell>
                      {days.map((day) => {
                        const cell = day.slots.find((s) => s.slot.id === slotId);
                        if (!cell) return <TableCell key={day.date} className="p-2" />;
                        const isOpen = picker?.date === day.date && picker?.slotId === slotId;
                        return (
                          <TableCell key={day.date} className="p-2">
                            <div className="space-y-1">
                              {cell.assigned.map((a) => (
                                <div key={a.id} className="group flex items-center justify-between rounded-lg border border-gray-200 px-2 py-1 text-xs">
                                  <span className="text-gray-900">{a.volunteer_name}</span>
                                  <button
                                    onClick={() => handleUnassign(a.id)}
                                    className="text-gray-400 opacity-0 hover:text-red-500 group-hover:opacity-100"
                                    aria-label={`Remove ${a.volunteer_name}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              {cell.open_spots > 0 &&
                                (isOpen ? (
                                  <select
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-200 px-1 py-1 text-xs"
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      if (v) handleAssign(day.date, slotId, v);
                                    }}
                                    onBlur={() => setPicker(null)}
                                  >
                                    <option value="">Pick volunteer…</option>
                                    {volunteers.map((v) => (
                                      <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <button
                                    onClick={() => setPicker({ date: day.date, slotId })}
                                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-1 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600"
                                  >
                                    <Plus className="h-3 w-3" /> {cell.open_spots} open
                                  </button>
                                ))}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleGuard>
  );
}