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
            { label: "Dashboard", href: "/management/dashboard" },
            { label: "Requests", href: "/management/list" },
            { label: "Inventory", href: "/management/inventory"},
            { label: "Manage Inventory", href: "/management/inventory/in"},
            { label: "History", href: "/management/history"},
            ]}
          />
        <div className="flex-1">
          <DashboardHeader
            title="Dapur Siswa"
            role="Management"
          />
          <div className="p-6">
            {children}
          </div>
        </div>

    </SidebarProvider>
  );
}