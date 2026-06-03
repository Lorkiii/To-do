export type TaskListItem = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};
