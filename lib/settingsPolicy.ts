import type { Theme } from "@/types/settings";

export const usernameChangeCooldownDays = 7;
export const usernameChangeCooldownMs =
  usernameChangeCooldownDays * 24 * 60 * 60 * 1000;
export const themeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export const defaultSystemSettings = {
  notificationsEnabled: true,
  theme: "dark" as Theme,
};

export function getUsernameChangeAvailableAt(changedAt: Date | null) {
  if (!changedAt) {
    return null;
  }

  return new Date(changedAt.getTime() + usernameChangeCooldownMs);
}

export function canChangeUsername(
  changedAt: Date | null,
  now = new Date(),
) {
  const availableAt = getUsernameChangeAvailableAt(changedAt);
  return !availableAt || availableAt <= now;
}
