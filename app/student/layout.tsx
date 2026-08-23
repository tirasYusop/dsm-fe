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
        { label: "Tempahan", href: "/student/booking" },
        { label: "Sejarah Tempahan", href: "/student/booking/history" },
      ],
    },
    {
      label: "Aktiviti",
      items: [
        { label: "Imbas QR", href: "/student/scan" },
        { label: "Aktiviti", href: "/student/activityRecord" },
      ],
    },
    {
      label: "Penyimpanan",
      items: [{ label: "Penyimpanan Bahan", href: "/student/storage/" }],
    },
    {
      label: "Maklum Balas",
      items: [{ label: "Maklum Balas", href: "/student/feedback/" }],
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