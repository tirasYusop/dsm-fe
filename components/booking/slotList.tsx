"use client";

import SlotCard from "@/components/booking/SlotCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type {Slot} from "@/types/kitchen"

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
          Slot masa yang tersedia
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Sedang memuatkan slot...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500">Tiada slot tersedia untuk tarikh ini.</p>
        ) : (
          slots.map((slot) => <SlotCard key={slot.id} slot={slot} onBook={onBook} />)
        )}
      </CardContent>
    </Card>
  );
}