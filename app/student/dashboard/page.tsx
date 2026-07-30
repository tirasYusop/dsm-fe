"use client";

import RoleGuard from "@/components/auth/roleguard";
import QuickActions from "@/components/dashboard/quick-action";
import StatCards from "@/components/dashboard/stat-cards";
import KitchenInfoCard from "@/components/dashboard/kitchen-info";
import RecentActivity from "@/components/dashboard/recent-activity";
import RecentBookings from "@/components/dashboard/recent-bookings";


export default function StudentDashboard() {

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="mx-auto space-y-6 p-3 sm:p-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Dashboard</h1>
          <p className="text-sm text-gray-500">Your bookings and kitchen storage at a glance.</p>
        </div>

        <StatCards />
        <QuickActions />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <KitchenInfoCard />
          <RecentActivity />
        </div>

        <RecentBookings />
      </div>
    </RoleGuard>
  );
}