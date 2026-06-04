import type { z } from "zod";

import prisma from "@/prisma/client";
import type {
  createTaskSchema,
  updateTaskSchema,
} from "@/prisma/validation/schemaValidation";
import type { TaskListItem } from "@/types/tasks";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type TaskUpdateData = {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date | null;
  pinned?: boolean;
};

const taskListSelect = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  checklistItems: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      completed: true,
      position: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

function normalizeChecklistItems(items: readonly string[] = []) {
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function toDateOrNull(value?: string) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function toTaskUpdateData(data: UpdateTaskInput) {
  const taskUpdateData: TaskUpdateData = {};

  if (data.title !== undefined) {
    taskUpdateData.title = data.title;
  }

  if (data.description !== undefined) {
    taskUpdateData.description = data.description;
  }

  if (data.priority !== undefined) {
    taskUpdateData.priority = data.priority;
  }

  if (data.status !== undefined) {
    taskUpdateData.status = data.status;
  }

  if (data.pinned !== undefined) {
    taskUpdateData.pinned = data.pinned;
  }

  if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
    taskUpdateData.dueDate = toDateOrNull(data.dueDate);
  }

  return taskUpdateData;
}

function findTask(authorId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      authorId,
      deletedAt: null,
    },
    select: taskListSelect,
  });
}

export function listTasks(authorId: string): Promise<TaskListItem[]> {
  return prisma.task.findMany({
    where: {
      authorId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: taskListSelect,
  });
}

export async function updateTask(
  authorId: string,
  taskId: string,
  data: UpdateTaskInput,
): Promise<TaskListItem | null> {
  const taskUpdateData = toTaskUpdateData(data);

  const { count } = await prisma.task.updateMany({
    where: {
      id: taskId,
      authorId,
      deletedAt: null,
    },
    data: taskUpdateData,
  });

  if (count === 0) {
    return null;
  }

  return findTask(authorId, taskId);
}

export async function softDeleteTask(authorId: string, taskId: string) {
  const { count } = await prisma.task.updateMany({
    where: {
      id: taskId,
      authorId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return count > 0;
}

export async function updateChecklistItem(
  authorId: string,
  taskId: string,
  checklistItemId: string,
  completed: boolean,
): Promise<TaskListItem | null> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      authorId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    return null;
  }

  const { count } = await prisma.taskChecklistItem.updateMany({
    where: {
      id: checklistItemId,
      taskId,
    },
    data: {
      completed,
    },
  });

  if (count === 0) {
    return null;
  }

  return findTask(authorId, taskId);
}

export async function createTask(authorId: string, data: CreateTaskInput) {
  return prisma.$transaction(async (transaction) => {
    const dueDate = toDateOrNull(data.dueDate);
    const checklistItems = normalizeChecklistItems(data.checklistItems);

    return transaction.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate,
        authorId,
        pinned: data.pinned ?? false,
        checklistItems: {
          create: checklistItems.map((title, index) => ({
            title,
            position: index,
          })),
        },
      },
      select: taskListSelect,
    });
  });
}
