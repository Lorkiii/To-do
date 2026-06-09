export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];

export type ProfileSettings = {
  name: string | null;
  email: string;
  username: string;
  birthDate: string | null;
  usernameChangedAt: string | null;
  usernameChangeAvailableAt: string | null;
  usernameChangeCooldownDays: number;
  canChangeUsername: boolean;
};

export type SystemSettings = {
  notificationsEnabled: boolean;
  theme: Theme;
};

export type SettingsViewModel = {
  profile: ProfileSettings;
  system: SystemSettings;
};
