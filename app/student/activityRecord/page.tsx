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
  { key: "used_kitchen", label: "Menggunakan Dapur", icon: ChefHat },
  { key: "took_rice", label: "Mengambil Nasi", icon: Utensils },
  { key: "took_dish", label: "Mengambil Makanan", icon: Soup },
  { key: "took_foodbank", label: "Mengambil FoodBank", icon: ShoppingBasket },
];

function activeActions(a: Activity) {
  return ACTION_ICONS.filter((x) => a[x.key]);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(activities: Activity[]) {
  const groups: { label: string; items: Activity[] }[] = [];
  for (const a of activities) {
    const d = new Date(a.created_at);
    const label = d.toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(a);
    else groups.push({ label, items: [a] });
  }
  return groups;
}

const PAGE_SIZE = 20;

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (currentOffset: number) => {
    const res = await API.get(
      `/attendance/my-activity/?limit=${PAGE_SIZE}&offset=${currentOffset}`
    );
    const page: Activity[] = res.data;
    setHasMore(page.length === PAGE_SIZE);
    return page;
  };

  useEffect(() => {
    (async () => {
      try {
        const page = await loadPage(0);
        setActivities(page);
        setOffset(page.length);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.status
            ? `Failed to load (${err.response.status})`
            : "Failed to load activity history"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await loadPage(offset);
      setActivities((prev) => [...prev, ...page]);
      setOffset((prev) => prev + page.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const groups = groupByDay(activities);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg sm:text-2xl font-bold">Sejarah Aktiviti</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : activities.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Tiada aktiviti yang direkodkan.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <Card key={group.label} className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {group.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {group.items.map((a) => {
                  const actions = activeActions(a);
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-gray-50"
                    >
                      <div className="mt-0.5 flex -space-x-1">
                        {(actions.length
                          ? actions
                          : [{ key: "used_kitchen" as const, icon: ChefHat, label: "checked in" }]
                        )
                          .slice(0, 4)
                          .map(({ icon: Icon, label }, i) => (
                            <div
                              key={label}
                              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-50 text-blue-600"
                              style={{ zIndex: 4 - i }}
                            >
                              <Icon className="h-3 w-3" />
                            </div>
                          ))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">
                          {actions.length ? actions.map((x) => x.label).join(", ") : "Checked in"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.kitchen_name} · {formatDate(a.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Muat lagi"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}