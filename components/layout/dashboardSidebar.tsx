import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowDown01Icon,
  BookOpenTextIcon,
  Calendar03Icon,
  DashboardSquare01Icon,
  Home03Icon,
  Setting07Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { AddTaskModal } from "@/components/features/dashboard/addTaskModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardNavItem = {
  id: "dashboard" | "tasks" | "activity" | "templates" | "settings";
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

const taskNavItems: DashboardNavItem[] = [
  {
    id: "tasks",
    label: "Task list",
    href: "/dashboard#tasks",
    icon: Task01Icon,
  },
  {
    id: "templates",
    label: "Templates",
    href: "/dashboard/templates",
    icon: BookOpenTextIcon,
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

function DashboardTaskNavGroup({
  activeItemId,
  isMobile = false,
}: {
  activeItemId: DashboardNavItem["id"];
  isMobile?: boolean;
}) {
  const isTaskGroupActive =
    activeItemId === "tasks" || activeItemId === "templates";
  const taskGroupTriggerClassName = isTaskGroupActive
    ? "bg-muted text-foreground"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";

  if (isMobile) {
    return (
      <details className="group/task-nav relative flex-1">
        <summary
          className={cn(
            "flex h-14 min-w-16 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl px-2 text-[0.68rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden",
            taskGroupTriggerClassName,
          )}>
          <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
          <span>Tasks</span>
        </summary>
        <div className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 w-48 rounded-xl border border-border bg-card p-2 shadow-2xl">
          {taskNavItems.map((item) => (
            <DashboardNavLink
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
            />
          ))}
        </div>
      </details>
    );
  }

  return (
    <details
      className="group/task-nav"
      open={isTaskGroupActive}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden",
          taskGroupTriggerClassName,
        )}>
        <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
        <span>Tasks</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="ml-auto size-4 transition-transform group-open/task-nav:rotate-180"
        />
      </summary>

      <div className="mt-1 space-y-1 pl-4">
        {taskNavItems.map((item) => (
          <DashboardNavLink
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
          />
        ))}
      </div>
    </details>
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
  const mobilePrimaryItems = dashboardNavItems.slice(0, 1);
  const mobileSecondaryItems = dashboardNavItems.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-surface-gradient fixed inset-0 -z-20" />
      <div className="app-grid-overlay fixed inset-0 -z-10 opacity-25" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar/85 px-4 py-5 backdrop-blur-xl md:flex md:flex-col">
        <DashboardLogo />

        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Dashboard">
          <DashboardNavLink
            item={dashboardNavItems[0]}
            isActive={activeItemId === dashboardNavItems[0].id}
          />
          <DashboardTaskNavGroup activeItemId={activeItemId} />
          {dashboardNavItems.slice(1).map((item) => (
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
        <div className="w-full px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8">
          {children}
        </div>
      </main>

      <nav
        className="fixed inset-x-3 bottom-4 z-40 rounded-[1.45rem] border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-xl md:hidden"
        aria-label="Mobile dashboard">
        <div className="flex items-center gap-1">
          {mobilePrimaryItems.map((item) => (
            <DashboardNavLink
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
              isMobile
            />
          ))}
          <DashboardTaskNavGroup activeItemId={activeItemId} isMobile />
          <div className="flex flex-1 justify-center">
            <AddTaskModal
              trigger={
                <Button
                  aria-label="Add task"
                  size="icon-lg"
                  className="size-12 rounded-full bg-primary text-lg text-primary-foreground shadow-lg hover:bg-primary/90">
                  +
                </Button>
              }
            />
          </div>
          {mobileSecondaryItems.map((item) => (
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
