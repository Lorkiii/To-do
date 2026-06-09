import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updateProfileSettingsSchema,
} from "@/prisma/validation/schemaValidation";
import {
  SettingsServiceError,
  updateProfileSettings,
} from "@/services/settingsService";

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const result = updateProfileSettingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(result.error) },
      { status: 400 },
    );
  }

  try {
    const settings = await updateProfileSettings(userId, result.data);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to update profile settings." },
      { status: 500 },
    );
  }
}
