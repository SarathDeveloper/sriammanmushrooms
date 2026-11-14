/**
 * Runs the real order route handlers and admin actions against Postgres.
 * Needs TEST_DATABASE_URL pointing at a disposable database that has had
 * `prisma migrate deploy` run on it. Skipped when it isn't set.
 *
 *   TEST_DATABASE_URL=postgres://... npm test
 */
import { createHmac, randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const TEST_DB = process.env.TEST_DATABASE_URL;

// Env read at import time by lib/prisma and lib/features, so set before any
// app module loads (the app modules below are imported dynamically).
if (TEST_DB) {
  process.env.DATABASE_URL = TEST_DB;
  process.env.NEXT_PUBLIC_ORDERS_ENABLED = "true";
  process.env.RAZORPAY_KEY_SECRET = "test_razorpay_secret";
}

const session = vi.hoisted(() => ({ current: null as null | { user: { id: string; role: string; email?: string } } }));

vi.mock("next-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth")>()),
  getServerSession: vi.fn(async () => session.current),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/notifications", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/notifications")>()),
  notifyOrderConfirmation: vi.fn(async () => ({ delivered: false, mode: "disabled" })),
  notifyOrderStatusUpdate: vi.fn(async () => ({ delivered: false, mode: "disabled" })),
}));

type App = {
  prisma: typeof import("@/lib/prisma").prisma;
  prismaBase: typeof import("@/lib/prisma").prismaBase;
  createOrder: typeof import("@/app/api/(storefront)/orders/create/route").POST;
  verifyOrder: typeof import("@/app/api/(storefront)/orders/verify/route").POST;
  updateOrderStatus: typeof import("@/app/admin/actions").updateOrderStatus;
  createPhoneVerificationToken: typeof import("@/lib/otp").createPhoneVerificationToken;
  consumeRateLimit: typeof import("@/lib/rate-limit").consumeRateLimit;
};

