import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DashboardSpeed02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import type { ActivityStat } from "@/types/activity";

const statIconMap: Record<ActivityStat["id"], IconSvgElement> = {
  totalActivities: DashboardSpeed02Icon,
  activeDays: Calendar03Icon,
  currentStreak: CheckmarkCircle02Icon,
  weeklyActivity: TimeScheduleIcon,
};

export function ActivityStatCards({ stats }: { stats: ActivityStat[] }) {
  return (
    <section
      className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
      aria-label="Activity statistics">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="min-h-[6.5rem] rounded-xl border border-border bg-card/70 p-3 shadow-sm sm:min-h-32 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3 sm:text-3xl">
                {stat.value}
              </p>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent sm:size-10 sm:rounded-xl">
              <HugeiconsIcon icon={statIconMap[stat.id]} strokeWidth={2} />
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground sm:mt-4">
            {stat.helper}
          </p>
        </article>
      ))}
    </section>
  );
}
