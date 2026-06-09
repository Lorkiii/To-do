import { redirect } from "next/navigation";

import { SettingsPageClient } from "@/components/features/settings/settingsPageClient";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { auth } from "@/lib/auth";
import { getSettings } from "@/services/settingsService";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const settings = await getSettings(userId);

  return (
    <DashboardSidebar activeItemId="settings">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-accent">Account controls</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Manage your personal information, password, notifications, and
            appearance.
          </p>
        </header>

        <SettingsPageClient initialSettings={settings} />
      </div>
    </DashboardSidebar>
  );
}
