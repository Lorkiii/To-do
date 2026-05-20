import { NextRequest } from "next/server";
import { createPostSchema} from "@/prisma/validation/schemaValidation";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  const validatedData = createPostSchema.safeParse({ title, content });

  if (!validatedData.success) {
    return NextResponse.json({ error: validatedData.error.message }, {
      status: 400,
    });
  }
  const post = await prisma.post.create({
    data: {
      title: validatedData.data.title,
      content: validatedData.data.content
    },
  });
  return NextResponse.json(post, {
    status: 201,
  });
}


