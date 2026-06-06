import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { authOptions } from "@/lib/auth";
import {
  getFirstValidationMessage,
  imageUploadClientPayloadSchema,
  imageUploadTokenPayloadSchema,
} from "@/prisma/validation/schemaValidation";
import { uploadImageRules } from "@/prisma/validation/validationRules";
import { createMediaAsset } from "@/services/mediaService";

// Helper function to parse JSON
function parseJson(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
// GET THE FILE TYPE FROM THE FILE NAME
function getFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.trim().toLowerCase();
  return extension || "unknown";
}
// HANDLE THE IMAGE UPLOAD
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!ownerId) {
          throw new Error("Unauthorized");
        }

        const expectedPrefix = `blog-images/${ownerId}/`;

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Invalid image upload path");
        }

        const validatedPayload = imageUploadClientPayloadSchema.safeParse(
          parseJson(clientPayload),
        );

        if (!validatedPayload.success) {
          throw new Error(
            getFirstValidationMessage(validatedPayload.error),
          );
        }
        // RETURN THE ALLOWED CONTENT TYPES, MAXIMUM SIZE IN BYTES, ADD RANDOM SUFFIX, AND TOKEN PAYLOAD
        return {
          allowedContentTypes: [...uploadImageRules.allowedContentTypes],
          maximumSizeInBytes: uploadImageRules.maxFileSizeBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            ...validatedPayload.data,
            ownerId,
          }),
        };
      },
      // HANDLE THE IMAGE UPLOAD COMPLETED
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // VALIDATE THE TOKEN PAYLOAD
        const validatedPayload = imageUploadTokenPayloadSchema.safeParse(
          parseJson(tokenPayload ?? null),
        );

        if (!validatedPayload.success) {
          throw new Error("Invalid image upload callback payload");
        }

        if (
          !uploadImageRules.allowedContentTypes.includes(
            blob.contentType as (typeof uploadImageRules.allowedContentTypes)[number],
          )
        ) {
          throw new Error("Unsupported uploaded image type");
        }

        const payload = validatedPayload.data;

        await createMediaAsset(payload.ownerId, {
          id: payload.mediaAssetId,
          url: blob.url,
          pathName: blob.pathname,
          fileName: payload.fileName,
          fileType: getFileType(payload.fileName),
          contentType: blob.contentType,
          sizeBytes: payload.sizeBytes,
          width: payload.width,
          height: payload.height,
          cropX: payload.cropX,
          cropY: payload.cropY,
          cropWidth: payload.cropWidth,
          cropHeight: payload.cropHeight,
          alt: payload.alt,
        });
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process image upload",
      },
      { status: 400 },
    );
  }
}
