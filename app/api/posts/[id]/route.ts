import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updatePostSchema,
} from "@/prisma/validation/schemaValidation";
import { softDeletePost, updatePost } from "@/services/postService";

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
      { error: "Post id is required." },
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

  const validatedData = updatePostSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const hasEditableField = ["title", "content"].some((fieldName) =>
    Object.prototype.hasOwnProperty.call(validatedData.data, fieldName),
  );

  if (!hasEditableField) {
    return NextResponse.json(
      { error: "At least one post field is required." },
      { status: 400 },
    );
  }

  try {
    const post = await updatePost(authorId, id, validatedData.data);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Unable to update post." },
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
      { error: "Post id is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await softDeletePost(authorId, id);

    if (!deleted) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete post." },
      { status: 500 },
    );
  }
}
