"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

type Booking = {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  kitchen_name: string;
  display_status: "confirmed" | "attended" | "expired" | "cancelled";
  attended: boolean;
};

function statusBadge(booking: Booking) {
  switch (booking.display_status) {
    case "cancelled":
      return { label: "Dibatalkan", classes: "bg-gray-100 text-gray-600" };
    case "attended":
      return { label: "Telah Hadir", classes: "bg-emerald-50 text-emerald-700" };
    case "expired":
      return { label: "Tamat Tempoh", classes: "bg-gray-100 text-gray-500" };
    default:
      return { label: "Disahkan", classes: "bg-blue-50 text-blue-700" };
  }
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/kitchen-bookings/my_bookings/");
        setBookings(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recent = [...bookings]
    .sort((a, b) => b.slot_date.localeCompare(a.slot_date))
    .slice(0, 5);

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          Tempahan Terkini
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tiada tempahan lagi.</p>
        ) : (
          recent.map((item) => {
            const s = statusBadge(item);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.kitchen_name}</p>
                  <p className="text-xs text-gray-500">
                    {item.slot_date} · {item.start_time}–{item.end_time}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.classes}`}>
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}