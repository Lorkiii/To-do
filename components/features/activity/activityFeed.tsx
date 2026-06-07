import { BloggerIcon, Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import type { ActivityFeedGroup, ActivityType } from "@/types/activity";

const typeStyleMap: Record<
  ActivityType,
  { icon: typeof Task01Icon; badgeClassName: string }
> = {
  task: {
    icon: Task01Icon,
    badgeClassName: "border-accent/25 bg-accent/10 text-accent",
  },
  post: {
    icon: BloggerIcon,
    badgeClassName: "border-chart-2/25 bg-chart-2/10 text-chart-2",
  },
};

export function ActivityFeed({ groups }: { groups: ActivityFeedGroup[] }) {
  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Timeline</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Activity history
          </h2>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-5 rounded-lg border border-border bg-background/55 p-4 text-sm text-muted-foreground">
          No activity has been recorded yet. Create a task or write a blog post
          to start your streak.
        </p>
      ) : (
        <div className="mt-5 space-y-6">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="sticky top-0 z-10 -mx-1 mb-3 bg-card/70 px-1 py-1 backdrop-blur">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.label}
                </h3>
              </div>

              <ol className="relative space-y-3 border-l border-border pl-5">
                {group.items.map((item) => {
                  const typeStyle = typeStyleMap[item.type];

                  return (
                    <li key={item.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[1.6rem] flex size-7 items-center justify-center rounded-full border bg-card",
                          typeStyle.badgeClassName,
                        )}
                        aria-hidden="true">
                        <HugeiconsIcon
                          icon={typeStyle.icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                      </span>

                      <div className="rounded-lg border border-border bg-background/55 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-accent">
                              {item.action}
                            </p>
                            <h4 className="mt-1 truncate text-sm font-semibold text-foreground">
                              {item.title}
                            </h4>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
