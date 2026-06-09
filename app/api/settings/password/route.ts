import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getFirstValidationMessage,
  updatePasswordSettingsSchema,
} from "@/prisma/validation/schemaValidation";
import {
  SettingsServiceError,
  updatePassword,
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

  const result = updatePasswordSettingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(result.error) },
      { status: 400 },
    );
  }

  try {
    await updatePassword(userId, result.data);
    return NextResponse.json({ message: "Password updated." });
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to update password." },
      { status: 500 },
    );
  }
}
