import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/client";
import {
  getFirstValidationMessage,
  loginSchema,
} from "@/prisma/validation/schemaValidation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const validatedData = loginSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }
// get the email or username and password from the validated data
  const emailOrUsername = validatedData.data.emailOrUsername.trim().toLowerCase();
  const password = validatedData.data.password;

  try {
    // find the user by email or username
    const user = await prisma.user.findUnique({
      where: emailOrUsername.includes("@")
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email, username, or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email, username, or password." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      message: "Login successful.",
      route: "/dashboard",
    });

  } catch {
    return NextResponse.json(
      { error: "Unable to log in right now." },
      { status: 500 },
    );
  }
}
