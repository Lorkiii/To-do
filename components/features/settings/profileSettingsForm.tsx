"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsFormStatus } from "@/components/features/settings/settingsFormStatus";
import { validationRules } from "@/prisma/validation/validationRules";
import type { SettingsViewModel } from "@/types/settings";

type ProfileSettingsFormProps = {
  settings: SettingsViewModel;
  onSettingsChange: (settings: SettingsViewModel) => void;
};

function formatCooldownDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProfileSettingsForm({
  settings,
  onSettingsChange,
}: ProfileSettingsFormProps) {
  const { profile } = settings;
  const [username, setUsername] = useState(profile.username);
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          birthDate: birthDate || null,
        }),
      });
      const result = (await response.json()) as {
        settings?: SettingsViewModel;
        error?: string;
      };

      if (!response.ok || !result.settings) {
        setErrorMessage(result.error ?? "Unable to update your profile.");
        return;
      }

      onSettingsChange(result.settings);
      setUsername(result.settings.profile.username);
      setBirthDate(result.settings.profile.birthDate ?? "");
      setSuccessMessage("Personal information updated.");
    } catch {
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Personal information
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Your name and email identify this account and cannot be changed here.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={profile.name ?? ""}
              readOnly
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={profile.email}
              readOnly
              disabled
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-username">Username</Label>
            <Input
              id="settings-username"
              value={username}
              minLength={validationRules.user.username.minLength}
              autoComplete="username"
              disabled={!profile.canChangeUsername}
              onChange={(event) => setUsername(event.target.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {profile.canChangeUsername
                ? `You may change your username now. The next change will be available in ${profile.usernameChangeCooldownDays} days.`
                : `Username changes are available again on ${formatCooldownDate(profile.usernameChangeAvailableAt)}.`}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-birth-date">Birth date</Label>
            <Input
              id="settings-birth-date"
              type="date"
              value={birthDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Optional. You can add, update, or remove it later.
            </p>
          </div>
        </div>

        <SettingsFormStatus message={errorMessage} />
        <SettingsFormStatus message={successMessage} tone="success" />

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="h-10 px-4"
            disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  );
}
