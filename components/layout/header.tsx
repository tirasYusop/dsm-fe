import Link from "next/link";
import {SidebarTrigger} from "@/components/ui/sidebar";
type NavItem = {
  label: string;
  href: string;
};

type DashboardHeaderProps = {
  title: string;
  role?: string;
  navItems?: NavItem[];
};

export default function DashboardHeader({
  title,
  role,
  navItems = [],
}: DashboardHeaderProps) {
  return (
    <header className=" sticky top-0 border-b bg-white ">
      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          <div className="font-bold text-lg">
            {title}
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-sm text-gray-500">
          {role}
        </div>

      </div>
    </header>
  );
}