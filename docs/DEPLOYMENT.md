# Deploying the full-stack store (Vercel)

## Vercel project settings

- **Node.js**: 22 (also set by `engines` in package.json).
- **Build command**: `npm run build` (default). Migrations are **not** run during the build on purpose: preview deployments often share the production `DATABASE_URL`, and a schema change should be a deliberate step.
- **Environment variables**: copy from `.env.example`. Use the database provider's **pooled** URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.

## Every release that includes a new migration

1. Back up the database (provider snapshot, or `pg_dump`).
2. `DATABASE_URL=… DIRECT_URL=… npm run db:migrate:deploy` from a trusted machine or a one-off CI job.
3. Deploy the code.

Do steps 2 and 3 back to back; old code does not understand the new schema.

---

## One-time: move the existing production database onto migrations

The production database was created with `prisma db push`, so it has no migration history. `prisma/migrations/0_init` describes exactly that existing schema; it must be **marked as applied, never run**, on production. The second migration (`20261114000000_money_decimal_address_json_rate_limit`) then really runs. It:

- converts money columns from `double precision` to `NUMERIC(10,2)` (values with more than 2 decimals are rounded to paise),
- converts `Order.shippingAddress` from text to `JSONB` in place (text that isn't valid JSON is kept as `{"raw": "<text>"}`),
- adds the `RateLimit` table.

Postgres runs each migration in a transaction, so a failure leaves the database unchanged.

### Steps

Run from the repo on this branch, with `DATABASE_URL` and `DIRECT_URL` pointing at production.

**0. Back up.** Take a snapshot or `pg_dump` and confirm you can restore it.

**1. Check the live schema matches the baseline.** It should print "No difference detected" and exit 0:

```bash
git show 09c66fe:prisma/schema.prisma > /tmp/baseline.prisma
npx prisma migrate diff --from-config-datasource --to-schema /tmp/baseline.prisma --exit-code
```

If it reports differences, stop: someone changed production by hand. Reconcile `0_init` first.

**2. Look at the data the conversion will touch** (read-only; run in your SQL console):

```sql
-- Amounts that will be rounded to 2 decimals
SELECT 'Product.price' AS col, id, price::text FROM "Product" WHERE price <> round(price::numeric, 2)
UNION ALL SELECT 'Order.totalAmount', id, "totalAmount"::text FROM "Order" WHERE "totalAmount" <> round("totalAmount"::numeric, 2)
UNION ALL SELECT 'OrderItem.price', id, price::text FROM "OrderItem" WHERE price <> round(price::numeric, 2);

-- Addresses that are not valid JSON (will become {"raw": ...})
SELECT id, left("shippingAddress", 80) FROM "Order"
WHERE "shippingAddress" !~ '^\s*[\{\[]';
```

**3. Mark the baseline as applied** (records it in `_prisma_migrations`; runs no SQL):

```bash
npx prisma migrate resolve --applied 0_init
```

**4. Apply the remaining migration, then deploy the code:**

```bash
npm run db:migrate:deploy
npx prisma migrate status        # "Database schema is up to date!"
```

This exact sequence was rehearsed on a copy of the old schema with legacy rows (fractional prices, a JSON-string address, a non-JSON address, old `name`/`street` keys) and all values came through as expected.

---

## After going live

- Rotate the admin password (`ADMIN_PASSWORD=… npx tsx create-admin.ts`) and review `/admin/admins`.
- Set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` and check that a test error arrives.
- Before switching `NEXT_PUBLIC_ORDERS_ENABLED=true`: set the Razorpay and Twilio keys (the server refuses to start without them), enable the Twilio WhatsApp sender, set `APP_BASE_URL`, then place a real low-value order end to end (COD and online) and refund it.
