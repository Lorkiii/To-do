export type TaskTemplateSource = "built-in" | "saved";

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

export type SavedTaskTemplate = Omit<TaskTemplateOption, "source"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ChecklistDraftItem = {
  id: string;
  title: string;
};
