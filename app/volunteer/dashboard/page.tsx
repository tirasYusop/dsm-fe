"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/lib/api1";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import InventorySummary from "@/components/dashboard/inventory-summary";
import RecentUsage from "@/components/dashboard/recent-usage";
import PendingRequests from "@/components/dashboard/pending-request";
import QuickActionVolunteer from "@/components/dashboard/quick-action-volunteer";
import type {DashboardData} from "@/types/dashboard"

export default function VolunteerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: confirm this matches VolunteerDashboardView's registered path
      const res = await API.get("/volunteer-dashboard/");
      setData(res.data);
    } catch {
      setError("Couldn't load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-6">
      <QuickActionVolunteer />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {error}
            <Button size="sm" variant="outline" onClick={loadDashboard}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <InventorySummary summary={data?.summary} loading={loading} />
      <RecentUsage usage={data?.recent_usage ?? []} loading={loading} />
      <PendingRequests requests={data?.pending_requests ?? []} loading={loading} />
    </div>
  );
}