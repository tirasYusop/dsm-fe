"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import type {Kitchen} from "@/types/kitchen"

type Props = {
  kitchens: Kitchen[];
  selectedKitchen: number | null;
  onSelect: (id: number) => void;
};

export default function KitchenSelector({ kitchens, selectedKitchen, onSelect }: Props) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ChefHat className="h-4 w-4 text-gray-400" />
          Pilih dapur
        </CardTitle>
      </CardHeader>

      <CardContent>
        {kitchens.length === 0 ? (
          <p className="text-gray-500">Tiada Dapur</p>
        ) : (
          <select
            value={selectedKitchen ?? ""}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 font-semibold w-full text-xs sm:text-sm "
          >
            {kitchens.map((k) => (
              <option key={k.id} value={k.id} className="text-xs sm:text-md">
                {k.name}
              </option>
            ))}
          </select>
        )}
      </CardContent>

    </Card>
  );
}
