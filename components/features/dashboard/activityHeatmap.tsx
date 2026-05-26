import { cn } from "@/lib/utils";
import type { DashboardActivityDay } from "@/types/dashboard";

const levelClassMap: Record<DashboardActivityDay["level"], string> = {
  0: "bg-muted/40",
  1: "bg-accent/25",
  2: "bg-accent/45",
  3: "bg-accent/70",
  4: "bg-accent",
};

export function DashboardActivityHeatmap({
  activityDays,
}: {
  activityDays: DashboardActivityDay[];
}) {
  if (activityDays.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
        No activity has been tracked yet.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Activity calendar</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Daily task and post streaks
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {activityDays.length} day overview
        </p>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div
          className="grid w-max grid-flow-col grid-rows-7 gap-1"
          aria-label="Activity heatmap">
          {activityDays.map((day) => (
            <span
              key={day.date}
              title={`${day.date}: ${day.count} activities`}
              aria-label={`${day.date}: ${day.count} activities`}
              className={cn(
                "size-3 rounded-[3px] border border-border/40 transition hover:ring-2 hover:ring-ring/35",
                levelClassMap[day.level],
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "size-3 rounded-[3px] border border-border/40",
              levelClassMap[level as DashboardActivityDay["level"]],
            )}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
