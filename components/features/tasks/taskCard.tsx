"use client";

import {
  ArrowDown01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { TaskActionButton } from "./taskActionButton";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/types/tasks";

type TaskCardProps = {
  onComplete: (task: TaskListItem) => void;
  onChecklistItemToggle: (
    taskId: string,
    checklistItemId: string,
    completed: boolean,
  ) => void;
  task: TaskListItem;
  isDeleting?: boolean;
  isCompleting?: boolean;
  updatingChecklistItemIds?: string[];
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

function isCompletedStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === "done" || normalizedStatus === "completed";
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

type ChecklistToggleSummaryProps = {
  checklistItemCount: number;
  checklistProgress: number;
  completedChecklistCount: number;
  isOpen: boolean;
};

function ChecklistToggleSummary({
  completedChecklistCount,
  checklistItemCount,
  checklistProgress,
  isOpen,
}: ChecklistToggleSummaryProps) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Checklist</p>
          <p className="text-xs font-medium text-muted-foreground">
            {completedChecklistCount}/{checklistItemCount} done
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-chart-2 transition-all"
            style={{ width: `${checklistProgress}%` }}
          />
        </div>
      </div>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2}
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          isOpen && "rotate-180",
        )}
      />
    </>
  );
}

export default function TaskCard({
  task,
  isDeleting = false,
  updatingChecklistItemIds = [],
  onDelete,
  onEdit,
  onComplete,
  onChecklistItemToggle,
  isCompleting = false,
}: TaskCardProps) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const completedChecklistCount = task.checklistItems.filter(
    (item) => item.completed,
  ).length;
  const checklistProgress =
    task.checklistItems.length > 0
      ? Math.round((completedChecklistCount / task.checklistItems.length) * 100)
      : 0;
  const isCompleted = isCompletedStatus(task.status);

  return (
    <article
      className={cn(
        "rounded-xl border bg-background/55 p-4 shadow-sm transition hover:border-ring/30 hover:bg-background/70",
        isCompleted && "border-chart-2/25 bg-chart-2/5 hover:border-chart-2/35",
        !isCompleted && "border-border",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={cn(
                "text-base font-semibold text-foreground",
                isCompleted &&
                  "text-muted-foreground line-through decoration-chart-2/50",
              )}
            >
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

          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground",
              isCompleted && "text-muted-foreground/75",
            )}
          >
            {task.description}
          </p>
        </div>

        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
          {isCompleted ? (
            <span className="col-span-2 inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-chart-2/25 bg-chart-2/10 px-3 text-xs font-medium text-chart-2 sm:col-span-1">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
              Completed
            </span>
          ) : (
            <TaskActionButton
              label={isCompleting ? "Completing" : "Mark complete"}
              ariaLabel={
                isCompleting
                  ? `Completing ${task.title}`
                  : `Mark ${task.title} as complete`
              }
              icon={CheckmarkCircle02Icon}
              variant="default"
              className="col-span-2 w-full shadow-sm shadow-primary/20 sm:col-span-1 sm:w-auto"
              disabled={isCompleting}
              onClick={() => onComplete(task)}
            />
          )}
          <TaskActionButton
            label="Edit"
            ariaLabel={`Edit ${task.title}`}
            icon={Edit02Icon}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!onEdit}
            onClick={() => onEdit(task)}
          />
          <TaskActionButton
            label="Delete"
            ariaLabel={`Delete ${task.title}`}
            icon={Delete02Icon}
            variant="destructive"
            className="w-full sm:w-auto"
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

      {task.checklistItems.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          {isChecklistOpen ? (
            <button
              type="button"
              aria-expanded="true"
              aria-label="Collapse checklist"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setIsChecklistOpen(false)}
            >
              <ChecklistToggleSummary
                completedChecklistCount={completedChecklistCount}
                checklistItemCount={task.checklistItems.length}
                checklistProgress={checklistProgress}
                isOpen
              />
            </button>
          ) : (
            <button
              type="button"
              aria-expanded="false"
              aria-label="Expand checklist"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setIsChecklistOpen(true)}
            >
              <ChecklistToggleSummary
                completedChecklistCount={completedChecklistCount}
                checklistItemCount={task.checklistItems.length}
                checklistProgress={checklistProgress}
                isOpen={false}
              />
            </button>
          )}

          {isChecklistOpen && (
            <div className="mt-3 space-y-2">
              {task.checklistItems.map((item) => {
                const isUpdating = updatingChecklistItemIds.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg py-1.5 text-sm",
                      isUpdating && "opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={isUpdating}
                      className="mt-0.5 size-4 rounded border-border accent-primary"
                      onChange={(event) =>
                        onChecklistItemToggle(
                          task.id,
                          item.id,
                          event.target.checked,
                        )
                      }
                    />
                    <span
                      className={cn(
                        "min-w-0 leading-5 text-foreground",
                        item.completed &&
                          "text-muted-foreground line-through decoration-muted-foreground/70",
                      )}
                    >
                      {item.title}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
