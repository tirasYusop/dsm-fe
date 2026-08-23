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
      label: "Laman Utama",
      items: [{ label: "Dashboard", href: "/management/dashboard" }],
    },
    {
      label: "Permintaan",
      items: [{ label: "Permintaan", href: "/management/request" }],
    },
    {
      label: "Inventori",
      items: [
        { label: "Inventori (Masuk/Keluar)", href: "/management/inventory" },
        { label: "Rekod Inventori", href: "/management/history" },
      ],
    },
    {
      label: "Pelajar",
      items: [
        { label: "Pelajar (Walk-in)", href: "/management/dataanalytic/studentWalkin" },
        { label: "Pelajar (Tempahan)", href: "/management/dataanalytic/studentsBooking" },
        { label: "Penyimpanan Pelajar", href: "/management/storage" },
        { label: "Maklum Balas Pelajar", href: "/management/feedback" },
      ],
    },
    {
      label: "Dapur",
      items: [
        { label: "Dapur", href: "/management/kitchen" },
        { label: "Sukarelawan Dapur", href: "/management/kitchen/volunteer" },
        { label: "Laporan Sukarelawan", href: "/management/kitchen/volunteer/report" },
        { label: "Jadual Betugas", href: "/management/kitchen/volunteer/schedual" },
        { label: "Aduan", href: "/management/report" },
      ],
    },
    {
      label: "Aset",
      items: [
        { label: "Pengurusan Aset", href: "/management/asset" },
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