describe.skipIf(!TEST_DB)("orders (integration)", () => {
  let app: App;
  const run = randomUUID().slice(0, 8);
  const ids = { user: "", admin: "", category: "", product: "", pricey: "" };
  const phone = "9876543210";

  function post(url: string, body: unknown) {
    return new Request(`http://localhost${url}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    });
  }

  function orderBody(productId: string, quantity: number) {
    return {
      items: [{ productId, quantity }],
      fullName: "Test Buyer",
      phone,
      phoneVerifiedToken: app.createPhoneVerificationToken(phone),
      address: "1 Test St",
      city: "Salem",
      state: "Tamil Nadu",
      pincode: "636001",
      paymentMethod: "cod",
    };
  }

  beforeAll(async () => {
    const prismaMod = await import("@/lib/prisma");
    app = {
      prisma: prismaMod.prisma,
      prismaBase: prismaMod.prismaBase,
      createOrder: (await import("@/app/api/(storefront)/orders/create/route")).POST,
      verifyOrder: (await import("@/app/api/(storefront)/orders/verify/route")).POST,
      updateOrderStatus: (await import("@/app/admin/actions")).updateOrderStatus,
      createPhoneVerificationToken: (await import("@/lib/otp")).createPhoneVerificationToken,
      consumeRateLimit: (await import("@/lib/rate-limit")).consumeRateLimit,
    };
    const { prisma } = app;
    ids.user = (await prisma.user.create({ data: { name: "Buyer", phone: `t${run}u` } })).id;
    ids.admin = (await prisma.user.create({ data: { name: "Admin", phone: `t${run}a`, role: "ADMIN" } })).id;
    ids.category = (await prisma.category.create({ data: { name: `Cat ${run}`, slug: `cat-${run}` } })).id;
    ids.product = (
      await prisma.product.create({
        data: { name: "Last One", slug: `last-${run}`, description: "d", price: 150.5, stock: 1, images: [], categoryId: ids.category },
      })
    ).id;
    ids.pricey = (
      await prisma.product.create({
        data: { name: "Pricey", slug: `pricey-${run}`, description: "d", price: 199.99, stock: 50, images: [], categoryId: ids.category },
      })
    ).id;
  });

  afterAll(async () => {
    if (!app) return;
    const { prisma, prismaBase } = app;
    await prisma.order.deleteMany({ where: { userId: { in: [ids.user, ids.admin] } } });
    await prisma.product.deleteMany({ where: { categoryId: ids.category } });
    await prisma.category.deleteMany({ where: { id: ids.category } });
    await prisma.user.deleteMany({ where: { id: { in: [ids.user, ids.admin] } } });
    await prismaBase.rateLimit.deleteMany({ where: { key: { startsWith: `it-${run}` } } });
    await prismaBase.$disconnect();
  });

  it("prices orders from the database, not the client, and stores exact amounts", async () => {
    session.current = { user: { id: ids.user, role: "USER", email: "b@example.com" } };
    const res = await app.createOrder(post("/api/orders/create", orderBody(ids.pricey, 3)));
    expect(res.status).toBe(200);
    const body = await res.json();
    // 3 x 199.99 = 599.97, over the 500 free-delivery threshold.
    expect(body).toMatchObject({ subtotal: 599.97, shipping: 0, total: 599.97 });

    const order = await app.prisma.order.findUniqueOrThrow({ where: { id: body.orderId }, include: { orderItems: true } });
    expect(order.totalAmount).toBe(599.97);
    expect(order.orderItems[0].price).toBe(199.99);
    expect(order.shippingAddress).toMatchObject({ fullName: "Test Buyer", city: "Salem", paymentMethod: "cod" });
  });

  it("sells the last unit exactly once under concurrent checkouts", async () => {
    session.current = { user: { id: ids.user, role: "USER" } };
    const results = await Promise.all(
      Array.from({ length: 6 }, () => app.createOrder(post("/api/orders/create", orderBody(ids.product, 1)))),
    );
    const ok = results.filter((r) => r.status === 200);
    expect(ok).toHaveLength(1);
    const product = await app.prisma.product.findUniqueOrThrow({ where: { id: ids.product } });
    expect(product.stock).toBe(0);
  });

  it("rejects orders without a valid OTP token or session", async () => {
    session.current = { user: { id: ids.user, role: "USER" } };
    const res = await app.createOrder(post("/api/orders/create", { ...orderBody(ids.pricey, 1), phoneVerifiedToken: "bad" }));
    expect(res.status).toBe(400);

    session.current = null;
    expect((await app.createOrder(post("/api/orders/create", orderBody(ids.pricey, 1)))).status).toBe(401);
  });

  it("cancelling releases stock once; re-opening retakes it only if available", async () => {
    session.current = { user: { id: ids.user, role: "USER" } };
    const order = await app.prisma.order.findFirstOrThrow({
      where: { userId: ids.user, orderItems: { some: { productId: ids.product } } },
    });

    session.current = { user: { id: ids.admin, role: "ADMIN" } };
    expect(await app.updateOrderStatus(order.id, "CANCELLED")).toEqual({ success: true });
    expect(await app.updateOrderStatus(order.id, "CANCELLED")).toEqual({ success: true });
    expect((await app.prisma.product.findUniqueOrThrow({ where: { id: ids.product } })).stock).toBe(1);

    // Someone else buys the released unit, so re-opening must fail cleanly.
    await app.prisma.product.update({ where: { id: ids.product }, data: { stock: 0 } });
    const reopen = await app.updateOrderStatus(order.id, "PROCESSING");
    expect(reopen.success).toBe(false);
    const after = await app.prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(after.status).toBe("CANCELLED");
    expect((await app.prisma.product.findUniqueOrThrow({ where: { id: ids.product } })).stock).toBe(0);

    session.current = { user: { id: ids.user, role: "USER" } };
    expect(await app.updateOrderStatus(order.id, "PROCESSING")).toEqual({ success: false, error: "Unauthorized" });
  });

  describe("payment verification", () => {
    const sign = (orderId: string, paymentId: string) =>
      createHmac("sha256", "test_razorpay_secret").update(`${orderId}|${paymentId}`).digest("hex");

    async function pendingOrder(razorpayOrderId: string, total: number) {
      return app.prisma.order.create({
        data: { userId: ids.user, totalAmount: total, razorpayOrderId, shippingAddress: { fullName: "Pay" } },
      });
    }

    it("marks a correctly signed payment as paid, once", async () => {
      session.current = { user: { id: ids.user, role: "USER" } };
      const order = await pendingOrder(`order_ok_${run}`, 500);
      const body = {
        orderId: order.id,
        razorpay_order_id: `order_ok_${run}`,
        razorpay_payment_id: "pay_1",
        razorpay_signature: sign(`order_ok_${run}`, "pay_1"),
      };
      expect((await app.verifyOrder(post("/api/orders/verify", body))).status).toBe(200);
      const paid = await app.prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      expect(paid).toMatchObject({ paymentStatus: "COMPLETED", status: "PROCESSING", paymentId: "pay_1" });
      expect((await app.verifyOrder(post("/api/orders/verify", body))).status).toBe(400);
    });

    it("rejects a valid payment replayed against a different order", async () => {
      session.current = { user: { id: ids.user, role: "USER" } };
      await pendingOrder(`order_cheap_${run}`, 10);
      const expensive = await pendingOrder(`order_exp_${run}`, 5000);
      const res = await app.verifyOrder(
        post("/api/orders/verify", {
          orderId: expensive.id,
          razorpay_order_id: `order_cheap_${run}`,
          razorpay_payment_id: "pay_cheap",
          razorpay_signature: sign(`order_cheap_${run}`, "pay_cheap"),
        }),
      );
      expect(res.status).toBe(400);
      expect((await app.prisma.order.findUniqueOrThrow({ where: { id: expensive.id } })).paymentStatus).toBe("PENDING");
    });

    it("marks a bad signature as failed and refuses other users' orders", async () => {
      session.current = { user: { id: ids.user, role: "USER" } };
      const order = await pendingOrder(`order_bad_${run}`, 100);
      const body = {
        orderId: order.id,
        razorpay_order_id: `order_bad_${run}`,
        razorpay_payment_id: "pay_x",
        razorpay_signature: "0".repeat(64),
      };
      expect((await app.verifyOrder(post("/api/orders/verify", body))).status).toBe(400);
      expect((await app.prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus).toBe("FAILED");

      session.current = { user: { id: ids.admin, role: "ADMIN" } };
      expect((await app.verifyOrder(post("/api/orders/verify", body))).status).toBe(404);
    });
  });

  it("rate limiter counts atomically across concurrent requests", async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => app.consumeRateLimit(`it-${run}-burst`, 5, 60_000)),
    );
    expect(results.filter((r) => r.success)).toHaveLength(5);
  });
});
