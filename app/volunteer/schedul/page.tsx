"use client";

import { useEffect, useState, useCallback } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShiftSlot, WeekDay } from "@/types/kitchen";

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

export default function MySchedulePage() {
  const [weekStart, setWeekStart] = useState<string>(startOfWeek(new Date()));
  const [days, setDays] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeek = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/scheduled-shifts/week/?start=${weekStart}`);
      setDays(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  const slotIds = [...new Set(days.flatMap((d) => d.slots.map((s) => s.slot.id)))];
  const slotById: Record<number, ShiftSlot> = {};
  days.forEach((d) => d.slots.forEach((s) => (slotById[s.slot.id] = s.slot)));

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">Jadual sukarelawan</h1>
          <p className="text-sm text-gray-500">Jadual mingguan untuk dapur anda.</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button onClick={() => shiftWeek(-1)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" /> Minggu lepas
          </button>
          <span className="text-sm font-medium text-gray-700">
            {new Date(weekStart).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button onClick={() => shiftWeek(1)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            Minggu depan <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-center text-sm text-gray-500">Memuatkan...</p>
        ) : slotIds.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Tiada slot shift ditetapkan lagi.</p>
        ) : (
          <>
            {/* Mobile: stacked day cards, one section per day */}
            <div className="space-y-4 sm:hidden">
              {days.map((day) => (
                <div key={day.date} className="rounded-lg border bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                    {new Date(day.date).toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })}
                  </p>
                  <div className="space-y-2">
                    {slotIds.map((slotId) => {
                      const slot = slotById[slotId];
                      const cell = day.slots.find((s) => s.slot.id === slotId);
                      if (!cell) return null;
                      return (
                        <div key={slotId} className="rounded-lg border border-gray-100 p-2">
                          <div className="flex items-center justify-between">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SLOT_TYPE_STYLE[slot.slot_type]}`}>
                              {SLOT_TYPE_LABEL[slot.slot_type]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {cell.assigned.map((a) => (
                              <div key={a.id} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-900">
                                {a.volunteer_name}
                              </div>
                            ))}
                            {cell.open_spots > 0 && (
                              <div className="rounded-lg border border-dashed border-gray-300 py-1 text-center text-xs text-gray-400">
                                {cell.open_spots} slot kosong
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: full week grid */}
            <div className="hidden overflow-x-auto rounded-lg border bg-white sm:block">
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
                  {slotIds.map((slotId) => {
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
                          return (
                            <TableCell key={day.date} className="p-2">
                              <div className="space-y-1">
                                {cell.assigned.map((a) => (
                                  <div key={a.id} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-900">
                                    {a.volunteer_name}
                                  </div>
                                ))}
                                {cell.open_spots > 0 && (
                                  <div className="rounded-lg border border-dashed border-gray-300 py-1 text-center text-xs text-gray-400">
                                    {cell.open_spots} slot kosong
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}