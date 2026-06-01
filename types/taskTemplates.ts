// Identifies whether a template comes from code or the database.
export type TaskTemplateSource = "built-in" | "saved";

// Shared display shape for built-in and saved templates.
export type TaskTemplateOption = {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  checklistItems: string[];
  source: TaskTemplateSource;
};

// Database-backed template returned by the API.
export type SavedTaskTemplate = Omit<TaskTemplateOption, "source"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Temporary checklist row used while editing forms.
export type ChecklistDraftItem = {
  id: string;
  title: string;
};
