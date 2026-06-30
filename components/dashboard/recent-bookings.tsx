"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Booking = {
  date: string;
  status: "Booked" | "Completed" | "Pending";
};

export default function RecentBookings() {
  const bookings: Booking[] = [
    { date: "Today - 12:00 PM", status: "Booked" },
    { date: "Yesterday - 1:00 PM", status: "Completed" },
    { date: "20 May - 12:00 PM", status: "Completed" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {bookings.map((item, index) => (
          <div
            key={index}
            className="flex justify-between text-sm border-b pb-2 last:border-none"
          >
            <span>{item.date}</span>

            <span
              className={
                item.status === "Booked"
                  ? "text-yellow-600"
                  : item.status === "Completed"
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              {item.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}