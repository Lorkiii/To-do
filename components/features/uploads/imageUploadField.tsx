"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import {
  ImageAdd01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { uploadImageRules } from "@/prisma/validation/validationRules";
import type { UploadedImage } from "@/types/media";

type ImageUploadFieldProps = {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read ${file.name}.`));
    };

    image.src = objectUrl;
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-");
}

function validateFile(file: File) {
  if (
    !uploadImageRules.allowedContentTypes.includes(
      file.type as (typeof uploadImageRules.allowedContentTypes)[number],
    )
  ) {
    return `${file.name} is not a supported image type.`;
  }

  if (file.size > uploadImageRules.maxFileSizeBytes) {
    return `${file.name} must be 5 MB or smaller.`;
  }

  return null;
}

export function ImageUploadField({
  value,
  onChange,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    const ownerId = session?.user?.id;

    if (!files?.length || !ownerId) {
      setError(ownerId ? null : "You must be signed in to upload images.");
      return;
    }

    const remainingSlots = uploadImageRules.maxImagesPerPost - value.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      setError(`You can upload up to ${uploadImageRules.maxImagesPerPost} images.`);
      return;
    }

    setError(null);
    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const uploadedImages: UploadedImage[] = [];

      for (const file of selectedFiles) {
        const validationError = validateFile(file);

        if (validationError) {
          throw new Error(validationError);
        }

        // Dimensions are recorded before upload so the database can describe the final image.
        const { width, height } = await getImageDimensions(file);
        const mediaAssetId = crypto.randomUUID();
        const pathname = `blog-images/${ownerId}/${mediaAssetId}-${sanitizeFileName(file.name)}`;

        // The browser sends the file to Blob while the API route only grants restricted access.
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/uploads/images",
          clientPayload: JSON.stringify({
            mediaAssetId,
            fileName: file.name,
            sizeBytes: file.size,
            width,
            height,
          }),
        });

        uploadedImages.push({
          mediaAssetId,
          url: blob.url,
          pathname: blob.pathname,
          fileName: file.name,
          width,
          height,
        });
      }

      onChange([...value, ...uploadedImages]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium" htmlFor={inputId}>
          Images
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{uploadImageRules.maxImagesPerPost}
        </span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={uploadImageRules.allowedContentTypes.join(",")}
        multiple
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={
          isUploading ||
          status === "loading" ||
          value.length >= uploadImageRules.maxImagesPerPost
        }
        onClick={() => inputRef.current?.click()}
      >
        <HugeiconsIcon
          icon={isUploading ? Loading03Icon : ImageAdd01Icon}
          className={isUploading ? "animate-spin" : undefined}
          strokeWidth={2}
        />
        {isUploading ? "Uploading" : "Add images"}
      </Button>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((image) => (
            <div
              key={image.mediaAssetId}
              className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image
                src={image.url}
                alt={image.alt || image.fileName}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 180px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
