"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Utensils, Soup, ChefHat, ShoppingBasket, Loader2 } from "lucide-react";

type FoodbankItem = { id: number; name: string; unit: string; available: number };
type FoodbankSelection = { id: number; quantity: number };

const CHECKLIST = [
  { key: "usedKitchen", label: "Menggunakan Dapur", desc: "Cooked or prepared food here", icon: ChefHat },
  { key: "tookRice", label: "Mengambil Nasi", desc: "Took rice from the kitchen", icon: Utensils },
  { key: "tookDish", label: "Mengambil Lauk", desc: "Took a prepared dish", icon: Soup },
  { key: "tookFoodbank", label: "Mengambil Foodbank", desc: "Picked up foodbank items", icon: ShoppingBasket },
] as const;

export default function ActivityPage() {
  const router = useRouter();
  const params = useSearchParams();
  const kitchenId = params.get("kitchen");
  const attendanceId = params.get("attendance");

  const [checked, setChecked] = useState({
    usedKitchen: false,
    tookRice: false,
    tookDish: false,
    tookFoodbank: false,
  });

  const [foodbankItems, setFoodbankItems] = useState<FoodbankItem[]>([]);
  const [selectedFoodbank, setSelectedFoodbank] = useState<FoodbankSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!kitchenId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await API.get(`/inventory/foodbank-stock/?kitchen=${kitchenId}`);
        setFoodbankItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [kitchenId]);

  const toggle = (key: keyof typeof checked) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleFoodbankItem = (id: number) => {
    setSelectedFoodbank((prev) =>
      prev.find((x) => x.id === id) ? prev.filter((x) => x.id !== id) : [...prev, { id, quantity: 1 }]
    );
  };

  const updateFoodbankQuantity = (id: number, quantity: number) => {
    setSelectedFoodbank((prev) => prev.map((x) => (x.id === id ? { ...x, quantity } : x)));
  };

  const submit = async () => {
    if (!attendanceId) {
      alert("Missing attendance record, please check in again.");
      return;
    }
    if (checked.tookFoodbank && selectedFoodbank.length === 0) {
      alert("Select at least one foodbank item.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/attendance/activity/submit/", {
        attendance: attendanceId,
        kitchen: kitchenId,
        took_rice: checked.tookRice,
        took_dish: checked.tookDish,
        used_kitchen: checked.usedKitchen,
        took_foodbank: checked.tookFoodbank,
        foodbank_items: checked.tookFoodbank
          ? selectedFoodbank.map((x) => ({ item: x.id, quantity: x.quantity }))
          : [],
      });
      router.push("/student/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Failed to submit activity.");
    } finally {
      setSubmitting(false);
    }
  };

  const nothingChecked = !Object.values(checked).some(Boolean);

  return (
    <div className="mx-auto max-w-md space-y-5 p-3 sm:p-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Apa yang anda lakukan hari ini?</h1>
        <p className="text-sm text-gray-500">Tandakan semua perkara yang berkenaan dengan kunjungan ini.</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Senarai semak aktiviti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHECKLIST.map(({ key, label, desc, icon: Icon }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50"
            >
              <Checkbox checked={checked[key]} onCheckedChange={() => toggle(key)} />
              <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}

          {checked.tookFoodbank && (
            <div className="ml-2 space-y-2 border-l-2 border-blue-100 py-2 pl-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading foodbank stock...</p>
              ) : foodbankItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tiada stok bank makanan tersedia.</p>
              ) : (
                foodbankItems.map((item) => {
                  const sel = selectedFoodbank.find((x) => x.id === item.id);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                        <Checkbox checked={!!sel} onCheckedChange={() => toggleFoodbankItem(item.id)} />
                        <span className="min-w-0 truncate text-sm">
                          {item.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({item.available} {item.unit} left)
                          </span>
                        </span>
                      </label>
                      {sel && (
                        <input
                          type="number"
                          min="1"
                          max={item.available}
                          className="w-16 flex-shrink-0 rounded-lg border border-gray-200 p-1.5 text-sm focus:border-gray-400 focus:outline-none"
                          value={sel.quantity}
                          onChange={(e) => updateFoodbankQuantity(item.id, Number(e.target.value))}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <Button
            className="mt-2 w-full"
            onClick={submit}
            disabled={submitting || nothingChecked}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sedang menyimpan...
              </span>
            ) : (
              "Hantar aktiviti"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}