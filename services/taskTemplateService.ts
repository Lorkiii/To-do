import type { z } from "zod";

import prisma from "@/prisma/client";
import type {
  createTaskTemplateSchema,
  updateTaskTemplateSchema,
} from "@/prisma/validation/schemaValidation";

type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>;
type UpdateTaskTemplateInput = z.infer<typeof updateTaskTemplateSchema>;
type TaskTemplateRecord = {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  checklistItems: string[];
  createdAt: Date;
  updatedAt: Date;
};

type TaskTemplateWithChecklistItems = Omit<
  TaskTemplateRecord,
  "checklistItems"
> & {
  checklistItems: { title: string }[];
};

// Clean checklist text before storing it.
function normalizeChecklistItems(items: readonly string[] = []) {
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// Shape Prisma checklist rows into simple string arrays for the UI.
function toTaskTemplateRecord(
  template: TaskTemplateWithChecklistItems,
): TaskTemplateRecord {
  return {
    ...template,
    checklistItems: template.checklistItems.map((item) => item.title),
  };
}

// Load all saved templates for one user.
export function listTaskTemplates(authorId: string) {
  return prisma.taskTemplate
    .findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        checklistItems: {
          orderBy: { position: "asc" },
          select: { title: true },
        },
      },
    })
    .then((templates) => templates.map(toTaskTemplateRecord));
}

// Find one template while enforcing user ownership.
export async function getTaskTemplate(authorId: string, templateId: string) {
  const template = await prisma.taskTemplate.findFirst({
    where: {
      id: templateId,
      authorId,
    },
    select: {
      id: true,
      name: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      checklistItems: {
        orderBy: { position: "asc" },
        select: { title: true },
      },
    },
  });

  return template ? toTaskTemplateRecord(template) : null;
}

// Save a new template and its ordered checklist items together.
export async function createTaskTemplate(
  authorId: string,
  data: CreateTaskTemplateInput,
) {
  return prisma.$transaction(async (transaction) => {
    const checklistItems = normalizeChecklistItems(data.checklistItems);
    const template = await transaction.taskTemplate.create({
      data: {
        name: data.name,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        authorId,
        checklistItems: {
          create: checklistItems.map((title, index) => ({
            title,
            position: index,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        checklistItems: {
          orderBy: { position: "asc" },
          select: { title: true },
        },
      },
    });

    return toTaskTemplateRecord(template);
  });
}

// Merge partial edits, then replace checklist rows in order.
export async function updateTaskTemplate(
  authorId: string,
  templateId: string,
  data: UpdateTaskTemplateInput,
) {
  const currentTemplate = await getTaskTemplate(authorId, templateId);

  if (!currentTemplate) {
    return null;
  }

  const nextTemplate = {
    name: data.name ?? currentTemplate.name,
    title: data.title ?? currentTemplate.title,
    description: data.description ?? currentTemplate.description,
    priority: data.priority ?? currentTemplate.priority,
    status: data.status ?? currentTemplate.status,
    checklistItems: data.checklistItems ?? currentTemplate.checklistItems,
  };

  return prisma.$transaction(async (transaction) => {
    const checklistItems = normalizeChecklistItems(nextTemplate.checklistItems);
    const template = await transaction.taskTemplate.update({
      where: { id: templateId },
      data: {
        name: nextTemplate.name,
        title: nextTemplate.title,
        description: nextTemplate.description,
        priority: nextTemplate.priority,
        status: nextTemplate.status,
        checklistItems: {
          deleteMany: {},
          create: checklistItems.map((title, index) => ({
            title,
            position: index,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        checklistItems: {
          orderBy: { position: "asc" },
          select: { title: true },
        },
      },
    });

    return toTaskTemplateRecord(template);
  });
}

// Remove one template only if it belongs to the user.
export async function deleteTaskTemplate(authorId: string, templateId: string) {
  const { count } = await prisma.taskTemplate.deleteMany({
    where: {
      id: templateId,
      authorId,
    },
  });

  return count > 0;
}
