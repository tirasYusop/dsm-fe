"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

type NavItem = {
  label: string;
  href: string;
};

type DashboardHeaderProps = {
  title: string;
  role?: string;
  navItems?: NavItem[];
};

type Crumb = {
  label: string;
  href: string;
};

function humanize(segment: string): string {
  const spaced = segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ");

  return spaced
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildCrumbs(
  pathname: string,
  role: string | undefined,
  navItems: NavItem[]
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs: Crumb[] = [];

  let cumulativeHref = "";
  for (let i = 1; i < segments.length; i++) {
    cumulativeHref = `/${segments.slice(0, i + 1).join("/")}`;

    const matched = navItems.find((item) => item.href === cumulativeHref);

    crumbs.push({
      label: matched ? matched.label : humanize(segments[i]),
      href: cumulativeHref,
    });
  }

  return crumbs;
}

export default function DashboardHeader({
  title,
  role,
  navItems = [],
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname, role, navItems);

  return (
    <header className="bg-header sticky top-0 z-10 border-b">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <SidebarTrigger className="shrink-0" />

          <div className="min-w-0">
            <div className="font-bold text-sm sm:text-lg leading-tight text-white truncate">
              {title}
            </div>

            {crumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-400 mt-0.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {crumbs.map((crumb, index) => {
                  const isLast = index === crumbs.length - 1;

                  return (
                    <span key={crumb.href} className="flex items-center gap-1 shrink-0">
                      {index > 0 && <ChevronRight size={12} />}
                      {isLast ? (
                        <span className="text-gray-400 font-medium">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="hover:text-gray-600 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* RIGHT */}
       {role && (
          <div className="hidden sm:block sm:text-sm text-white shrink-0">{role}</div>
        )}
      </div>
    </header>
  );
}