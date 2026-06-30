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
                href: "/student/dashboard",
              },
              {
                label: "Booking",
                href: "/student/booking",
              },
              {
                label: "Scan QR",
                href: "/student/scan",
              },
              {
                label: "Activity",
                href: "/student/activity/",
              },
            ]}
          />
        <div className="flex-1">
          <DashboardHeader
            title="Dapur Siswa"
            role="Student"
          />
          <div className="p-6">
            {children}
          </div>
        </div>

    </SidebarProvider>
  );
}