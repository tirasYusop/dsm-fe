"use client";

import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import type {Slot} from "@/types/kitchen"

type Props = {
  slot: Slot;
  onBook: (id: number) => void;
};

export default function SlotCard({ slot, onBook }: Props) {
  const isFull = slot.available_capacity <= 0 || slot.status === "penuh";

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3.5 transition ${
        isFull ? "border-gray-100 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
            isFull ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {slot.start_time} – {slot.end_time}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            {isFull ? "Penuh" : `${slot.available_capacity} slot${slot.available_capacity === 1 ? "" : "s"} Tersedia`}
          </p>
        </div>
      </div>

      <Button size="sm" disabled={isFull} onClick={() => onBook(slot.id)}>
        {isFull ? "Penuh" : "Tempah"}
      </Button>
    </div>
  );
}