"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/components/auth/roleguard";
import { ChefHat, CalendarCheck, DoorOpen, Clock, Loader2 } from "lucide-react";
import type {Kitchen,Booking} from "@/types/kitchen"

export default function CheckinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get("kitchen");

  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mode, setMode] = useState<"choose" | "booking">("choose");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | "walkin" | null>(null);

  useEffect(() => {
    if (!kitchenId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await Promise.all([fetchKitchen(), fetchBookings()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [kitchenId]);

  const fetchKitchen = async () => {
    try {
      const res = await API.get(`/kitchens/${kitchenId}/`);
      setKitchen(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get(`/kitchen-bookings/my_bookings/?kitchen=${kitchenId}`);
      const relevant = res.data.filter((b: Booking) => b.status !== "cancelled" && !b.attended);
      setBookings(relevant);
    } catch (error) {
      console.error(error);
    }
  };

  const checkInBooking = async (bookingId: number) => {
    setSubmittingId(bookingId);
    try {
      const res = await API.post("/attendance/mark/", {
        booking: bookingId,
        kitchen: kitchenId,
      });
      const attendanceId = res.data?.data?.id;
      router.push(`/student/activity?kitchen=${kitchenId}&attendance=${attendanceId}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error ?? "Attendance failed");
      setSubmittingId(null);
    }
  };

  const walkInAttendance = async () => {
    setSubmittingId("walkin");
    try {
      const res = await API.post("/attendance/mark/", { kitchen: kitchenId });
      const attendanceId = res.data?.data?.id;
      router.push(`/student/activity?kitchen=${kitchenId}&attendance=${attendanceId}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error ?? "Attendance failed");
      setSubmittingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="mx-auto max-w-md space-y-5 p-3 sm:p-4">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Kitchen check-in</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !kitchenId ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            No kitchen selected. Scan a kitchen QR code to check in.
          </div>
        ) : (
          <>
            {kitchen && (
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{kitchen.name}</p>
                    <p className="text-xs text-gray-500">Code: {kitchen.code}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {mode === "choose" && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">How are you checking in?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="flex h-auto w-full items-center justify-start gap-3 py-3"
                    onClick={() => setMode("booking")}
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">I have a booking</p>
                      <p className="text-xs text-muted-foreground">Check in against a reserved slot</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex h-auto w-full items-center justify-start gap-3 py-3"
                    onClick={walkInAttendance}
                    disabled={submittingId === "walkin"}
                  >
                    {submittingId === "walkin" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DoorOpen className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">Walk in</p>
                      <p className="text-xs text-muted-foreground">No reservation, just checking in now</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {mode === "booking" && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold">Select your booking</CardTitle>
                  <button
                    onClick={() => setMode("choose")}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No booking found for this kitchen.</p>
                  ) : (
                    bookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => checkInBooking(booking.id)}
                        disabled={submittingId === booking.id}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.slot_date}</p>
                            <p className="text-xs text-gray-500">
                              {booking.start_time} – {booking.end_time}
                            </p>
                          </div>
                        </div>
                        {submittingId === booking.id && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}