import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(() => Promise.resolve(0)),
}));
vi.mock("@/lib/prisma", () => ({ prisma: db, prismaBase: db }));

import { validateEnv } from "@/lib/env";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry, then x-real-ip", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(getClientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("consumeRateLimit", () => {
  it("allows up to the limit and blocks after it", async () => {
    const resetAt = new Date(Date.now() + 60_000);
    db.$queryRaw.mockResolvedValueOnce([{ count: 3, resetAt }]);
    await expect(consumeRateLimit("k", 3, 60_000)).resolves.toMatchObject({ success: true, remaining: 0 });
    db.$queryRaw.mockResolvedValueOnce([{ count: 4, resetAt }]);
    await expect(consumeRateLimit("k", 3, 60_000)).resolves.toMatchObject({ success: false, remaining: 0 });
  });

  it("fails open when the database is unavailable", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    db.$queryRaw.mockRejectedValueOnce(new Error("connection refused"));
    await expect(consumeRateLimit("k", 3, 60_000)).resolves.toMatchObject({ success: true });
    spy.mockRestore();
  });
});

describe("validateEnv", () => {
  const base = {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://x",
    NEXTAUTH_SECRET: "s".repeat(40),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
  };

  it("accepts the minimum catalogue-mode config", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => validateEnv(base as unknown as NodeJS.ProcessEnv)).not.toThrow();
    warn.mockRestore();
  });

  it("throws in production when a required variable is missing", () => {
    expect(() => validateEnv({ NODE_ENV: "production", NEXTAUTH_SECRET: "x" } as unknown as NodeJS.ProcessEnv)).toThrow(/DATABASE_URL/);
  });

  it("only logs outside production", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => validateEnv({ NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv)).not.toThrow();
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it("requires payment and SMS keys once ordering is switched on", () => {
    expect(() =>
      validateEnv({ ...base, NEXT_PUBLIC_ORDERS_ENABLED: "true" } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/RAZORPAY_KEY_SECRET/);
  });
});
