"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import InventoryTable from "@/components/volunteer/InventoryTable";
import UsageHistoryTable from "@/components/volunteer/UsageTable";
import RoleGuard from "@/components/auth/roleguard";
import type {InventoryItem,UsageRecord,UsageEntry} from "@/types/kitchen"

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await API.get("/usage-logs/");
        setRecords(res.data.results ?? res.data);
      } catch (err: any) {
        console.error(err?.response?.status, err?.response?.data);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="space-y-6">
        <h1 className="text-lg sm:text-2xl font-bold">Usage History (Volunteer)</h1>
        <UsageHistoryTable records={records} loading={loadingHistory} />
      </div>
    </RoleGuard>
  );
}
