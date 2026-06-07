import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { BlogManager } from "@/components/features/blog/blogManager";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { authOptions } from "@/lib/auth";
import { listPosts, toBlogPostListItem } from "@/services/postService";

export const dynamic = "force-dynamic";

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
