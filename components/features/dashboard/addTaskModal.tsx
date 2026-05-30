"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { builtInTaskTemplates } from "@/lib/taskTemplates";
import type {
  ChecklistDraftItem,
  SavedTaskTemplate,
  TaskTemplateOption,
} from "@/types/taskTemplates";

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[6.5rem] py-2`;

type AddTaskModalProps = {
  trigger: ReactNode;
  initialTemplate?: TaskTemplateOption;
};

type TaskFormState = {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
};

const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  dueDate: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function createChecklistDraftItem(title = ""): ChecklistDraftItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    title,
  };
}

function toChecklistDraftItems(items: readonly string[]) {
  return items.map((item) => createChecklistDraftItem(item));
}

function getTemplatePayload(
  form: TaskFormState,
  name: string,
  checklistItems: readonly ChecklistDraftItem[],
) {
  return {
    name: name.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    status: form.status,
    checklistItems: checklistItems
      .map((item) => item.title.trim())
      .filter((item) => item.length > 0),
  };
}

export function AddTaskModal({ trigger, initialTemplate }: AddTaskModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm);
  const [checklistItems, setChecklistItems] = useState<ChecklistDraftItem[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const templateOptions = useMemo<TaskTemplateOption[]>(
    () => [
      ...builtInTaskTemplates,
      ...savedTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: template.status,
        checklistItems: template.checklistItems,
        source: "saved" as const,
      })),
    ],
    [savedTemplates],
  );

  const selectedTemplate = templateOptions.find(
    (template) => template.id === selectedTemplateId,
  );

  const applyTemplate = useCallback((template: TaskTemplateOption) => {
    setForm((currentForm) => ({
      ...currentForm,
      title: template.title,
      description: template.description,
      priority: template.priority,
      status: template.status,
    }));
    setChecklistItems(toChecklistDraftItems(template.checklistItems));
    setTemplateError("");
    setTaskError("");
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let ignore = false;

    async function loadTemplates() {
      setIsLoadingTemplates(true);
      setTemplateError("");

      try {
        const response = await fetch("/api/task-templates", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load task templates.");
        }

        if (!ignore) {
          setSavedTemplates(data.templates ?? []);
        }
      } catch (error) {
        if (!ignore) {
          setTemplateError(getErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setIsLoadingTemplates(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      ignore = true;
    };
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen && initialTemplate) {
      setSelectedTemplateId(initialTemplate.id);
      applyTemplate(initialTemplate);
    }
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleApplySelectedTemplate() {
    if (!selectedTemplate) {
      return;
    }

    applyTemplate(selectedTemplate);
  }

  function handleChecklistItemChange(itemId: string, title: string) {
    setChecklistItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              title,
            }
          : item,
      ),
    );
  }

  function handleAddChecklistItem() {
    setChecklistItems((currentItems) => [
      ...currentItems,
      createChecklistDraftItem(),
    ]);
  }

  function handleRemoveChecklistItem(itemId: string) {
    setChecklistItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }

  async function handleSaveTemplate() {
    setTemplateError("");
    const payload = getTemplatePayload(form, templateName, checklistItems);

    if (!payload.name || !payload.title || !payload.description) {
      setTemplateError("Template name, task title, and description are required.");
      return;
    }

    setIsSavingTemplate(true);

    try {
      const response = await fetch("/api/task-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save task template.");
      }

      setSavedTemplates((currentTemplates) => [
        data.template,
        ...currentTemplates,
      ]);
      setSelectedTemplateId(data.template.id);
      setTemplateName("");
    } catch (error) {
      setTemplateError(getErrorMessage(error));
    } finally {
      setIsSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!selectedTemplate || selectedTemplate.source !== "saved") {
      return;
    }

    setTemplateError("");
    setIsDeletingTemplate(true);

    try {
      const response = await fetch(`/api/task-templates/${selectedTemplate.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to delete task template.");
      }

      setSavedTemplates((currentTemplates) =>
        currentTemplates.filter((template) => template.id !== selectedTemplate.id),
      );
      setSelectedTemplateId("");
    } catch (error) {
      setTemplateError(getErrorMessage(error));
    } finally {
      setIsDeletingTemplate(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskError("");
    setIsSavingTask(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          checklistItems: checklistItems
            .map((item) => item.title.trim())
            .filter((item) => item.length > 0),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save task.");
      }

      setForm(emptyTaskForm);
      setChecklistItems([]);
      setOpen(false);
      router.refresh();
    } catch (error) {
      setTaskError(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add new task</DialogTitle>
          <DialogDescription>
            Start from a planner template, customize the checklist, then save it
            as a real dashboard task.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-card/35 p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <label htmlFor="task-template" className="text-sm font-medium">
                Template
              </label>
              <select
                id="task-template"
                value={selectedTemplateId}
                className={inputClassName}
                disabled={isLoadingTemplates}
                onChange={(event) => setSelectedTemplateId(event.target.value)}>
                <option value="">
                  {isLoadingTemplates ? "Loading templates" : "Choose template"}
                </option>
                <optgroup label="Built-in templates">
                  {builtInTaskTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                {savedTemplates.length > 0 && (
                  <optgroup label="Your templates">
                    {savedTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="h-11 rounded-xl px-4"
              disabled={!selectedTemplate}
              onClick={handleApplySelectedTemplate}>
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-4"
              disabled={
                !selectedTemplate ||
                selectedTemplate.source !== "saved" ||
                isDeletingTemplate
              }
              onClick={handleDeleteTemplate}>
              {isDeletingTemplate ? "Deleting" : "Delete"}
            </Button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <label htmlFor="task-template-name" className="text-sm font-medium">
                Template name
              </label>
              <input
                id="task-template-name"
                type="text"
                value={templateName}
                placeholder="e.g., Morning study routine"
                className={inputClassName}
                onChange={(event) => setTemplateName(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-4"
              disabled={isSavingTemplate}
              onClick={handleSaveTemplate}>
              {isSavingTemplate ? "Saving" : "Save template"}
            </Button>
          </div>

          {templateError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {templateError}
            </p>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium">
              Task title
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={form.title}
              placeholder="e.g., Review project proposal"
              className={inputClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={form.description}
              placeholder="Add a short summary for this task"
              className={textAreaClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="task-priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="task-priority"
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
              <label htmlFor="task-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={form.status}
                className={inputClassName}
                onChange={handleFieldChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="task-due-date" className="text-sm font-medium">
                Due date
              </label>
              <input
                id="task-due-date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                className={inputClassName}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Checklist
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add the steps this task should track.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl px-3"
                onClick={handleAddChecklistItem}>
                Add item
              </Button>
            </div>

            {checklistItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                No checklist items yet.
              </p>
            ) : (
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="Checklist item"
                      className={inputClassName}
                      onChange={(event) =>
                        handleChecklistItemChange(item.id, event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 rounded-xl px-3 text-destructive"
                      onClick={() => handleRemoveChecklistItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {taskError && (
            <p className="text-sm text-destructive" role="alert">
              {taskError}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingTask}>
              {isSavingTask ? "Saving" : "Save task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
