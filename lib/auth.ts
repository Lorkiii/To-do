import bcrypt from "bcrypt";
import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import prisma from "@/prisma/client";
import {
  getFirstValidationMessage,
  loginSchema,
} from "@/prisma/validation/schemaValidation";
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  //   jwt strategy is used to create a token that is used to authenticate the user
  session: {
    strategy: "jwt",
  },
  providers: [  // credentials provider is used to authenticate the user with email and password
    CredentialsProvider({
      credentials: { emailOrUsername: { label: "Email or Username", type: "text" }, password: { label: "Password", type: "password" }, },
      async authorize(credentials) {
        const validatedData = loginSchema.safeParse(credentials);
        if (!validatedData.success) {
          throw new Error(getFirstValidationMessage(validatedData.error));
        }

        const emailOrUsername = validatedData.data.emailOrUsername
          .trim()
          .toLowerCase();
        const password = validatedData.data.password;

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
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
});
