"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskDateInput } from "@/components/features/tasks/taskDateInput";
import type { TaskListItem } from "@/types/tasks";

type TaskEditForm = {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
};

type TaskEditDialogProps = {
  task: TaskListItem | null;
  open: boolean;
  error: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskId: string, form: TaskEditForm) => Promise<void>;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[7rem] py-2`;

function toDateInputValue(value: TaskListItem["dueDate"]) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toTaskEditForm(task: TaskListItem | null): TaskEditForm {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "Medium",
    status: task?.status ?? "To Do",
    dueDate: toDateInputValue(task?.dueDate ?? null),
  };
}

export function TaskEditDialog({
  task,
  open,
  error,
  isSaving,
  onOpenChange,
  onSubmit,
}: TaskEditDialogProps) {
  const [form, setForm] = useState<TaskEditForm>(() => toTaskEditForm(task));
  const [formError, setFormError] = useState("");

  function handleFieldChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!task) {
      return;
    }

    const nextForm = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (!nextForm.title || !nextForm.description) {
      setFormError("Title and description are required.");
      return;
    }

    setFormError("");
    await onSubmit(task.id, nextForm);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the visible task details shown in your task list.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="edit-task-title" className="text-sm font-medium">
              Task title
            </label>
            <input
              id="edit-task-title"
              name="title"
              type="text"
              value={form.title}
              className={inputClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-task-description"
              className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="edit-task-description"
              name="description"
              value={form.description}
              className={textAreaClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="edit-task-priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="edit-task-priority"
                name="priority"
                value={form.priority}
                className={inputClassName}
                onChange={handleFieldChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-task-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="edit-task-status"
                name="status"
                value={form.status}
                className={inputClassName}
                onChange={handleFieldChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <TaskDateInput
              id="edit-task-due-date"
              name="dueDate"
              label="Due date"
              value={form.dueDate}
              onChange={handleFieldChange}
            />
          </div>

          {(formError || error) && (
            <p className="text-sm text-destructive" role="alert">
              {formError || error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
