import type { z } from "zod";

import prisma from "@/prisma/client";
import type {
  createPostSchema,
  updatePostSchema,
} from "@/prisma/validation/schemaValidation";
import { assertUserOwnsMediaAssets } from "@/services/mediaService";

type CreatePostInput = z.infer<typeof createPostSchema>;
type UpdatePostInput = z.infer<typeof updatePostSchema>;

const postSelect = {
  id: true,
  title: true,
  content: true,
  authorId: true,
  published: true,
  coverImageId: true,
  coverImage: true,
  postImages: {
    orderBy: { position: "asc" },
    include: { mediaAsset: true },
  },
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

export async function createPost(authorId: string, data: CreatePostInput) {
  const postImages = data.postImages ?? [];
  const mediaAssetIds = [
    data.coverImageId,
    ...postImages.map((image) => image.mediaAssetId),
  ].filter((mediaAssetId): mediaAssetId is string => Boolean(mediaAssetId));

  await assertUserOwnsMediaAssets(mediaAssetIds, authorId);

  return prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId,
      published: false,
      coverImageId: data.coverImageId,
      ...(postImages.length > 0
        ? {
            postImages: {
              create: postImages.map((image, index) => ({
                mediaAssetId: image.mediaAssetId,
                altText: image.altText,
                caption: image.caption,
                position: image.position ?? index,
              })),
            },
          }
        : {}),
    },
    select: postSelect,
  });
}

function findPost(authorId: string, postId: string) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
      deletedAt: null,
    },
    select: postSelect,
  });
}

export async function updatePost(
  authorId: string,
  postId: string,
  data: UpdatePostInput,
) {
  // Only the editable text fields are touched here; image management stays in create.
  const postUpdateData: { title?: string; content?: string } = {};

  if (data.title !== undefined) {
    postUpdateData.title = data.title;
  }

  if (data.content !== undefined) {
    postUpdateData.content = data.content;
  }

  const { count } = await prisma.post.updateMany({
    where: {
      id: postId,
      authorId,
      deletedAt: null,
    },
    data: postUpdateData,
  });

  if (count === 0) {
    return null;
  }

  return findPost(authorId, postId);
}

export async function softDeletePost(authorId: string, postId: string) {
  const { count } = await prisma.post.updateMany({
    where: {
      id: postId,
      authorId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return count > 0;
}
