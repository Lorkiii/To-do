import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { themeCookieMaxAgeSeconds } from "@/lib/settingsPolicy";
import {
  getFirstValidationMessage,
  updateSystemSettingsSchema,
} from "@/prisma/validation/schemaValidation";
import {
  SettingsServiceError,
  updateSystemSettings,
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

  const result = updateSystemSettingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(result.error) },
      { status: 400 },
    );
  }

  try {
    const settings = await updateSystemSettings(userId, result.data);
    const response = NextResponse.json({ settings });

    if (result.data.theme) {
      response.cookies.set("theme", result.data.theme, {
        httpOnly: false,
        maxAge: themeCookieMaxAgeSeconds,
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to update system settings." },
      { status: 500 },
    );
  }
}
