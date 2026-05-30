import type { z } from "zod";

import prisma from "@/prisma/client";
import type { createTaskSchema } from "@/prisma/validation/schemaValidation";

type CreateTaskInput = z.infer<typeof createTaskSchema>;

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
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        checklistItems: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            completed: true,
            position: true,
          },
        },
      },
    });
  });
}
