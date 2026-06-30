"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type InventoryItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
};

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Rice", stock: 50, unit: "kg" },
  { id: 2, name: "Cooking Oil", stock: 10, unit: "L" },
  { id: 3, name: "Milk", stock: 0, unit: "L" },
];

export default function InventoryInPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [addAmount, setAddAmount] = useState<{ [key: number]: number }>({});
  const [photos, setPhotos] = useState<{ [key: number]: string }>({});

  const handleChange = (id: number, value: number) => {
    setAddAmount((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePhoto = (id: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => ({
        ...prev,
        [id]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddStock = (id: number) => {
    const amount = addAmount[id];

    if (!amount || amount <= 0) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: item.stock + amount }
          : item
      )
    );

    setAddAmount((prev) => ({
      ...prev,
      [id]: 0,
    }));

    alert("Stock updated with photo proof saved!");
  };

  return (
<div className="space-y-6">
  <div className="flex flex-col md:flex-row justify-between gap-4">

    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Inventory IN
      </h1>

      <p className="text-muted-foreground">
        Restock inventory with photo proof
      </p>
    </div>
    <div className="mt-6">
      <Button asChild>
        <Link href="/management/inventory/create">
          + Add Inventory
        </Link>
      </Button>
    </div>
  </div>

  <div className="grid gap-5">

    {inventory.map((item) => (

      <Card
        key={item.id}
        className="rounded-2xl shadow-sm hover:shadow-lg transition"
      >

        <CardContent className="p-6">

          <div className="flex flex-col lg:flex-row justify-between gap-6">

            {/* LEFT */}
            <div className="space-y-4 flex-1">

              <div>

                <div className="flex items-center gap-3">

                  <h2 className="text-lg font-semibold">
                    {item.name}
                  </h2>

                  <span
                    className="
                    px-3 py-1
                    text-xs
                    rounded-full
                    bg-green-100
                    text-green-700
                    "
                  >
                    In Stock
                  </span>

                </div>

                <p className="text-muted-foreground mt-1">
                  Current Stock:
                  <span className="font-semibold ml-2">
                    {item.stock} {item.unit}
                  </span>
                </p>

              </div>

              <div>

                <label className="text-sm font-medium">
                  Add Quantity
                </label>

                <input
                  type="number"
                  value={addAmount[item.id] || ""}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      Number(e.target.value)
                    )
                  }
                  placeholder={`Enter ${item.unit}`}
                  className="
                    mt-2
                    w-full
                    md:w-64
                    rounded-xl
                    border
                    px-4
                    py-2
                    focus:ring-2
                    focus:ring-green-500
                    outline-none
                  "
                />

              </div>

            </div>

            {/* RIGHT */}
            <div className="space-y-4 w-full lg:w-72">

              <div>

                <label className="text-sm font-medium">
                  Upload Proof
                </label>

                <Card className="mt-2 overflow-hidden">

                  {photos[item.id] ? (

                    <img
                      src={photos[item.id]}
                      alt="proof"
                      className="
                        w-full
                        h-40
                        object-cover
                      "
                    />

                  ) : (

                    <div
                      className="
                        h-40
                        flex
                        items-center
                        justify-center
                        text-sm
                        text-muted-foreground
                      "
                    >
                      No photo uploaded
                    </div>

                  )}

                </Card>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    handlePhoto(
                      item.id,
                      e.target.files?.[0] || null
                    )
                  }
                  className="mt-3 block w-full"
                />

              </div>

              <Button
                className="
                  w-full
                  bg-green-600
                  hover:bg-green-700
                  rounded-xl
                "
                onClick={() =>
                  handleAddStock(item.id)
                }
              >
                + Add Stock
              </Button>

            </div>

          </div>

        </CardContent>

      </Card>

    ))}

  </div>
</div>
  );
}