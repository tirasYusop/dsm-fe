"use client";

import { useState } from "react";
import RoleGuard from "@/components/auth/roleguard";
import AssetOverviewTab from "@/components/asset/overview";
import AssetRegistrationTab from "@/components/asset/register";
import AssetMaintenanceTab from "@/components/asset/maintenance";
import AssetDisposalTab from "@/components/asset/disposal";

const TABS = [
  { key: "overview", label: "Laporan & Status" },
  { key: "register", label: "Daftar Aset" },
  { key: "maintenance", label: "Penyelenggaraan" },
  { key: "disposal", label: "Pelupusan" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AssetManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pengurusan Aset</h1>

        <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "overview" && <AssetOverviewTab />}
          {activeTab === "register" && <AssetRegistrationTab />}
          {activeTab === "maintenance" && <AssetMaintenanceTab />}
          {activeTab === "disposal" && <AssetDisposalTab />}
        </div>
      </div>
    </RoleGuard>
  );
}