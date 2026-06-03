import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updateTaskSchema,
} from "@/prisma/validation/schemaValidation";
import { softDeleteTask, updateTask } from "@/services/taskService";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Task id is required." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const validatedData = updateTaskSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const hasTaskFieldUpdate = [
    "title",
    "description",
    "priority",
    "status",
    "dueDate",
    "pinned",
  ].some((fieldName) =>
    Object.prototype.hasOwnProperty.call(validatedData.data, fieldName),
  );

  if (!hasTaskFieldUpdate) {
    return NextResponse.json(
      { error: "At least one task field is required." },
      { status: 400 },
    );
  }

  try {
    const task = await updateTask(authorId, id, validatedData.data);

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Unable to update task." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Task id is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await softDeleteTask(authorId, id);

    if (!deleted) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete task." },
      { status: 500 },
    );
  }
}
