import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  createTaskTemplateSchema,
  getFirstValidationMessage,
} from "@/prisma/validation/schemaValidation";
import {
  createTaskTemplate,
  listTaskTemplates,
} from "@/services/taskTemplateService";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    return unauthorizedResponse();
  }

  const templates = await listTaskTemplates(authorId);

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    return unauthorizedResponse();
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

  const validatedData = createTaskTemplateSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  try {
    const template = await createTaskTemplate(authorId, validatedData.data);

    return NextResponse.json({ template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save task template." },
      { status: 500 },
    );
  }
}
