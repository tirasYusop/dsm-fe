"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import InventoryTable from "@/components/volunteer/InventoryTable";
import UsageHistoryTable from "@/components/volunteer/UsageTable";
import RoleGuard from "@/components/auth/roleguard";
import type {InventoryItem,UsageRecord,UsageEntry} from "@/types/kitchen"

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usage, setUsage] = useState<{ [key: number]: UsageEntry }>({});
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, []);

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const res = await API.get("/stock-movements/my-stock/");
      setInventory(res.data.results ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInventory(false);
    }
  };

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

  const handleUsageChange = (
    id: number,
    field: "quantity" | "unit",
    value: number | string
  ) => {
    setUsage((prev) => ({
      ...prev,
      [id]: {
        quantity: prev[id]?.quantity ?? 0,
        unit: prev[id]?.unit ?? "cup",
        [field]: value,
      },
    }));
  };

  const submitUsage = async (id: number) => {
    const entry = usage[id];
    const quantity = entry?.quantity;
    const unit = entry?.unit ?? "cup";

    if (!quantity || quantity <= 0) {
      alert("Please enter usage quantity");
      return;
    }

    try {
      await API.post("/stock-movements/use/", {
        item: id,
        quantity,
        usage_unit: unit,
        reason: "Volunteer usage",
      });
      await fetchHistory();
      setUsage((prev) => ({
        ...prev,
        [id]: { quantity: 0, unit },
      }));
      alert("Usage recorded");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Failed to submit usage");
    }
  };

  // Status is no longer chosen by the volunteer -- the backend derives it
  // from the quantity, so only `quantity` is sent here now.
  const updateStockStatus = async (id: number, quantity: number) => {
    try {
      await API.post("/kitchen-stock-status/set/", {
        item: id,
        quantity,
      });
      await fetchInventory();
      alert("Stock updated successfully");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Failed to update stock");
    }
  };

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="space-y-6">
        <h1 className="text-lg sm:text-2xl font-bold"> Inventory Usage (Volunteer)</h1>

        <InventoryTable
          inventory={inventory}
          usage={usage}
          onUsageChange={handleUsageChange}
          onSubmit={submitUsage}
          onUpdateStock={updateStockStatus}
          loading={loadingInventory}
        />

        <div className="mt-10">
          <h2 className="text-base sm:text-xl font-semibold mb-4"> Usage History</h2>
          <UsageHistoryTable records={records} loading={loadingHistory} />
        </div>
      </div>
    </RoleGuard>
  );
}