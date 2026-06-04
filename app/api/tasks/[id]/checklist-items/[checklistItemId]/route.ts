import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updateChecklistItemSchema,
} from "@/prisma/validation/schemaValidation";
import { updateChecklistItem } from "@/services/taskService";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; checklistItemId: string }> },
) {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    return unauthorizedResponse();
  }

  const { id, checklistItemId } = await params;

  if (!id || !checklistItemId) {
    return NextResponse.json(
      { error: "Task id and checklist item id are required." },
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

  const validatedData = updateChecklistItemSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  try {
    const task = await updateChecklistItem(
      authorId,
      id,
      checklistItemId,
      validatedData.data.completed,
    );

    if (!task) {
      return NextResponse.json(
        { error: "Checklist item not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Unable to update checklist item." },
      { status: 500 },
    );
  }
}
