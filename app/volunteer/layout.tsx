import DashboardHeader from "@/components/layout/header";
import AppSidebar from "@/components/layout/sideBar";

import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar
          menus={[
            {
              label: "Dashboard",
              href: "/volunteer/dashboard",
            },
            {
              label: "Inventory",
              href: "/volunteer/inventory",
            },
            {
              label: "Request Items",
              href: "/volunteer/request/create",
            },
          ]}
        />
        <div className="flex-1">
          <DashboardHeader
            title="Dapur Siswa"
            role="Volunteer"
          />
          <div className="p-6">
            {children}
          </div>
        </div>

    </SidebarProvider>
  );
}