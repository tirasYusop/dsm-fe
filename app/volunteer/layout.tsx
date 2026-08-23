import DashboardHeader from "@/components/layout/header";
import AppSidebar from "@/components/layout/sideBar";
import {SidebarProvider,} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuGroups = [
    {
      label: "Home",
      items: [
        { label: "Dashboard", href: "/volunteer/dashboard" },
      ],
    },
    {
      label: "Pelajar",
      items: [
        { label: "Tempahan", href: "/volunteer/booking" },
      ],
    },
    {
      label: "Inventori",
      items: [
        { label: "Inventori", href: "/volunteer/inventory" },
        { label: "Rekod Penggunaan", href: "/volunteer/usage" },
        { label: "Permohonan Inventori", href: "/volunteer/request" },
      ],
    },
    {
      label: "Shif",
      items: [
        { label: "Kehadiran", href: "/volunteer/shift" },
        { label: "Jadual Bertugas", href: "/volunteer/schedul" },
      ],
    },
    {
      label: "Aduan",
      items: [
        { label: "Aduan", href: "/volunteer/report" },
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
          role="Volunteer"
          navItems={flatMenus}
        />
        <div className="p-4 sm:p-6 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}