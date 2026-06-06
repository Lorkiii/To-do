import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { BlogManager } from "@/components/features/blog/blogManager";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { authOptions } from "@/lib/auth";
import { listPosts } from "@/services/postService";
import type { BlogPostListItem } from "@/types/blog";

export const dynamic = "force-dynamic";

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toBlogPostListItem(post: Awaited<ReturnType<typeof listPosts>>[number]) {
  return {
    id: post.id,
    title: post.title,
    content: post.content ?? "",
    images: post.postImages.map((postImage) => ({
      id: postImage.id,
      url: postImage.mediaAsset.url,
      fileName: postImage.mediaAsset.fileName,
      altText: postImage.altText ?? postImage.mediaAsset.alt ?? undefined,
    })),
    createdAt: formatPostDate(post.createdAt),
    updatedAt: formatPostDate(post.updatedAt),
  } satisfies BlogPostListItem;
}

export default async function BlogPage() {
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;

  if (!authorId) {
    redirect("/login");
  }

  const posts = await listPosts(authorId);

  return (
    <DashboardSidebar activeItemId="blog">
      <header className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <p className="text-sm font-medium text-accent">Private writing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Blog
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keep project notes, progress updates, and reflections beside your tasks.
        </p>
      </header>

      <div className="mt-5">
        <BlogManager posts={posts.map(toBlogPostListItem)} />
      </div>
    </DashboardSidebar>
  );
}
