import InventorySummary from "@/components/dashboard/inventory-summary";
import RecentUsage from "@/components/dashboard/recent-usage";
import PendingRequests from "@/components/dashboard/pending-request";
import DashboardHeader from "@/components/layout/header";
import QuickActionVolunteer from "@/components/dashboard/quick-action-volunteer"

export default function VolunteerDashboardPage() {
  return (
      <div className="space-y-6">
        <QuickActionVolunteer/>
        <InventorySummary />
        <RecentUsage />
        <PendingRequests />
      </div>
  );
}