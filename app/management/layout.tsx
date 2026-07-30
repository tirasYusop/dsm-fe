import DashboardHeader from "@/components/layout/header";
import AppSidebar from "@/components/layout/sideBar";
import RoleGuard from "@/components/auth/roleguard";
import {SidebarProvider,} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuGroups = [
    {
      label: "Home",
      items: [{ label: "Dashboard", href: "/management/dashboard" },],
    },
    {
      label: "Requests",
      items: [{ label: "Requests", href: "/management/request" },
      ],
    },
    {
      label: "Inventory",
      items: [
        { label: "Inventory (In/Out)", href: "/management/inventory" },
        { label: "Overview", href: "/management/history" },
      ],
    },
    {
      label: "Student",
      items: [
        { label: "Students Walk-in", href: "/management/dataanalytic/studentWalkin" },
        { label: "Students Booking", href: "/management/dataanalytic/studentsBooking" },
        { label: "Students Storage", href: "/management/storage" },
      ],
    },
    {
      label: "Kitchen",
      items: [
        { label: "Kitchen QR", href: "/management/kitchen" },
        { label: "Kitchen Volunteer", href: "/management/kitchen/volunteer" },
        { label: "Volunteer Report", href: "/management/kitchen/volunteer/report" },
      ],
    },
    {
      label: "Asset",
      items: [
        { label: "Register Asset", href: "/management/asset/RegisterAsset" },
        { label: "Maintenance Asset", href: "/management/asset/AssetMaintenanceForm" },
        { label: "Disposal Asset", href: "/management/asset/AssetDisposalForm" },
        { label: "Report Asset", href: "/management/asset/AssetReport" },
      ],
    },
  ];

  const flatMenus = menuGroups.flatMap((g) => g.items);

  return (
    <SidebarProvider>
      <AppSidebar menuGroups={menuGroups} />
      <div className="flex-1">
        <DashboardHeader
          title="Dapur Siswa Madani @ UMS"
          role="Management"
          navItems={flatMenus}
        />
        <RoleGuard allowedRoles={["management"]}>
        <div className="p-4 sm:p-6 md:p-6 lg:p-8">
          {children}
        </div>
        </RoleGuard>
      </div>
    </SidebarProvider>
  );
}