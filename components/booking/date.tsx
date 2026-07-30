"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const todayStr = new Date().toISOString().split("T")[0];

type Props = {
  dates: string[];
  selectedDate: string;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onDateChange: (date: string) => void;
};

export default function DateNavigator({
  dates,
  selectedDate,
  currentIndex,
  onNext,
  onPrevious,
  onDateChange,
}: Props) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          Select date
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-stretch gap-2 sm:items-center">
          <Button
            variant="outline"
            size="icon"
            disabled={currentIndex <= 0}
            onClick={onPrevious}
            aria-label="Previous date"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <input
            type="date"
            value={selectedDate}
            min={dates[0] && dates[0] > todayStr ? dates[0] : todayStr}
            max={dates[dates.length - 1]}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium focus:border-gray-400 focus:outline-none"
            onChange={(e) => {
              const date = e.target.value;
              if (dates.includes(date)) {
                onDateChange(date);
              } else {
                alert("No available slot for this date");
              }
            }}
          />

          <Button
            variant="outline"
            size="icon"
            disabled={currentIndex === -1 || currentIndex === dates.length - 1}
            onClick={onNext}
            aria-label="Next date"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}