import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  coupon: { findUnique: vi.fn() },
  deliveryZone: { findFirst: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db, prismaBase: db }));

import { getDeliveryRule, resolveCoupon, shippingFor } from "@/lib/order-pricing";

const future = new Date(Date.now() + 86_400_000);
const past = new Date(Date.now() - 86_400_000);

beforeEach(() => {
  db.coupon.findUnique.mockReset();
  db.deliveryZone.findFirst.mockReset();
});

describe("shippingFor", () => {
  it("charges below the free-delivery threshold and not at or above it", () => {
    const rule = { charge: 49, minOrderValue: 500 };
    expect(shippingFor(499, rule)).toBe(49);
    expect(shippingFor(500, rule)).toBe(0);
    expect(shippingFor(0, rule)).toBe(0);
  });

  it("always charges when the zone has no free-delivery threshold", () => {
    expect(shippingFor(10_000, { charge: 30, minOrderValue: null })).toBe(30);
  });
});

describe("getDeliveryRule", () => {
  it("uses the zone that lists the pincode", async () => {
    db.deliveryZone.findFirst.mockResolvedValueOnce({ charge: 39.5, minOrderValue: 400 });
    await expect(getDeliveryRule("636001")).resolves.toEqual({ charge: 39.5, minOrderValue: 400 });
  });

  it("falls back to the catch-all zone, then to the flat default", async () => {
    db.deliveryZone.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ charge: 60, minOrderValue: null });
    await expect(getDeliveryRule("999999")).resolves.toEqual({ charge: 60, minOrderValue: null });

    db.deliveryZone.findFirst.mockResolvedValue(null);
    await expect(getDeliveryRule("999999")).resolves.toEqual({ charge: 49, minOrderValue: 500 });
  });
});

describe("resolveCoupon", () => {
  it("rejects an empty code", async () => {
    await expect(resolveCoupon("  ", 1000)).resolves.toMatchObject({ ok: false });
  });

  it("applies a percentage DB coupon, capped by maxDiscount and the subtotal", async () => {
    db.coupon.findUnique.mockResolvedValue({
      code: "BIG50", isActive: true, expiryDate: future, minOrderValue: null,
      isPercentage: true, discountValue: 50, maxDiscount: 100,
    });
    await expect(resolveCoupon("big50", 1000)).resolves.toEqual({ ok: true, code: "BIG50", discount: 100 });
    await expect(resolveCoupon("BIG50", 120)).resolves.toEqual({ ok: true, code: "BIG50", discount: 60 });
  });

  it("never discounts more than the subtotal for a fixed coupon", async () => {
    db.coupon.findUnique.mockResolvedValue({
      code: "FLAT200", isActive: true, expiryDate: future, minOrderValue: null,
      isPercentage: false, discountValue: 200, maxDiscount: null,
    });
    await expect(resolveCoupon("FLAT200", 150)).resolves.toEqual({ ok: true, code: "FLAT200", discount: 150 });
  });

  it("rejects inactive, expired and below-minimum DB coupons", async () => {
    const base = { code: "X", isPercentage: true, discountValue: 10, maxDiscount: null };
    db.coupon.findUnique.mockResolvedValueOnce({ ...base, isActive: false, expiryDate: future, minOrderValue: null });
    await expect(resolveCoupon("X", 1000)).resolves.toMatchObject({ ok: false, message: expect.stringMatching(/no longer active/) });

    db.coupon.findUnique.mockResolvedValueOnce({ ...base, isActive: true, expiryDate: past, minOrderValue: null });
    await expect(resolveCoupon("X", 1000)).resolves.toMatchObject({ ok: false, message: expect.stringMatching(/expired/) });

    db.coupon.findUnique.mockResolvedValueOnce({ ...base, isActive: true, expiryDate: future, minOrderValue: 500 });
    await expect(resolveCoupon("X", 499)).resolves.toMatchObject({ ok: false, message: expect.stringMatching(/spend/) });
  });

  it("a DB row overrides the built-in code of the same name", async () => {
    db.coupon.findUnique.mockResolvedValue({
      code: "FRESH10", isActive: false, expiryDate: future, minOrderValue: null,
      isPercentage: true, discountValue: 10, maxDiscount: null,
    });
    await expect(resolveCoupon("FRESH10", 1000)).resolves.toMatchObject({ ok: false });
  });

  it("falls back to built-in codes when no DB row exists", async () => {
    db.coupon.findUnique.mockResolvedValue(null);
    await expect(resolveCoupon("FRESH10", 1000)).resolves.toEqual({ ok: true, code: "FRESH10", discount: 100 });
    await expect(resolveCoupon("FRESH10", 100)).resolves.toMatchObject({ ok: false });
    await expect(resolveCoupon("NOPE", 1000)).resolves.toMatchObject({ ok: false });
  });
});
