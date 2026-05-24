import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/client";
import {
  createPostSchema,
  getFirstValidationMessage,
} from "@/prisma/validation/schemaValidation";

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  const validatedData = createPostSchema.safeParse({ title, content });

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title: validatedData.data.title,
      content: validatedData.data.content,
    },
  });

  return NextResponse.json(post, {
    status: 201,
  });
}
