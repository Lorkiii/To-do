"use client";

import Link from "next/link";
import { useState } from "react";
import { BloggerIcon, Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BlogPostModal } from "@/components/features/blog/blogPostModal";
import { cn } from "@/lib/utils";
import type {
  DashboardActivityItem,
  DashboardTaskPreview,
} from "@/types/dashboard";
import type { BlogPostListItem } from "@/types/blog";

function getTaskStatusClassName(task: DashboardTaskPreview) {
  if (task.isOverdue) {
    return "border-chart-4/25 bg-chart-4/10 text-chart-4";
  }

  if (task.status.toLowerCase() === "done") {
    return "border-chart-2/25 bg-chart-2/10 text-chart-2";
  }

  if (task.status.toLowerCase() === "in progress") {
    return "border-chart-3/25 bg-chart-3/10 text-chart-3";
  }

  return "border-border bg-muted/50 text-muted-foreground";
}

export function DashboardTaskList({
  tasks,
}: {
  tasks: DashboardTaskPreview[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Next tasks</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Work queue
          </h2>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/55 text-muted-foreground">
          <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-border bg-background/55 p-4 text-sm text-muted-foreground">
            No tasks are ready to show yet.
          </p>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-lg border border-border bg-background/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {task.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {task.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-1 text-[0.68rem] font-medium",
                    getTaskStatusClassName(task),
                  )}>
                  {task.isOverdue ? "Overdue" : task.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{task.priority} priority</span>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span>Due {task.dueLabel}</span>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span>{task.updatedAt}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ActivityContent({ activity }: { activity: DashboardActivityItem }) {
  return (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-accent">
        <HugeiconsIcon
          icon={activity.type === "post" ? BloggerIcon : Task01Icon}
          strokeWidth={2}
        />
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {activity.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {activity.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {activity.timestamp}
        </p>
      </div>
    </>
  );
}

export function DashboardRecentActivity({
  activities,
}: {
  activities: DashboardActivityItem[];
}) {
  const [selectedPost, setSelectedPost] = useState<BlogPostListItem | null>(
    null,
  );
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalSession, setPostModalSession] = useState(0);

  function handleOpenPost(post: BlogPostListItem) {
    setSelectedPost(post);
    setPostModalSession((current) => current + 1);
    setIsPostModalOpen(true);
  }

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Recent activity</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Latest movement
          </h2>
        </div>
        <Link
          href="/dashboard/activity"
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {activities.length === 0 ? (
          <p className="rounded-lg border border-border bg-background/55 p-4 text-sm text-muted-foreground">
            No activity has been recorded yet.
          </p>
        ) : (
          activities.map((activity) =>
            activity.type === "post" && activity.post ? (
              <button
                key={activity.id}
                type="button"
                onClick={() => {
                  if (activity.post) {
                    handleOpenPost(activity.post);
                  }
                }}
                className="flex w-full gap-3 rounded-lg border border-border bg-background/55 p-4 text-left transition hover:border-ring/40 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
                <ActivityContent activity={activity} />
              </button>
            ) : (
              <article
                key={activity.id}
                className="flex gap-3 rounded-lg border border-border bg-background/55 p-4">
                <ActivityContent activity={activity} />
              </article>
            ),
          )
        )}
      </div>

      <BlogPostModal
        key={postModalSession}
        post={selectedPost}
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
      />
    </section>
  );
}
