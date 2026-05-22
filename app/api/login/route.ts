import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/prisma/validation/schemaValidation";
import prisma from "@/prisma/client";

// login route
export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    const validatedData = loginSchema.safeParse({ email, password });
    if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error.message }, {
            status: 400,
        });
    }
    const user = await prisma.user.findUnique({
        where: { email: validatedData.data.email },
    });
}