"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BloggerIcon, TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import type { BlogPostListItem } from "@/types/blog";

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

const textAreaClassName = `${inputClassName} min-h-[12rem] py-2`;

type BlogFormState = {
  title: string;
  content: string;
};

type BlogManagerProps = {
  posts: BlogPostListItem[];
};

const emptyBlogForm: BlogFormState = {
  title: "",
  content: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function BlogManager({ posts }: BlogManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormState>(emptyBlogForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    setError("");

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
    };

    if (!payload.title || !payload.content) {
      setError("Title and content are required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save post.");
      }

      setForm(emptyBlogForm);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">New post</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              Blog entry
            </h2>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/55 text-muted-foreground">
            <HugeiconsIcon icon={BloggerIcon} strokeWidth={2} />
          </span>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="post-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              value={form.title}
              placeholder="e.g., What I finished today"
              className={inputClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="post-content" className="text-sm font-medium">
              Content
            </label>
            <textarea
              id="post-content"
              name="content"
              value={form.content}
              placeholder="Write the update, reflection, or notes for this post"
              className={textAreaClassName}
              required
              onChange={handleFieldChange}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="h-10 rounded-xl px-4"
              disabled={isSaving}>
              <HugeiconsIcon icon={BloggerIcon} strokeWidth={2} />
              {isSaving ? "Saving" : "Save post"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">Private blog</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              Recent posts
            </h2>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/55 text-muted-foreground">
            <HugeiconsIcon icon={TimeScheduleIcon} strokeWidth={2} />
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {posts.length === 0 ? (
            <p className="rounded-lg border border-border bg-background/55 p-4 text-sm text-muted-foreground">
              No posts have been saved yet.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-lg border border-border bg-background/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {post.content}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Updated {post.updatedAt}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span>Created {post.createdAt}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
