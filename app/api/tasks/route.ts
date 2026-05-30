import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  createTaskSchema,
  getFirstValidationMessage,
} from "@/prisma/validation/schemaValidation";
import { createTask } from "@/services/taskService";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const validatedData = createTaskSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  try {
    const task = await createTask(authorId, validatedData.data);

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create task." },
      { status: 500 },
    );
  }
}
