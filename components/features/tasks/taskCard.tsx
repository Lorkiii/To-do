import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { TaskActionButton } from "./taskActionButton";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/types/tasks";

type TaskCardProps = {
  onComplete: (task: TaskListItem) => void;
  task: TaskListItem;
  isDeleting?: boolean;
  isCompleting?: boolean;
  onDelete: (task: TaskListItem) => void;
  onEdit: (task: TaskListItem) => void;
};

function formatDate(value: Date | string | null) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function isCompletedStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === "done" || normalizedStatus === "completed";
}

function getStatusClassName(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "done" || normalizedStatus === "completed") {
    return "border-chart-2/25 bg-chart-2/10 text-chart-2";
  }

  if (normalizedStatus === "in progress") {
    return "border-chart-3/25 bg-chart-3/10 text-chart-3";
  }

  return "border-border bg-muted/50 text-muted-foreground";
}

function getPriorityClassName(priority: string) {
  const normalizedPriority = priority.trim().toLowerCase();

  if (normalizedPriority === "high") {
    return "border-chart-4/25 bg-chart-4/10 text-chart-4";
  }

  if (normalizedPriority === "medium") {
    return "border-chart-3/25 bg-chart-3/10 text-chart-3";
  }

  return "border-border bg-muted/50 text-muted-foreground";
}

export default function TaskCard({
  task,
  isDeleting = false,
  onDelete,
  onEdit,
  onComplete,
  isCompleting = false,
}: TaskCardProps) {
  return (
    <article className="rounded-xl border border-border bg-background/55 p-4 shadow-sm transition hover:border-ring/30 hover:bg-background/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {task.title}
            </h2>
            <span
              className={cn(
                "rounded-full border px-2 py-1 text-[0.68rem] font-medium",
                getStatusClassName(task.status),
              )}>
              {task.status}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <TaskActionButton
            label="Complete"
            icon={CheckmarkCircle02Icon}
            variant="outline"
            disabled={isCompleting}
            onClick={() => onComplete(task)}
          />
            <TaskActionButton
            label="Edit"
            icon={Edit02Icon}
            variant="outline"
            disabled={!onEdit}
            onClick={() => onEdit(task)}
          />
          <TaskActionButton
            label="Delete"
            icon={Delete02Icon}
            variant="outline"
            disabled={isDeleting}
            onClick={() => onDelete(task)}
          />

        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "rounded-full border px-2 py-1 font-medium",
            getPriorityClassName(task.priority),
          )}>
          {task.priority} priority
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/45 px-2 py-1">
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
          Due {formatDate(task.dueDate)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/45 px-2 py-1">
          <HugeiconsIcon icon={TimeScheduleIcon} strokeWidth={2} />
          Updated {formatDate(task.updatedAt)}
        </span>
      </div>
    </article>
  );
}
