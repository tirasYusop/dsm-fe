"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, MapPin } from "lucide-react";

type Kitchen = {
  id: number;
  name: string;
  location?: string;
  is_active?: boolean;
  status?: "active" | "maintenance" | "closed";
  status_note?: string;
};

function resolveStatus(k: Kitchen) {
  if (k.status === "maintenance")
    return { label: "Maintenance", classes: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20" };
  if (k.status === "closed")
    return { label: "Closed", classes: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20" };
  if (k.status === "active" || k.is_active)
    return { label: "Active", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" };
  return { label: "Unavailable", classes: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-400/20" };
}

export default function KitchenInfoCard() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/kitchens/");
        setKitchens(res.data.results ?? res.data);
      } catch (err: any) {
        console.log(err);
        setError(err?.response?.status ? `Failed to load (${err.response.status})` : "Failed to load kitchens");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ChefHat className="h-4 w-4 text-gray-400" />
          Kitchen info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : kitchens.length === 0 ? (
          <p className="text-sm text-muted-foreground">No kitchens found.</p>
        ) : (
          kitchens.map((k) => {
            const s = resolveStatus(k);
            return (
              <div
                key={k.id}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{k.name}</p>
                  {(k.status_note || k.location) && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                      {!k.status_note && <MapPin className="h-3 w-3 flex-shrink-0" />}
                      {k.status_note || k.location}
                    </p>
                  )}
                </div>
                <span className={`ml-2 flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.classes}`}>
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}