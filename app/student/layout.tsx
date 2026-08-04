import DashboardHeader from "@/components/layout/header";
import AppSidebar from "@/components/layout/sideBar";
import RoleGuard from "@/components/auth/roleguard";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuGroups = [
    {
      label: "Home",
      items: [{ label: "Dashboard", href: "/student/dashboard" }],
    },
    {
      label: "Kitchen Booking",
      items: [
        { label: "Booking", href: "/student/booking" },
        { label: "My Booking", href: "/student/booking/history" },
      ],
    },
    {
      label: "Activity",
      items: [
        { label: "Scan QR", href: "/student/scan" },
        { label: "Activity", href: "/student/activity/" },
      ],
    },
    {
      label: "Storage",
      items: [{ label: "Raw Material Storage", href: "/student/storage/" }],
    },
    {
      label: "Feedback",
      items: [{ label: "Feedback", href: "/student/feedback/" }],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar menuGroups={menuGroups} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="Dapur Siswa Madani @ UMS" role="Student" />
        <RoleGuard allowedRoles={["student"]}>
          <div className="p-4 sm:p-6">{children}</div>
        </RoleGuard>
      </div>
    </SidebarProvider>
  );
}