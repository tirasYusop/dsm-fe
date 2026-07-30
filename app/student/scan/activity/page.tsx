"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type FoodbankItem = { id: number; name: string; unit: string; available: number };
type FoodbankSelection = { id: number; quantity: number };

export default function ActivityPage() {
  const router = useRouter();
  const params = useSearchParams();
  const kitchenId = params.get("kitchen");
  const attendanceId = params.get("attendance");
  const [tookRice, setTookRice] = useState(false);
  const [tookDish, setTookDish] = useState(false);
  const [usedKitchen, setUsedKitchen] = useState(false);
  const [tookFoodbank, setTookFoodbank] = useState(false);
  const [foodbankItems, setFoodbankItems] = useState<FoodbankItem[]>([]);
  const [selectedFoodbank, setSelectedFoodbank] = useState<FoodbankSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/inventory/foodbank-stock/");
        setFoodbankItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFoodbankItem = (id: number) => {
    setSelectedFoodbank((prev) =>
      prev.find((x) => x.id === id)
        ? prev.filter((x) => x.id !== id)
        : [...prev, { id, quantity: 1 }]
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
    if (tookFoodbank && selectedFoodbank.length === 0) {
      alert("Select at least one foodbank item.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/activity/submit/", {
        attendance: attendanceId,
        kitchen: kitchenId,
        took_rice: tookRice,
        took_dish: tookDish,
        used_kitchen: usedKitchen,
        took_foodbank: tookFoodbank,
        foodbank_items: tookFoodbank
          ? selectedFoodbank.map((x) => ({ item: x.id, quantity: x.quantity }))
          : [],
      });
      alert("Activity recorded");
      router.push("/student/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Failed to submit activity.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold">What did you do today?</h1>

      <Card>
        <CardHeader><CardTitle>Activity Checklist</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox checked={tookRice} onCheckedChange={() => setTookRice(!tookRice)} />
            <span className="text-sm">Take rice</span>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={tookDish} onCheckedChange={() => setTookDish(!tookDish)} />
            <span>Take dish</span>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={usedKitchen} onCheckedChange={() => setUsedKitchen(!usedKitchen)} />
            <span>Use kitchen</span>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={tookFoodbank} onCheckedChange={() => setTookFoodbank(!tookFoodbank)} />
            <span>Take Foodbank</span>
          </div>

          {tookFoodbank && (
            <div className="pl-6 space-y-3 border-l">
              {foodbankItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No foodbank stock available.</p>
              ) : (
                foodbankItems.map((item) => {
                  const sel = selectedFoodbank.find((x) => x.id === item.id);
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={!!sel} onCheckedChange={() => toggleFoodbankItem(item.id)} />
                        <span>
                          {item.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({item.available} {item.unit} left)
                          </span>
                        </span>
                      </div>
                      {sel && (
                        <input
                          type="number"
                          min="1"
                          max={item.available}
                          className="border rounded w-20 p-1"
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

          <Button className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? "Saving..." : "Submit Activity"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}