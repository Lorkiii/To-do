import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getSettings, SettingsServiceError } from "@/services/settingsService";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getSettings(userId);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to load settings." },
      { status: 500 },
    );
  }
}
