"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function ActivityPage() {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("studentId");
  const type = searchParams.get("type");
  if (!studentId || type !== "inventory") {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Invalid QR Code
      </div>
    );
  }

  const items = [
    { id: 1, name: "Meggie Curry" },
    { id: 2, name: "Coffee 3 in 1" },
    { id: 3, name: "Rice" },
    { id: 4, name: "Milk" },
  ];

  const [checked, setChecked] = useState<number[]>([]);

  const toggle = (id: number) => {
    setChecked((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold">
        Student Inventory Checklist
      </h1>

      <p className="text-sm text-gray-500">
        Student ID: {studentId}
      </p>

      <Card className="p-4">

        <CardTitle className="mb-4">
          Select items used
        </CardTitle>

        <CardContent className="space-y-3">

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3"
            >

              <Checkbox
                checked={checked.includes(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />

              <span>{item.name}</span>

            </div>
          ))}

        </CardContent>

      </Card>

    </div>
  );
}