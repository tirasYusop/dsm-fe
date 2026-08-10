import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type UsageEntry = {
  id: number;
  item: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
};

export default function RecentUsage({ usage, loading }: { usage: UsageEntry[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Penggunaan Terkini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : usage.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tiada rekod penggunaan lagi.</p>
        ) : (
          usage.map((u) => (
            <div key={u.id} className="flex justify-between border-b pb-2 text-sm last:border-b-0 last:pb-0">
              <div>
                <p className="font-medium">{u.item}</p>
                <p className="text-muted-foreground">{u.reason}</p>
              </div>
              <div className="text-right">
                <p>{u.quantity} {u.unit}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(u.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}