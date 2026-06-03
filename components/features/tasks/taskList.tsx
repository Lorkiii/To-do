"use client";

import { useMemo, useState } from "react";
import {
  Calendar03Icon,
  Task01Icon,
  Tick02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/types/tasks";
import TaskCard from "./taskCard";
import { TaskEditDialog } from "./taskEditDialog";
import TaskEmptyState from "./taskEmptyState";

type TaskListProps = {
  tasks: TaskListItem[];
};

type TaskEditPayload = {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
};

type TaskSummary = {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

function isCompletedStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === "done" || normalizedStatus === "completed";
}

function isInProgressStatus(status: string) {
  return status.trim().toLowerCase() === "in progress";
}

function isOverdue(task: TaskListItem, now: Date) {
  if (!task.dueDate || isCompletedStatus(task.status)) {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate.getTime() < now.getTime();
}

function getTaskSummary(tasks: TaskListItem[]): TaskSummary {
  const now = new Date();

  return {
    total: tasks.length,
    inProgress: tasks.filter((task) => isInProgressStatus(task.status)).length,
    completed: tasks.filter((task) => isCompletedStatus(task.status)).length,
    overdue: tasks.filter((task) => isOverdue(task, now)).length,
  };
}

function TaskSummaryCards({ summary }: { summary: TaskSummary }) {
  const stats = [
    {
      id: "total",
      label: "Total",
      value: summary.total,
      icon: Task01Icon,
      className: "text-accent",
    },
    {
      id: "inProgress",
      label: "In progress",
      value: summary.inProgress,
      icon: TimeScheduleIcon,
      className: "text-chart-3",
    },
    {
      id: "completed",
      label: "Done",
      value: summary.completed,
      icon: Tick02Icon,
      className: "text-chart-2",
    },
    {
      id: "overdue",
      label: "Overdue",
      value: summary.overdue,
      icon: Calendar03Icon,
      className: "text-chart-4",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-xl border border-border bg-background/55 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border border-border bg-card",
                stat.className,
              )}>
              <HugeiconsIcon icon={stat.icon} strokeWidth={2} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const [updatedTasks, setUpdatedTasks] = useState<Record<string, TaskListItem>>(
    {},
  );
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskListItem | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const taskItems = useMemo(
    () =>
      tasks
        .map((task) => updatedTasks[task.id] ?? task)
        .filter((task) => !deletedTaskIds.includes(task.id)),
    [deletedTaskIds, tasks, updatedTasks],
  );
  const summary = useMemo(() => getTaskSummary(taskItems), [taskItems]);

  async function handleSaveTask(taskId: string, payload: TaskEditPayload) {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "Unable to update task."),
        );
      }

      const data = await response.json();

      setUpdatedTasks((currentTasks) => ({
        ...currentTasks,
        [data.task.id]: data.task,
      }));
      setEditingTask(null);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

async function handleCompleteTask(taskId: string) {
  setError("");
  setIsSaving(true);
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 

        status: "Done",
      }),
    });

    if (!response.ok) {
      throw new Error(
        await getResponseError(response, "Unable to complete task."),
      );
    }

    const data = await response.json();

    setUpdatedTasks((currentTasks) => ({
      ...currentTasks,
      [data.task.id]: data.task,
    }));
      setEditingTask(null);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTask() {
    if (!deletingTask) {
      return;
    }

    setError("");
    setDeletingTaskId(deletingTask.id);

    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "Unable to delete task."),
        );
      }

      setDeletedTaskIds((currentTaskIds) => [
        ...currentTaskIds,
        deletingTask.id,
      ]);
      setDeletingTask(null);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setDeletingTaskId("");
    }
  }

  if (taskItems.length === 0) {
    return (
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <TaskEmptyState
          message="No tasks yet"
          description="Create your first task to get started."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <TaskSummaryCards summary={summary} />

      {error && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {taskItems.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDeleting={deletingTaskId === task.id}
            onDelete={setDeletingTask}
            onEdit={setEditingTask}
            onComplete={() => handleCompleteTask(task.id)}
          />
        ))}
      </div>

      <TaskEditDialog
        key={editingTask?.id ?? "new-task-edit"}
        task={editingTask}
        open={Boolean(editingTask)}
        error={error}
        isSaving={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
            setError("");
          }
        }}
        onSubmit={handleSaveTask}
      />

      <Dialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTask(null);
            setError("");
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
            <DialogDescription>
              This will remove the task from your list. The task is kept in the
              database as a soft-deleted record.
            </DialogDescription>
          </DialogHeader>

          {deletingTask && (
            <div className="rounded-xl border border-border bg-card/35 p-3">
              <p className="text-sm font-medium text-foreground">
                {deletingTask.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {deletingTask.description}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={Boolean(deletingTaskId)}
              onClick={handleDeleteTask}>
              {deletingTaskId ? "Deleting" : "Delete task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
