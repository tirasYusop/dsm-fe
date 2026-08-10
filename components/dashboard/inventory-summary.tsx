import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Boxes, PackageX, ClipboardList, Utensils } from "lucide-react";

type Summary = {
  total_inventory_items: number;
  low_stock_items: number;
  pending_requests: number;
  today_usage: number;
};

export default function InventorySummary({
  summary,
  loading,
}: {
  summary?: Summary;
  loading: boolean;
}) {
  const stats = [
    { label: "Item Inventori", value: summary?.total_inventory_items, icon: Boxes, accent: "text-foreground" },
    {
      label: "Stok Rendah",
      value: summary?.low_stock_items,
      icon: PackageX,
      accent: summary && summary.low_stock_items > 0 ? "text-red-500" : "text-green-600",
    },
    { label: "Permintaan Tertunda", value: summary?.pending_requests, icon: ClipboardList, accent: "text-yellow-500" },
    { label: "Digunakan Hari Ini", value: summary?.today_usage, icon: Utensils, accent: "text-foreground" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ringakasan Inventori</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {stats.map((s) => (
          <div key={s.label} className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1.5">
              <s.icon className="w-4 h-4" />
              {s.label}
            </p>
            {loading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className={`font-bold text-lg ${s.accent}`}>{s.value ?? 0}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}