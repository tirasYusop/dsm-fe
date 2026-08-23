"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar, // <-- add this
} from "@/components/ui/sidebar";

import LogoutButton from "@/components/auth/logout";

type MenuItem = {
  label: string;
  href: string;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

type AppSidebarProps = {
  title?: string;
  footer?: string;
  menuGroups: MenuGroup[];
};

export default function AppSidebar({
  title = "Dapur Siswa Madani @UMS",
  footer,
  menuGroups,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); // <-- add this

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="sidebar">
      <SidebarHeader className="p-4 text-sm font-semibold leading-snug">
        <div className="flex gap-2">
          <Image
            src="/DAPUR.png"
            alt="Dapur Siswa UMS Logo"
            width={50}
            height={50}
            className="h-10 w-10 object-contain sm:h-10 sm:w-10"
            priority
          />
          <div>{title}</div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="text-sm"
                  >
                    <Link href={item.href} onClick={handleNavigate}>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <LogoutButton />

        {footer && (
          <p className="text-xs text-muted-foreground mt-2">{footer}</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}