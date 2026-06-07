import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ActivityFeed } from "@/components/features/activity/activityFeed";
import { ActivityStatCards } from "@/components/features/activity/activityStatCards";
import { HabitRoutineCalendar } from "@/components/features/activity/habitRoutineCalendar";
import { DashboardActivityHeatmap } from "@/components/features/dashboard/activityHeatmap";
import { DashboardProgressSummary } from "@/components/features/dashboard/progressSummary";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { authOptions } from "@/lib/auth";
import { getActivityViewModel } from "@/services/activityService";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const activity = await getActivityViewModel(session.user.id);

  return (
    <DashboardSidebar activeItemId="activity">
      <header className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
        <p className="text-sm font-medium text-accent">Activity</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Your activity
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Track your task and writing streaks, then review everything you have
          worked on. Updated {activity.generatedAt}.
        </p>
      </header>

      <div className="mt-5 space-y-5">
        <ActivityStatCards stats={activity.stats} />

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <DashboardActivityHeatmap calendar={activity.activityCalendar} />
          <DashboardProgressSummary
            completionRate={activity.summary.completionRate}
            activeDays={activity.summary.activeDays}
            weeklyActivityCount={activity.summary.weeklyActivityCount}
          />
        </div>

        <HabitRoutineCalendar />

        <ActivityFeed groups={activity.groups} />
      </div>
    </DashboardSidebar>
  );
}
