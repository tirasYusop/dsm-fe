"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, QrCode, ClipboardList, History } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Book Session",
      desc: "Reserve your Dapur Siswa slot.",
      icon: CalendarPlus,
      href: "/student/booking",
      variant: "default" as const,
    },
    {
      title: "Scan QR",
      desc: "Check-in or submit activity.",
      icon: QrCode,
      href: "/student/scan",
      variant: "secondary" as const,
    },
    {
      title: "My Bookings",
      desc: "View your booking history.",
      icon: ClipboardList,
      href: "/student/booking/history",
      variant: "outline" as const,
    },
    {
      title: "History",
      desc: "Check past activities.",
      icon: History,
      href: "/student/activity/",
      variant: "ghost" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((item, index) => {
        const Icon = item.icon;

        return (
          <Card key={index} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="w-5 h-5" />
                {item.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {item.desc}
              </p>

              <Button asChild className="w-full" variant={item.variant}>
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}