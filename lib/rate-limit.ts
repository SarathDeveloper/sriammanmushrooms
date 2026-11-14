import { NextResponse } from "next/server";

import { prismaBase } from "@/lib/prisma";

/**
 * Fixed-window rate limiting backed by the "RateLimit" table, so limits are
 * shared by every server instance (Vercel runs many) and survive restarts.
 *
 * Each check is one atomic INSERT ... ON CONFLICT: the first hit in a window
 * creates the row, later hits increment it, and a hit after the window has
 * expired resets it. If the database is unreachable the request is allowed
 * (fail open) so a DB blip can't lock everyone out of the site.
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Epoch milliseconds when the current window ends. */
  reset: number;
};

type CounterRow = { count: number; resetAt: Date };

/** Removes expired rows on roughly 1 in CLEANUP_ODDS checks. */
const CLEANUP_ODDS = 50;

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowEnd = new Date(now + windowMs);

  try {
    const rows = await prismaBase.$queryRaw<CounterRow[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${windowEnd})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."resetAt" <= NOW() THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
          ELSE "RateLimit"."resetAt"
        END
      RETURNING "count", "resetAt"
    `;

    if (Math.floor(Math.random() * CLEANUP_ODDS) === 0) {
      prismaBase.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < NOW()`.catch(
        (error: unknown) => console.error("[rate-limit] cleanup failed:", error),
      );
    }

    const row = rows[0];
    const count = Number(row.count);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: new Date(row.resetAt).getTime(),
    };
  } catch (error) {
    console.error("[rate-limit] check failed, allowing request:", error);
    return { success: true, remaining: limit, reset: now + windowMs };
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export async function withRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>,
  options: { limit?: number; identifier?: string; windowMs?: number } = {},
): Promise<NextResponse> {
  const { limit = apiLimits.general, identifier = "api", windowMs = 60 * 1000 } = options;
  const key = `${identifier}:${getClientIp(request.headers)}`;

  const result = await consumeRateLimit(key, limit, windowMs);

  if (!result.success) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
        },
      },
    );
  }

  const response = await handler();

  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());

  return response;
}

/** Per-minute limits per IP for API route groups. */
export const apiLimits = {
  auth: 10,
  otp: 5,
  orders: 30,
  general: 60,
} as const;
