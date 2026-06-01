import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updateTaskTemplateSchema,
} from "@/prisma/validation/schemaValidation";
import {
  deleteTaskTemplate,
  updateTaskTemplate,
} from "@/services/taskTemplateService";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Delete one saved template owned by the signed-in user.
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
      { error: "Template id is required." },
      { status: 400 },
    );
  }

  const deleted = await deleteTaskTemplate(authorId, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Template not found." },
      { status: 404 },
    );
  }

  return new Response(null, { status: 204 });
}

// Update one saved template by its dynamic route id.
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
      { error: "Template id is required." },
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

  const validatedData = updateTaskTemplateSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const template = await updateTaskTemplate(authorId, id, validatedData.data);

  if (!template) {
    return NextResponse.json(
      { error: "Template not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ template });
}
