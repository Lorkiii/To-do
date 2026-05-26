type DashboardProgressSummaryProps = {
  completionRate: number;
  activeDays: number;
  weeklyActivityCount: number;
};

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function DashboardProgressSummary({
  completionRate,
  activeDays,
  weeklyActivityCount,
}: DashboardProgressSummaryProps) {
  const safeCompletionRate = clampPercentage(completionRate);

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Weekly focus</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Task completion progress
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            A calm snapshot of what is finished, what is moving, and how often
            the workspace has activity.
          </p>
        </div>

        <div
          aria-label={`${safeCompletionRate}% task completion`}
          className="relative mx-auto flex size-36 shrink-0 items-center justify-center rounded-full sm:mx-0"
          style={{
            background: `conic-gradient(var(--accent) ${safeCompletionRate * 3.6}deg, color-mix(in oklch, var(--muted) 72%, transparent) 0deg)`,
          }}>
          <div className="flex size-28 flex-col items-center justify-center rounded-full border border-border bg-background text-center">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {safeCompletionRate}%
            </span>
            <span className="text-xs text-muted-foreground">complete</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/55 p-4">
          <p className="text-2xl font-semibold text-foreground">
            {activeDays}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            active days in view
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/55 p-4">
          <p className="text-2xl font-semibold text-foreground">
            {weeklyActivityCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            task and post updates this week
          </p>
        </div>
      </div>
    </section>
  );
}
