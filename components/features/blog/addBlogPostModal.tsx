"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createPostSchema,
  getFirstValidationMessage,
} from "@/prisma/validation/schemaValidation";
import { ImageUploadField } from "@/components/features/uploads/imageUploadField";
import type { UploadedImage } from "@/types/media";

type AddBlogPostModalProps = {
  trigger?: ReactNode;
  open?: boolean;
  initialForm?: BlogPostFormState;
  onOpenChange?: (open: boolean) => void;

};

type BlogPostFormState = {
  title: string;
  content: string;
};

const emptyBlogPostForm: BlogPostFormState = {
  title: "",
  content: "",
};

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[12rem] py-2`;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function AddBlogPostModal({ trigger,initialForm, open: controlledOpen, onOpenChange}: AddBlogPostModalProps) {

  const [form, setForm] = useState<BlogPostFormState>(emptyBlogPostForm);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  
  function setOpen(nextOpen: boolean) {
    if (onOpenChange) {
      onOpenChange(nextOpen);
      return;
    }
    setInternalOpen(nextOpen);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && initialForm) {
      setForm(initialForm);
    }
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }
// handles the form submission
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // create the payload for the API request
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      // The first uploaded image is reused as the cover while all images keep their order.
      coverImageId: images[0]?.mediaAssetId,
      postImages: images.map((image, position) => ({
        mediaAssetId: image.mediaAssetId,
        altText: image.alt,
        position,
      })),
    };

    // validate the payload
    const validation = createPostSchema.safeParse(payload);

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    setIsSaving(true);

    try {
      // send the payload to the API
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      // get the response from the API
      const data = await response.json();
      // if the response is not ok, throw an error

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save post.");
      }

      // reset the form
      setForm(emptyBlogPostForm);
      setImages([]);
      // close the modal
      setOpen(false);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add blog post</DialogTitle>
          <DialogDescription>
            Write a title and content, then save it to your blog.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="blog-post-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="blog-post-title"
              name="title"
              type="text"
              value={form.title}
              placeholder="e.g., What I finished today"
              className={inputClassName}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="blog-post-content" className="text-sm font-medium">
              Content
            </label>
            <textarea
              id="blog-post-content"
              name="content"
              value={form.content}
              placeholder="Write your post..."
              className={textAreaClassName}
              onChange={handleFieldChange}
            />
          </div>

          <ImageUploadField
            value={images}
            onChange={setImages}
            onUploadingChange={setIsUploadingImages}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploadingImages}>
              {isSaving ? "Saving" : "Save post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
