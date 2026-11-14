import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma, prismaBase } from "./prisma";
import bcrypt from "bcryptjs";
import { normalizeIndianMobile } from "./phone";
import { consumeRateLimit } from "./rate-limit";

// Login attempts allowed per window, counted separately per IP and per phone,
// so a password can't be brute-forced from one machine or against one account.
const LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function headerValue(headers: Record<string, unknown> | undefined, name: string): string | undefined {
  const value = headers?.[name];
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : undefined;
  return typeof value === "string" ? value : undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaBase),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const ip =
          headerValue(req?.headers, "x-forwarded-for")?.split(",")[0]?.trim() ||
          headerValue(req?.headers, "x-real-ip") ||
          "unknown";
        const phoneKey = normalizeIndianMobile(credentials.phone) || credentials.phone.trim();
        const [byIp, byPhone] = await Promise.all([
          consumeRateLimit(`login-ip:${ip}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS),
          consumeRateLimit(`login-phone:${phoneKey}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS),
        ]);
        if (!byIp.success || !byPhone.success) {
          throw new Error("Too many login attempts. Please wait 15 minutes and try again.");
        }

        // Accounts store the bare 10 digits, but older ones (e.g. from
        // create-admin.ts) used +91…, so accept either form.
        const phone = normalizeIndianMobile(credentials.phone);
        const user = await prisma.user.findFirst({
          where: {
            phone: { in: [phone, `+91${phone}`, credentials.phone.trim()] },
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        return token;
      }

      // Re-read role and status so deactivated, demoted or deleted users lose
      // access straight away instead of when their JWT expires.
      if (token.id) {
        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, isActive: true },
        });
        if (!current || !current.isActive) {
          token.id = "";
          token.role = "";
        } else {
          token.role = current.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
