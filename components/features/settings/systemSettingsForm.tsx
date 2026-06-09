"use client";

import { useState } from "react";
import {
  Moon02Icon,
  Notification02Icon,
  Sun02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { SettingsFormStatus } from "@/components/features/settings/settingsFormStatus";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { SettingsViewModel, Theme } from "@/types/settings";

type SystemSettingsFormProps = {
  settings: SettingsViewModel;
  onSettingsChange: (settings: SettingsViewModel) => void;
};

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun02Icon },
  { value: "dark" as const, label: "Dark", icon: Moon02Icon },
];

export function SystemSettingsForm({
  settings,
  onSettingsChange,
}: SystemSettingsFormProps) {
  const { theme, setTheme, isSavingTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings.system.notificationsEnabled,
  );
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function updateNotifications(enabled: boolean) {
    const previousValue = notificationsEnabled;
    setNotificationsEnabled(enabled);
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingNotifications(true);

    try {
      const response = await fetch("/api/settings/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: enabled }),
      });
      const result = (await response.json()) as {
        settings?: SettingsViewModel;
        error?: string;
      };

      if (!response.ok || !result.settings) {
        setNotificationsEnabled(previousValue);
        setErrorMessage(result.error ?? "Unable to update notifications.");
        return;
      }

      onSettingsChange(result.settings);
      setSuccessMessage("Notification preference saved.");
    } catch {
      setNotificationsEnabled(previousValue);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function updateTheme(nextTheme: Theme) {
    setErrorMessage("");
    setSuccessMessage("");

    const updated = await setTheme(nextTheme);
    if (!updated) {
      setErrorMessage("Unable to save the theme preference.");
      return;
    }

    setSuccessMessage("Theme preference saved.");
  }

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          System preferences
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          These preferences are saved to your account and follow you across
          devices.
        </p>
      </div>

      <div className="mt-6 divide-y divide-border">
        <div className="flex items-center justify-between gap-5 py-5 first:pt-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <HugeiconsIcon icon={Notification02Icon} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Notifications
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Master preference for current and future account notifications.
              </p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            disabled={isSavingNotifications}
            aria-label="Enable notifications"
            onCheckedChange={(checked) => void updateNotifications(checked)}
          />
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Appearance</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Choose the color mode used throughout Lazylet.
            </p>
          </div>
          <div
            className="grid grid-cols-2 rounded-md bg-muted p-1"
            aria-label="Theme">
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                size="lg"
                className={cn(
                  "h-9 min-w-24",
                  theme === option.value &&
                    "bg-background text-foreground shadow-xs hover:bg-background",
                )}
                disabled={isSavingTheme}
                aria-pressed={theme === option.value}
                onClick={() => void updateTheme(option.value)}>
                <HugeiconsIcon icon={option.icon} strokeWidth={2} />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <SettingsFormStatus message={errorMessage} />
      <SettingsFormStatus message={successMessage} tone="success" />
    </section>
  );
}
