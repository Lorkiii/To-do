import Link from "next/link";
import type { ReactNode } from "react";

import {
  Calendar03Icon,
  DashboardSquare01Icon,
  Home03Icon,
  Setting07Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/utils";

type DashboardNavItem = {
  id: "dashboard" | "tasks" | "activity" | "settings";
  label: string;
  href: string;
  icon: IconSvgElement;
};

type DashboardSidebarProps = {
  children: ReactNode;
  activeItemId?: DashboardNavItem["id"];
};

const dashboardNavItems: DashboardNavItem[] = [
  {
    id: "dashboard",
    label: "Home",
    href: "/dashboard",
    icon: Home03Icon,
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "/dashboard#tasks",
    icon: Task01Icon,
  },
  {
    id: "activity",
    label: "Activity",
    href: "/dashboard#activity",
    icon: Calendar03Icon,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard#settings",
    icon: Setting07Icon,
  },
];

function DashboardLogo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label="Lazylet dashboard">
      <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-base font-bold text-foreground">
        L
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">
          Lazylet
        </span>
        <span className="block text-xs text-muted-foreground">Dashboard</span>
      </span>
    </Link>
  );
}

function DashboardNavLink({
  item,
  isActive,
  isMobile = false,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  isMobile?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
        isMobile
          ? "h-14 min-w-16 flex-1 flex-col justify-center gap-1 px-2 text-[0.68rem]"
          : "px-3 py-2.5",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}>
      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
      <span>{item.label}</span>
    </Link>
  );
}

export function DashboardSidebar({
  children,
  activeItemId = "dashboard",
}: DashboardSidebarProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-surface-gradient fixed inset-0 -z-20" />
      <div className="app-grid-overlay fixed inset-0 -z-10 opacity-25" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar/85 px-4 py-5 backdrop-blur-xl md:flex md:flex-col">
        <DashboardLogo />

        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Dashboard">
          {dashboardNavItems.map((item) => (
            <DashboardNavLink
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
            />
          ))}
        </nav>

        <div className="rounded-xl border border-border bg-background/55 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-accent">
              <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Backend ready</p>
              <p className="text-xs text-muted-foreground">Service driven UI</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative md:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8">
          {children}
        </div>
      </main>

      <nav
        className="fixed inset-x-3 bottom-4 z-40 rounded-[1.45rem] border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-xl md:hidden"
        aria-label="Mobile dashboard">
        <div className="flex items-center gap-1">
          {dashboardNavItems.map((item) => (
            <DashboardNavLink
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
              isMobile
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
