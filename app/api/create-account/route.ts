import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/client";
import {
  getFirstValidationMessage,
  userSchema,
} from "@/prisma/validation/schemaValidation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = userSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: getFirstValidationMessage(validatedData.error) },
      { status: 400 },
    );
  }

  const { firstName, lastName, username, email, password } = validatedData.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: `${firstName} ${lastName}`,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email or username already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 },
    );
  }
}
