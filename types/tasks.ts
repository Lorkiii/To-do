export type TaskChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export type TaskListItem = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: Date | string | null;
  checklistItems: TaskChecklistItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
};
