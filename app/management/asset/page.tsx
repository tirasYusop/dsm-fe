"use client";

import { useState } from "react";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import PillTabs from "@/components/ui/pill-tabs";
import AssetOverviewTab from "@/components/asset/overview";
import AssetRegistrationTab from "@/components/asset/register";
import AssetMaintenanceTab from "@/components/asset/maintenance";
import AssetDisposalTab from "@/components/asset/disposal";

const TABS = [
  { value: "overview", label: "Laporan & Status" },
  { value: "register", label: "Daftar Aset" },
  { value: "maintenance", label: "Penyelenggaraan" },
  { value: "disposal", label: "Pelupusan" },
];

export default function AssetManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader title="Pengurusan Aset" subtitle="Daftar, selenggara, dan lupuskan aset dapur." />

        <PillTabs options={TABS} value={activeTab} onChange={setActiveTab} />

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