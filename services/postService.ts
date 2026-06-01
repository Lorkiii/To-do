import type { z } from "zod";

import prisma from "@/prisma/client";
import type { createPostSchema } from "@/prisma/validation/schemaValidation";

type CreatePostInput = z.infer<typeof createPostSchema>;

const postSelect = {
  id: true,
  title: true,
  content: true,
  authorId: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function listPosts(authorId: string) {
  return prisma.post.findMany({
    where: {
      authorId,
      deletedAt: null,
    },
    orderBy: { updatedAt: "desc" },
    select: postSelect,
  });
}

export function createPost(authorId: string, data: CreatePostInput) {
  return prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId,
      published: false,
    },
    select: postSelect,
  });
}
