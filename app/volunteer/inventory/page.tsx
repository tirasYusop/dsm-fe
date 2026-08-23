"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import InventoryTable from "@/components/volunteer/InventoryTable";
import RoleGuard from "@/components/auth/roleguard";
import type {InventoryItem,UsageRecord,UsageEntry} from "@/types/kitchen"

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usage, setUsage] = useState<{ [key: number]: UsageEntry }>({});
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    fetchInventory();
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
      setUsage((prev) => ({
        ...prev,
        [id]: { quantity: 0, unit },
      }));
      alert("Penggunaan Berjaya Direkod");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Gagal untuk menyimpan rekod penggunaan");
    }
  };

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
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold">Inventori</h1>
          <p className="text-sm text-gray-500">Rekodkan penggunaan bahan.</p>
        </div>

        <InventoryTable
          inventory={inventory}
          usage={usage}
          onUsageChange={handleUsageChange}
          onSubmit={submitUsage}
          onUpdateStock={updateStockStatus}
          loading={loadingInventory}
        />
      </div>
    </RoleGuard>
  );
}