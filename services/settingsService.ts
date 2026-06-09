import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import type { z } from "zod";

import {
  canChangeUsername,
  defaultSystemSettings,
  getUsernameChangeAvailableAt,
  usernameChangeCooldownDays,
} from "@/lib/settingsPolicy";
import prisma from "@/prisma/client";
import type {
  updatePasswordSettingsSchema,
  updateProfileSettingsSchema,
  updateSystemSettingsSchema,
} from "@/prisma/validation/schemaValidation";
import type { SettingsViewModel, Theme } from "@/types/settings";

type UpdateProfileInput = z.infer<typeof updateProfileSettingsSchema>;
type UpdatePasswordInput = z.infer<typeof updatePasswordSettingsSchema>;
type UpdateSystemInput = z.infer<typeof updateSystemSettingsSchema>;

export class SettingsServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function formatBirthDate(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? null;
}

function parseBirthDate(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function normalizeTheme(theme: string | undefined): Theme {
  return theme === "light" ? "light" : defaultSystemSettings.theme;
}

export async function getSettings(userId: string): Promise<SettingsViewModel> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
      birthDate: true,
      usernameChangedAt: true,
      settings: {
        select: {
          notificationsEnabled: true,
          theme: true,
        },
      },
    },
  });

  if (!user) {
    throw new SettingsServiceError("User not found.", 404);
  }

  const availableAt = getUsernameChangeAvailableAt(user.usernameChangedAt);

  return {
    profile: {
      name: user.name,
      email: user.email,
      username: user.username,
      birthDate: formatBirthDate(user.birthDate),
      usernameChangedAt: user.usernameChangedAt?.toISOString() ?? null,
      usernameChangeAvailableAt: availableAt?.toISOString() ?? null,
      usernameChangeCooldownDays,
      canChangeUsername: canChangeUsername(user.usernameChangedAt),
    },
    system: {
      notificationsEnabled:
        user.settings?.notificationsEnabled ??
        defaultSystemSettings.notificationsEnabled,
      theme: normalizeTheme(user.settings?.theme),
    },
  };
}

export async function updateProfileSettings(
  userId: string,
  data: UpdateProfileInput,
) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      usernameChangedAt: true,
    },
  });

  if (!currentUser) {
    throw new SettingsServiceError("User not found.", 404);
  }

  const usernameChanged =
    data.username !== undefined && data.username !== currentUser.username;

  if (
    usernameChanged &&
    !canChangeUsername(currentUser.usernameChangedAt)
  ) {
    const availableAt = getUsernameChangeAvailableAt(
      currentUser.usernameChangedAt,
    );
    throw new SettingsServiceError(
      `Username can only be changed once every ${usernameChangeCooldownDays} days. Try again after ${availableAt?.toISOString()}.`,
      429,
    );
  }

  try {
    if (usernameChanged) {
      const { count } = await prisma.user.updateMany({
        where: {
          id: userId,
          usernameChangedAt: currentUser.usernameChangedAt,
        },
        data: {
          username: data.username,
          usernameChangedAt: new Date(),
          birthDate: parseBirthDate(data.birthDate),
        },
      });

      if (count === 0) {
        throw new SettingsServiceError(
          "Username eligibility changed. Reload settings and try again.",
          409,
        );
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          birthDate: parseBirthDate(data.birthDate),
        },
      });
    }
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new SettingsServiceError(
        "That username is already in use.",
        409,
      );
    }

    throw error;
  }

  return getSettings(userId);
}

export async function updatePassword(
  userId: string,
  data: UpdatePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new SettingsServiceError("User not found.", 404);
  }

  const passwordMatches = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new SettingsServiceError("Current password is incorrect.", 400);
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function updateSystemSettings(
  userId: string,
  data: UpdateSystemInput,
) {
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      notificationsEnabled:
        data.notificationsEnabled ??
        defaultSystemSettings.notificationsEnabled,
      theme: data.theme ?? defaultSystemSettings.theme,
    },
    update: data,
  });

  return getSettings(userId);
}
