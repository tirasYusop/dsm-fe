"use client";

import { useState, useEffect } from "react";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/components/auth/roleguard";
import { CalendarDays, Clock, Users, ChefHat, CheckCircle2, ChevronDown } from "lucide-react";
import type {Booking} from "@/types/kitchen"


function statusBadge(booking: Booking) {
  switch (booking.display_status) {
    case "cancelled":
      return { label: "Cancelled", classes: "bg-gray-100 text-gray-600" };
    case "attended":
      return { label: "Checked in", classes: "bg-emerald-50 text-emerald-700" };
    case "expired":
      return { label: "Expired", classes: "bg-gray-100 text-gray-500" };
    default:
      return { label: "Confirmed", classes: "bg-blue-50 text-blue-700" };
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/kitchen-bookings/my_bookings/");
      setBookings(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: number) => {
    if (!window.confirm("Batalkan tempahan ini? Tindakan ini tidak boleh dibatalkan.")) return;

    setCancellingId(id);
    try {
      await API.post(`/kitchen-bookings/${id}/cancel/`);
      fetchBookings();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Gagal membatalkan tempahan");
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpanded = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="mx-auto space-y-6 p-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Tempahan saya</h1>
          <p className="text-sm text-gray-500">Tempahan dapur anda, yang telah lepas dan yang akan datang.</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Sedang memuatkan tempahan...</p>
        ) : bookings.length === 0 ? (
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <CalendarDays className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">Belum ada tempahan.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const friends = (booking.participants ?? []).filter((p) => !p.is_owner);
              const isExpanded = expandedId === booking.id;
              const badge = statusBadge(booking);
              const canCancel = booking.display_status === "confirmed";

              return (
                <Card key={booking.id} className="border-gray-100 shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <CardTitle className="text-sm font-semibold">{booking.slot_date}</CardTitle>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </CardHeader>

                  <CardContent className="space-y-2.5">
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      {booking.start_time} – {booking.end_time}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <ChefHat className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      {booking.kitchen_name}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      {booking.number_of_people} {booking.number_of_people === 1 ? "person" : "people"}
                    </p>
                    {booking.purpose && (
                      <p className="text-xs text-gray-500">{booking.purpose}</p>
                    )}
                    {booking.attended && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Sudah daftar masuk
                      </p>
                    )}

                    {friends.length > 0 && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleExpanded(booking.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          {friends.length} friend{friends.length > 1 ? "s" : ""}
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-2 rounded-lg bg-gray-50 p-3">
                            {friends.map((f) => (
                              <div key={f.id} className="text-sm">
                                <p className="font-medium text-gray-900">{f.name}</p>
                                <p className="text-xs text-gray-500">
                                  {f.student_id} · {f.faculty}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {canCancel && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => cancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? "Sedang membatalkan..." : "Batalkan tempahan"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}