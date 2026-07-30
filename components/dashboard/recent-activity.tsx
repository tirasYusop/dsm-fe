"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, Utensils, Soup, ShoppingBasket, ChefHat } from "lucide-react";

type Activity = {
  id: number;
  kitchen_name: string;
  took_rice: boolean;
  took_dish: boolean;
  took_foodbank: boolean;
  used_kitchen: boolean;
  created_at: string;
};

const ACTION_ICONS: { key: keyof Activity; label: string; icon: typeof Utensils }[] = [
  { key: "used_kitchen", label: "used kitchen", icon: ChefHat },
  { key: "took_rice", label: "took rice", icon: Utensils },
  { key: "took_dish", label: "took dish", icon: Soup },
  { key: "took_foodbank", label: "took foodbank", icon: ShoppingBasket },
];

function activeActions(a: Activity) {
  return ACTION_ICONS.filter((x) => a[x.key]);
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/attendance/my-activity/?limit=5");
        setActivities(res.data);
      } catch (err: any) {
        console.log(err);
        setError(err?.response?.status ? `Failed to load (${err.response.status})` : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ActivityIcon className="h-4 w-4 text-gray-400" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          activities.map((a) => {
            const actions = activeActions(a);
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-gray-50"
              >
                <div className="mt-0.5 flex -space-x-1">
                  {(actions.length ? actions : [{ key: "used_kitchen" as const, icon: ChefHat, label: "checked in" }])
                    .slice(0, 3)
                    .map(({ icon: Icon, label }, i) => (
                      <div
                        key={label}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-50 text-blue-600"
                        style={{ zIndex: 3 - i }}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    ))}
                </div>
                <div className="min-w-0">
                  <p className="text-sm capitalize text-gray-900">
                    {actions.length ? actions.map((x) => x.label).join(", ") : "Checked in"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.kitchen_name} · {timeAgo(a.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}