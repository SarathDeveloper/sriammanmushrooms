import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool, PoolConfig } from "pg";

const isProduction = process.env.NODE_ENV === "production";
// Each Vercel function instance gets its own pool, so keep it small there and
// point DATABASE_URL at the provider's pooled (pgbouncer) connection string.
const isServerless = !!process.env.VERCEL;
// `next build` prerenders pages in many parallel workers, each with its own
// pool; a large per-worker pool would open hundreds of connections at build.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

function poolMax(): number {
  const fromEnv = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  if (isBuild) return 2;
  if (isServerless) return 3;
  return isProduction ? 10 : 5;
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: poolMax(),
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: !isProduction,
};

function createClient() {
  const pool = new Pool(poolConfig);
  const client = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: isProduction ? ["error"] : ["error", "warn"],
  });
  return { pool, client };
}

const globalForPrisma = globalThis as unknown as {
  prismaBase: ReturnType<typeof createClient> | undefined;
};

const base = globalForPrisma.prismaBase ?? createClient();
if (!isProduction) globalForPrisma.prismaBase = base;

/**
 * Unextended client, for libraries that need a plain PrismaClient (the
 * NextAuth adapter). App code should use `prisma` below.
 */
export const prismaBase = base.client;

const num = (value: Prisma.Decimal) => value.toNumber();
const numOrNull = (value: Prisma.Decimal | null) => (value === null ? null : value.toNumber());

/**
 * Money columns are NUMERIC(10,2) in Postgres so stored amounts are exact.
 * Prisma returns those as Decimal objects, which can't be passed to Client
 * Components and don't work with plain arithmetic, so reads are converted to
 * numbers here. Writes accept numbers as before. Aggregates (_sum etc.) are not
 * covered by result extensions and still return Decimal; wrap them in Number().
 */
export const prisma = base.client.$extends({
  result: {
    product: {
      price: { needs: { price: true }, compute: (r) => num(r.price) },
      compareAtPrice: { needs: { compareAtPrice: true }, compute: (r) => numOrNull(r.compareAtPrice) },
    },
    order: {
      totalAmount: { needs: { totalAmount: true }, compute: (r) => num(r.totalAmount) },
    },
    orderItem: {
      price: { needs: { price: true }, compute: (r) => num(r.price) },
    },
    training: {
      fees: { needs: { fees: true }, compute: (r) => num(r.fees) },
    },
    coupon: {
      discountValue: { needs: { discountValue: true }, compute: (r) => num(r.discountValue) },
      maxDiscount: { needs: { maxDiscount: true }, compute: (r) => numOrNull(r.maxDiscount) },
      minOrderValue: { needs: { minOrderValue: true }, compute: (r) => numOrNull(r.minOrderValue) },
    },
    deliveryZone: {
      charge: { needs: { charge: true }, compute: (r) => num(r.charge) },
      minOrderValue: { needs: { minOrderValue: true }, compute: (r) => numOrNull(r.minOrderValue) },
    },
  },
});

export type AppPrismaClient = typeof prisma;
