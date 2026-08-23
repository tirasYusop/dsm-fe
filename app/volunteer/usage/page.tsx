"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import UsageHistoryTable from "@/components/volunteer/UsageTable";
import RoleGuard from "@/components/auth/roleguard";
import { getResults, type PaginatedResponse } from "@/lib/pagination";
import type { UsageRecord } from "@/types/kitchen";

async function fetchAllUsageLogs(): Promise<UsageRecord[]> {
  let url: string | null = "/usage-logs/";
  let all: UsageRecord[] = [];

  while (url) {
    const res: { data: PaginatedResponse<UsageRecord> | UsageRecord[] } = await API.get<
      PaginatedResponse<UsageRecord> | UsageRecord[]
    >(url);
    all = all.concat(getResults(res.data));
    if (Array.isArray(res.data)) break;
    url = res.data.next;
  }

  return all;
}

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      try {
        setRecords(await fetchAllUsageLogs());
      } catch (err: any) {
        console.error(err?.response?.status, err?.response?.data);
        setRecords([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    load();
  }, []);

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">Rekod Penggunaan</h1>
          <p className="text-sm text-gray-500">Rekod penggunaan inventori oleh sukarelawan</p>
        </div>
        <UsageHistoryTable records={records} loading={loadingHistory} />
      </div>
    </RoleGuard>
  );
}