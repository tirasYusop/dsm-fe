"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Square, History } from "lucide-react";

type VolunteerProfile = {
  id: number;
  name: string;
  faculty: string;
  kolej: string;
};

type Shift = {
  id: number;
  volunteer: number;
  volunteer_name: string;
  clock_in: string;
  clock_out: string | null;
  notes: string;
  duration_minutes: number;
  is_active: boolean;
};

function formatElapsed(startIso: string) {
  const diff = Math.max(0, Date.now() - new Date(startIso).getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function VolunteerTimeLogPage() {
  const [roster, setRoster] = useState<VolunteerProfile[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");

  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [notes, setNotes] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState<Shift[]>([]);
  const [elapsed, setElapsed] = useState("0:00:00");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRoster = async () => {
    try {
      const res = await API.get("/volunteer-profiles/");
      setRoster(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/volunteer-shifts/");
      setHistory(res.data.filter((s: Shift) => !s.is_active).slice(0, 10));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setCurrentShift(null);
      setNotes("");
      return;
    }
    setCheckingStatus(true);
    (async () => {
      try {
        const res = await API.get(`/volunteer-shifts/current/?volunteer=${selectedId}`);
        setCurrentShift(res.data);
        setNotes(res.data?.notes ?? "");
      } catch (err) {
        console.log(err);
      } finally {
        setCheckingStatus(false);
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (currentShift) {
      setElapsed(formatElapsed(currentShift.clock_in));
      tickRef.current = setInterval(() => setElapsed(formatElapsed(currentShift.clock_in)), 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [currentShift]);

  const handleClockIn = async () => {
    setSubmitting(true);
    try {
      const res = await API.post("/volunteer-shifts/clock-in/", { volunteer: selectedId, notes });
      setCurrentShift(res.data);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Failed to clock in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setSubmitting(true);
    try {
      await API.post("/volunteer-shifts/clock-out/", { volunteer: selectedId, notes });
      setCurrentShift(null);
      setNotes("");
      setSelectedId("");
      fetchHistory();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Failed to clock out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="mx-auto max-w-md space-y-5 p-3 sm:p-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Time log</h1>
          <p className="text-sm text-gray-500">Select your name, then clock in or out.</p>
        </div>

        {/* Name picker */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Who are you?</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Select your name</option>
              {roster.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.kolej ? ` — ${v.kolej}` : ""}
                </option>
              ))}
            </select>
            {roster.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                No volunteers registered yet — ask management to add you to the roster.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Clock in/out */}
        {selectedId && (
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="space-y-4 p-4">
              {checkingStatus ? (
                <p className="text-sm text-gray-500">Checking status...</p>
              ) : currentShift ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentShift.volunteer_name} — clocked in
                        </p>
                        <p className="text-xs text-gray-500">since {formatTime(currentShift.clock_in)}</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold tabular-nums text-gray-900">{elapsed}</p>
                  </div>

                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="What are you working on?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleClockOut}
                    disabled={submitting}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    {submitting ? "Clocking out..." : "Clock out"}
                  </Button>
                </>
              ) : (
                <>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="What will you be working on? (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleClockIn} disabled={submitting}>
                    {submitting ? "Clocking in..." : "Clock in"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shift history for the whole kitchen */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4 text-gray-400" />
              Recent shifts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shifts logged yet.</p>
            ) : (
              history.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{shift.volunteer_name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {new Date(shift.clock_in).toLocaleDateString()} · {formatTime(shift.clock_in)} –{" "}
                      {shift.clock_out ? formatTime(shift.clock_out) : "—"}
                      {shift.notes ? ` · ${shift.notes}` : ""}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-medium text-gray-900">
                    {formatDuration(shift.duration_minutes)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}