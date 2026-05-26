import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/client";
import {
  getFirstValidationMessage,
  loginSchema,
} from "@/prisma/validation/schemaValidation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = loginSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const { emailOrUsername, password } = validatedData.data;
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
  });
}
