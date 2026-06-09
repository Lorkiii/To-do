"use client";

import { FormEvent, useState } from "react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signOut } from "next-auth/react";

import { SettingsFormStatus } from "@/components/features/settings/settingsFormStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validationRules } from "@/prisma/validation/validationRules";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
};

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          minLength={validationRules.user.password.minLength}
          autoComplete={autoComplete}
          className="pr-11"
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1.5"
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          onClick={() => setIsVisible((current) => !current)}>
          <HugeiconsIcon
            icon={isVisible ? ViewOffSlashIcon : ViewIcon}
            strokeWidth={2}
          />
        </Button>
      </div>
    </div>
  );
}

export function PasswordSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to update your password.");
        return;
      }

      await signOut({ callbackUrl: "/login" });
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
          Change password
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Confirm your current password before setting a new one. You will be
          signed out after the change.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <PasswordField
          id="current-password"
          label="Current password"
          value={currentPassword}
          autoComplete="current-password"
          onChange={setCurrentPassword}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            autoComplete="new-password"
            onChange={setNewPassword}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={setConfirmPassword}
          />
        </div>

        <SettingsFormStatus message={errorMessage} />

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="h-10 px-4"
            disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </div>
      </form>
    </section>
  );
}
