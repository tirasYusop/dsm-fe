"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  item: {
    id: number;
    name: string;
    stock: number;
    unit: string;
  };

  amount: { [key: number]: number };
  photo: { [key: number]: string };

  onChangeAmount: (id: number, value: number) => void;
  onPhoto: (id: number, file: File | null) => void;
  onSubmit: (id: number) => void;
};

export default function InventoryManageCard({
  item,
  amount,
  photo,
  onChangeAmount,
  onPhoto,
  onSubmit,
}: Props) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6 space-y-6">

        <div>
          <h2 className="text-xl font-bold">
            {item.name}
          </h2>

          <p className="text-sm text-muted-foreground">
            Current Stock: {item.stock} {item.unit}
          </p>
        </div>

        {/* INPUT */}
        <div>
          <label className="text-sm font-medium">
            Add Quantity
          </label>

          <input
            type="number"
            value={amount[item.id] || ""}
            onChange={(e) =>
              onChangeAmount(item.id, Number(e.target.value))
            }
            className="mt-2 w-full border rounded-xl px-4 py-2"
            placeholder={`Enter ${item.unit}`}
          />
        </div>

        {/* PHOTO */}
        <div>
          <label className="text-sm font-medium">
            Upload Proof
          </label>

          <div className="mt-2 border rounded-xl overflow-hidden">
            {photo[item.id] ? (
              <img
                src={photo[item.id]}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No photo uploaded
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              onPhoto(item.id, e.target.files?.[0] || null)
            }
            className="mt-3"
          />
        </div>

        {/* BUTTON */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => onSubmit(item.id)}
        >
          + Add Stock
        </Button>

      </CardContent>
    </Card>
  );
}