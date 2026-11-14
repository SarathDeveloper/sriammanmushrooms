-- Money columns: double precision -> NUMERIC(10,2).
-- The implicit cast keeps existing values (rounded to paise).
ALTER TABLE "Product"
  ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
  ALTER COLUMN "compareAtPrice" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "Training" ALTER COLUMN "fees" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "Coupon"
  ALTER COLUMN "discountValue" SET DATA TYPE DECIMAL(10,2),
  ALTER COLUMN "maxDiscount" SET DATA TYPE DECIMAL(10,2),
  ALTER COLUMN "minOrderValue" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "DeliveryZone"
  ALTER COLUMN "charge" SET DATA TYPE DECIMAL(10,2),
  ALTER COLUMN "minOrderValue" SET DATA TYPE DECIMAL(10,2);

-- Order.shippingAddress: TEXT holding JSON -> JSONB, converted in place.
-- (Prisma's generated SQL would drop and re-add the column, losing every
-- address.) A row whose text is not valid JSON is kept as {"raw": "<text>"}
-- instead of failing the migration.
CREATE FUNCTION pg_temp.try_jsonb(input TEXT) RETURNS JSONB AS $$
BEGIN
  RETURN input::JSONB;
EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('raw', input);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE "Order"
  ALTER COLUMN "shippingAddress" SET DATA TYPE JSONB
  USING pg_temp.try_jsonb("shippingAddress");

-- Shared rate-limit counters (lib/rate-limit.ts).
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
