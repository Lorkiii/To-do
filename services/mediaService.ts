import { Prisma } from "@prisma/client";

import prisma from "@/prisma/client";

type CreateMediaAssetInput = {
  id: string;
  url: string;
  fileType: string;
  sizeBytes: number;
  fileName: string;
  contentType: string;
  pathName: string;
  width: number;
  height: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  alt?: string;
};

type UpdateMediaAssetInput = {
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  alt?: string;
};
export function createMediaAsset(ownerId: string, data: CreateMediaAssetInput) {
  return prisma.mediaAsset
    .create({
      data: {
        ...data,
        ownerId,
      },
    })
    .catch(async (error: unknown) => {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existingAsset = await prisma.mediaAsset.findFirst({
          where: {
            id: data.id,
            ownerId,
            pathName: data.pathName,
          },
        });

        if (existingAsset) {
          return existingAsset;
        }
      }

      throw error;
    });
}

// fetches a media asset by id and owner id
export async function getMediaAsset(mediaAssetId: string, ownerId: string) {
  return prisma.mediaAsset.findUnique({
    where: { id: mediaAssetId, ownerId, deletedAt: null },
  });
}

export async function assertUserOwnsMediaAssets(
  mediaAssetIds: string[],
  ownerId: string,
) {
  const uniqueIds = [...new Set(mediaAssetIds)];

  if (uniqueIds.length === 0) {
    return;
  }

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: uniqueIds }, ownerId, deletedAt: null },
    select: { id: true },
  });

  if (assets.length !== uniqueIds.length) {
    throw new Error("One or more images are invalid");
  }
}


export async function deleteMediaAsset(mediaAssetId: string, ownerId: string) {
  return prisma.mediaAsset.updateMany({
    where: { id: mediaAssetId, ownerId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}


export async function updateMediaAsset(
  mediaAssetId: string,
  ownerId: string,
  data: UpdateMediaAssetInput,
) {
  return prisma.mediaAsset.updateMany({
    where: { id: mediaAssetId, ownerId, deletedAt: null },
    data,
  });
}
