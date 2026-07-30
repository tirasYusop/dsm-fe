import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type RequestEntry = {
  id: number;
  item: string;
  quantity: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

const statusVariant: Record<RequestEntry["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  cancelled: "outline",
};

export default function PendingRequests({ requests, loading }: { requests: RequestEntry[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="flex justify-between items-center border-b pb-2 text-sm last:border-b-0 last:pb-0">
              <div>
                <p className="font-medium">{r.item}</p>
                <p className="text-muted-foreground">{r.quantity}</p>
              </div>
              <Badge variant={statusVariant[r.status]} className="capitalize">
                {r.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}