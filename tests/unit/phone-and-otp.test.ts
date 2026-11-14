import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {}, prismaBase: {} }));

import { createPhoneVerificationToken, verifyPhoneVerificationToken } from "@/lib/otp";
import { indianMobileError, isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";

describe("phone helpers", () => {
  it("normalises pasted prefixes", () => {
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("9876543210");
    expect(normalizeIndianMobile("98765-43210")).toBe("9876543210");
  });

  it("validates Indian mobiles", () => {
    expect(isValidIndianMobile("9876543210")).toBe(true);
    expect(isValidIndianMobile("5876543210")).toBe(false);
    expect(indianMobileError("")).toMatch(/required/);
    expect(indianMobileError("98765")).toMatch(/10-digit/);
    expect(indianMobileError("1234567890")).toMatch(/start with/);
    expect(indianMobileError("9876543210")).toBeNull();
  });
});

describe("phone verification token", () => {
  afterEach(() => vi.useRealTimers());

  it("accepts a fresh token for the same phone", () => {
    const token = createPhoneVerificationToken("9876543210");
    expect(verifyPhoneVerificationToken(token, "9876543210")).toBe(true);
  });

  it("rejects a token for a different phone", () => {
    const token = createPhoneVerificationToken("9876543210");
    expect(verifyPhoneVerificationToken(token, "9123456789")).toBe(false);
  });

  it("rejects a tampered signature or payload", () => {
    const token = createPhoneVerificationToken("9876543210");
    const [phone, expires, sig] = token.split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("a") ? "b" : "a");
    expect(verifyPhoneVerificationToken(`${phone}.${expires}.${flipped}`, phone)).toBe(false);
    expect(verifyPhoneVerificationToken(`${phone}.${Number(expires) + 1000}.${sig}`, phone)).toBe(false);
    expect(verifyPhoneVerificationToken("garbage", phone)).toBe(false);
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    const token = createPhoneVerificationToken("9876543210");
    vi.advanceTimersByTime(61 * 60 * 1000);
    expect(verifyPhoneVerificationToken(token, "9876543210")).toBe(false);
  });
});
