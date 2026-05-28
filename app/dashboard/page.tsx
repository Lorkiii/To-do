import { DashboardActivityHeatmap } from "@/components/features/dashboard/activityHeatmap";
import {
  DashboardRecentActivity,
  DashboardTaskList,
} from "@/components/features/dashboard/activityLists";
import { DashboardProgressSummary } from "@/components/features/dashboard/progressSummary";
import { DashboardStatCards } from "@/components/features/dashboard/statCards";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { Button } from "@/components/ui/button";
import { getDashboardViewModel } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  console.log("DASHBOARD SESSION:", session);
  if (!session) {
    redirect("/login");
  }
  const dashboard = await getDashboardViewModel();

  return (
    <DashboardSidebar activeItemId="dashboard">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card/70 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {dashboard.userName} dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Updated {dashboard.generatedAt}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90">
          <a href="#tasks">View tasks</a>
        </Button>
      </header>

      <div className="mt-5 space-y-5">
        <DashboardStatCards stats={dashboard.stats} />

        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]" id="activity">
          <DashboardProgressSummary
            completionRate={dashboard.summary.completionRate}
            activeDays={dashboard.summary.activeDays}
            weeklyActivityCount={dashboard.summary.weeklyActivityCount}
          />
          <DashboardActivityHeatmap activityDays={dashboard.activityDays} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2" id="tasks">
          <DashboardTaskList tasks={dashboard.upcomingTasks} />
          <DashboardRecentActivity activities={dashboard.recentActivities} />
        </div>

        <section
          id="settings"
          className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-accent">Settings</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Dashboard preferences
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This section is reserved for theme, notification, and task view
            preferences when those backend settings are available.
          </p>
        </section>
      </div>
    </DashboardSidebar>
  );
}
