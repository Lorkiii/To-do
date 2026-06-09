"use client";

import { useState } from "react";
import { Setting07Icon, UserSettings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { PasswordSettingsForm } from "@/components/features/settings/passwordSettingsForm";
import { ProfileSettingsForm } from "@/components/features/settings/profileSettingsForm";
import { SystemSettingsForm } from "@/components/features/settings/systemSettingsForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { SettingsViewModel } from "@/types/settings";

export function SettingsPageClient({
  initialSettings,
}: {
  initialSettings: SettingsViewModel;
}) {
  const [settings, setSettings] = useState(initialSettings);

  return (
    <Tabs defaultValue="profile">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="profile" className="flex-1 sm:flex-none">
          <HugeiconsIcon icon={UserSettings01Icon} strokeWidth={2} />
          Profile
        </TabsTrigger>
        <TabsTrigger value="system" className="flex-1 sm:flex-none">
          <HugeiconsIcon icon={Setting07Icon} strokeWidth={2} />
          System
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-5">
        <ProfileSettingsForm
          settings={settings}
          onSettingsChange={setSettings}
        />
        <PasswordSettingsForm />
      </TabsContent>

      <TabsContent value="system">
        <SystemSettingsForm
          settings={settings}
          onSettingsChange={setSettings}
        />
      </TabsContent>
    </Tabs>
  );
}
