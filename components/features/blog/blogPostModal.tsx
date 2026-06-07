"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BloggerIcon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getFirstValidationMessage,
  updatePostSchema,
} from "@/prisma/validation/schemaValidation";
import type { BlogPostListItem } from "@/types/blog";

type BlogPostModalMode = "view" | "edit";

type BlogPostModalProps = {
  post: BlogPostListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: BlogPostModalMode;
};

type BlogPostFormState = {
  title: string;
  content: string;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[14rem] py-2 leading-6`;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function PostImages({ post }: { post: BlogPostListItem }) {
  if (post.images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {post.images.map((image) => (
        <div
          key={image.id}
          className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted"
        >
          <Image
            src={image.url}
            alt={image.altText || image.fileName}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, 180px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function BlogPostModal({
  post,
  open,
  onOpenChange,
  initialMode = "view",
}: BlogPostModalProps) {
  const router = useRouter();
  // The parent remounts this modal per opened post (via key), so props seed state once.
  const [mode, setMode] = useState<BlogPostModalMode>(initialMode);
  const [form, setForm] = useState<BlogPostFormState>(() => ({
    title: post?.title ?? "",
    content: post?.content ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!post) {
      return;
    }

    setError(null);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
    };

    const validation = updatePostSchema.safeParse(payload);

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update post.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to delete post.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setIsDeleting(false);
    }
  }

  const isEditing = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="gap-1 border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2 text-accent">
            <HugeiconsIcon
              icon={isEditing ? Edit02Icon : BloggerIcon}
              strokeWidth={2}
              className="size-4"
            />
            <span className="text-sm font-medium">
              {isEditing ? "Edit post" : "Post details"}
            </span>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditing ? "Update your blog entry" : (post?.title ?? "Blog post")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the title and content, then save your changes."
              : post
                ? `Updated ${post.updatedAt} \u00b7 Created ${post.createdAt}`
                : "View your blog post."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form className="space-y-4 p-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="edit-post-title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="edit-post-title"
                name="title"
                type="text"
                value={form.title}
                placeholder="Post title"
                className={inputClassName}
                onChange={handleFieldChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-post-content" className="text-sm font-medium">
                Content
              </label>
              <textarea
                id="edit-post-content"
                name="content"
                value={form.content}
                placeholder="Write your post..."
                className={textAreaClassName}
                onChange={handleFieldChange}
              />
            </div>

            {post && post.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached images</p>
                <PostImages post={post} />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode("view");
                  setError(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 p-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {post?.content || "This post has no content yet."}
            </p>

            {post && post.images.length > 0 && <PostImages post={post} />}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                {confirmDelete
                  ? isDeleting
                    ? "Deleting..."
                    : "Confirm delete"
                  : "Delete"}
              </Button>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isDeleting}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={() => {
                    setConfirmDelete(false);
                    setMode("edit");
                  }}
                  disabled={isDeleting}
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
