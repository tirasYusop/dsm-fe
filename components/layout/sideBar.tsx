"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

type MenuItem = {
  label: string;
  href: string;
};

type AppSidebarProps = {
  title?: string;
  footer?: string;
  menus: MenuItem[];
};

export default function AppSidebar({
  title = "Dapur Siswa",
  footer,
  menus,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>

      <SidebarHeader className="font-bold text-lg p-4">
        {title}
      </SidebarHeader>

      <SidebarContent className="p-5">

        <SidebarMenu className="gap-2">

          {menus.map((item) => (
            <SidebarMenuItem key={item.href}>

              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                 className="text-md"

              >
                <Link href={item.href}>
                  {item.label}
                </Link>

              </SidebarMenuButton>

            </SidebarMenuItem>
          ))}

        </SidebarMenu>

      </SidebarContent>

      {footer && (
        <SidebarFooter className="p-4 text-xs text-muted-foreground">
          {footer}
        </SidebarFooter>
      )}

    </Sidebar>
  );
}