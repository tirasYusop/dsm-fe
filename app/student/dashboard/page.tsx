import QuickActions from "@/components/dashboard/quick-action";
import RecentBookings from "@/components/dashboard/recent-bookings";

export default function DashboardPage() {
  return (
      <div className="space-y-6">
        <QuickActions />
        <RecentBookings />
      </div>
  );
}