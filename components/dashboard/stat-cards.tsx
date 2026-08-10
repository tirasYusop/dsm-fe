"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, PackageCheck, AlertTriangle } from "lucide-react";

export default function StatCards() {
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [storageCount, setStorageCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bookingsRes, storageRes, alertsRes] = await Promise.all([
          API.get("/kitchen-bookings/my_bookings/"),
          API.get("/student-storage/"),
          API.get("/student-storage/alerts/"),
        ]);

        setUpcomingCount(
          bookingsRes.data.filter((b: any) => b.display_status === "confirmed").length
        );
        setStorageCount(
          storageRes.data.filter((l: any) => l.status === "stored").length
        );
        setAlertsCount(alertsRes.data.length);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    {
      label: "Tempahan akan datang",
      value: upcomingCount,
      icon: CalendarClock,
      iconClasses: "bg-blue-50 text-blue-600",
    },
    {
      label: "Barang simpanan",
      value: storageCount,
      icon: PackageCheck,
      iconClasses: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Alert simpanan",
      value: alertsCount,
      icon: AlertTriangle,
      iconClasses: alertsCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400",
      valueClasses: alertsCount > 0 ? "text-amber-600" : "text-gray-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="border-gray-100 shadow-sm transition hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${s.iconClasses}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-semibold ${s.valueClasses ?? "text-gray-900"}`}>
                  {loading ? "–" : s.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}