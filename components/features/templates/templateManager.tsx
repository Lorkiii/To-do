"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

import { AddTaskModal } from "@/components/features/dashboard/addTaskModal";
import { Button } from "@/components/ui/button";
import { builtInTaskTemplates } from "@/lib/taskTemplates";
import type {
  ChecklistDraftItem,
  SavedTaskTemplate,
  TaskTemplateOption,
} from "@/types/taskTemplates";

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[6.5rem] py-2`;

type TemplateFormState = {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  checklistItems: ChecklistDraftItem[];
};

const emptyTemplateForm: TemplateFormState = {
  id: "",
  name: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  checklistItems: [],
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

function toTemplateOption(template: SavedTaskTemplate): TaskTemplateOption {
  return {
    id: template.id,
    name: template.name,
    title: template.title,
    description: template.description,
    priority: template.priority,
    status: template.status,
    checklistItems: template.checklistItems,
    source: "saved",
  };
}

function getTemplatePayload(form: TemplateFormState) {
  return {
    name: form.name.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    status: form.status,
    checklistItems: form.checklistItems
      .map((item) => item.title.trim())
      .filter((item) => item.length > 0),
  };
}

export function TemplateManager() {
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [form, setForm] = useState<TemplateFormState>(emptyTemplateForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState("");

  const isEditing = form.id.length > 0;

  useEffect(() => {
    let ignore = false;

    async function loadTemplates() {
      setIsLoading(true);
      setError("");

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
      } catch (loadError) {
        if (!ignore) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      ignore = true;
    };
  }, []);

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleChecklistItemChange(itemId: string, title: string) {
    setForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              title,
            }
          : item,
      ),
    }));
  }

  function handleAddChecklistItem() {
    setForm((currentForm) => ({
      ...currentForm,
      checklistItems: [
        ...currentForm.checklistItems,
        createChecklistDraftItem(),
      ],
    }));
  }

  function handleRemoveChecklistItem(itemId: string) {
    setForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.filter(
        (item) => item.id !== itemId,
      ),
    }));
  }

  function handleCreateNew() {
    setForm(emptyTemplateForm);
    setError("");
  }

  function handleCustomizeBuiltInTemplate(template: TaskTemplateOption) {
    setForm({
      id: "",
      name: `${template.name} copy`,
      title: template.title,
      description: template.description,
      priority: template.priority,
      status: template.status,
      checklistItems: toChecklistDraftItems(template.checklistItems),
    });
    setError("");
  }

  function handleEditTemplate(template: SavedTaskTemplate) {
    setForm({
      id: template.id,
      name: template.name,
      title: template.title,
      description: template.description,
      priority: template.priority,
      status: template.status,
      checklistItems: toChecklistDraftItems(template.checklistItems),
    });
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = getTemplatePayload(form);

    try {
      const response = await fetch(
        isEditing ? `/api/task-templates/${form.id}` : "/api/task-templates",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save template.");
      }

      if (isEditing) {
        setSavedTemplates((currentTemplates) =>
          currentTemplates.map((template) =>
            template.id === data.template.id ? data.template : template,
          ),
        );
      } else {
        setSavedTemplates((currentTemplates) => [
          data.template,
          ...currentTemplates,
        ]);
      }

      setForm(emptyTemplateForm);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    setError("");
    setDeletingTemplateId(templateId);

    try {
      const response = await fetch(`/api/task-templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to delete template.");
      }

      setSavedTemplates((currentTemplates) =>
        currentTemplates.filter((template) => template.id !== templateId),
      );

      if (form.id === templateId) {
        setForm(emptyTemplateForm);
      }
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingTemplateId("");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Template builder</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit template" : "Create template"}
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl px-4"
            onClick={handleCreateNew}>
            New
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="template-name" className="text-sm font-medium">
              Template name
            </label>
            <input
              id="template-name"
              name="name"
              type="text"
              value={form.name}
              placeholder="e.g., Weekly study plan"
              className={inputClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="template-title" className="text-sm font-medium">
              Task title
            </label>
            <input
              id="template-title"
              name="title"
              type="text"
              value={form.title}
              placeholder="e.g., Prepare for exams"
              className={inputClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="template-description"
              className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="template-description"
              name="description"
              value={form.description}
              placeholder="Describe what this planner should help complete"
              className={textAreaClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="template-priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="template-priority"
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
              <label htmlFor="template-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="template-status"
                name="status"
                value={form.status}
                className={inputClassName}
                onChange={handleFieldChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">Checklist</h3>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl px-3"
                onClick={handleAddChecklistItem}>
                Add item
              </Button>
            </div>

            {form.checklistItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                Add checklist items for this template.
              </p>
            ) : (
              <div className="space-y-2">
                {form.checklistItems.map((item, index) => (
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

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(emptyTemplateForm)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving" : isEditing ? "Update template" : "Save template"}
            </Button>
          </div>
        </form>
      </section>

      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-accent">Built-in templates</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {builtInTaskTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onCustomize={() => handleCustomizeBuiltInTemplate(template)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-accent">Your templates</p>
          {isLoading ? (
            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Loading templates.
            </p>
          ) : savedTemplates.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No custom templates yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {savedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={toTemplateOption(template)}
                  isDeleting={deletingTemplateId === template.id}
                  onEdit={() => handleEditTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isDeleting = false,
  onCustomize,
  onEdit,
  onDelete,
}: {
  template: TaskTemplateOption;
  isDeleting?: boolean;
  onCustomize?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-background/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {template.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{template.title}</p>
        </div>
        <span className="rounded-full border border-border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
          {template.source === "built-in" ? "Built-in" : "Saved"}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {template.description}
      </p>

      <ul className="mt-4 space-y-2">
        {template.checklistItems.slice(0, 4).map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 size-2 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <AddTaskModal
          initialTemplate={template}
          trigger={
            <Button type="button" className="h-9 rounded-xl px-3">
              Use
            </Button>
          }
        />
        {template.source === "built-in" ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl px-3"
            onClick={onCustomize}>
            Customize
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl px-3"
              onClick={onEdit}>
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl px-3 text-destructive"
              disabled={isDeleting}
              onClick={onDelete}>
              {isDeleting ? "Deleting" : "Delete"}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
