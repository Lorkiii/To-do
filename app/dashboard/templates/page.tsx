import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { TemplateManager } from "@/components/features/templates/templateManager";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardSidebar activeItemId="templates">
      <header className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <p className="text-sm font-medium text-accent">Planner templates</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Templates
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage reusable daily, student, workout, and custom planner checklists.
        </p>
      </header>

      <div className="mt-5">
        <TemplateManager />
      </div>
    </DashboardSidebar>
  );
}
