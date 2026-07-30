"use client";

import SlotCard from "@/components/booking/SlotCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Slot = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  status: string;
};

type Props = {
  slots: Slot[];
  loading: boolean;
  onBook: (id: number) => void;
};

export default function SlotList({ slots, loading, onBook }: Props) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-gray-400" />
          Available time slots
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500">No available slots for this date.</p>
        ) : (
          slots.map((slot) => <SlotCard key={slot.id} slot={slot} onBook={onBook} />)
        )}
      </CardContent>
    </Card>
  );
}