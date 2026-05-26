import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  DashboardSpeed02Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types/dashboard";

const statIconMap: Record<DashboardStat["id"], IconSvgElement> = {
  totalTasks: DashboardSpeed02Icon,
  inProgress: TimeQuarterPassIcon,
  completed: CheckmarkCircle02Icon,
  overdue: Alert02Icon,
};

const statToneClassMap: Record<DashboardStat["tone"], string> = {
  accent: "border-accent/25 bg-accent/10 text-accent",
  success: "border-chart-2/25 bg-chart-2/10 text-chart-2",
  warning: "border-chart-3/25 bg-chart-3/10 text-chart-3",
  danger: "border-chart-4/25 bg-chart-4/10 text-chart-4",
};

export function DashboardStatCards({ stats }: { stats: DashboardStat[] }) {
  if (stats.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
        No dashboard stats are available yet.
      </section>
    );
  }

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Task statistics">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="min-h-32 rounded-xl border border-border bg-card/70 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                statToneClassMap[stat.tone],
              )}>
              <HugeiconsIcon icon={statIconMap[stat.id]} strokeWidth={2} />
            </span>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {stat.helper}
          </p>
        </article>
      ))}
    </section>
  );
}
