# Sri Amman Mushroom Farms — full-stack store

Storefront, online ordering and admin back-office for **Sri Amman Mushroom Farms** (Kalvarayan Hills, Tamil Nadu): sell fresh mushrooms with Razorpay or cash on delivery, take pre-orders and enquiries, promote farming training, and manage products, orders, customers, coupons and delivery zones.

> **Branches.** This is the full-stack version (`feature/fullstack-admin`), kept for when online ordering goes live. The public site currently runs the static showcase build (`feature/showcase-site`: catalogue + WhatsApp enquiries, no database or admin).

Brand site: [vellimalaifarms.in](https://vellimalaifarms.in)

---

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Database | PostgreSQL, Prisma 7 with the `@prisma/adapter-pg` driver adapter, versioned migrations |
| Auth | NextAuth v4: phone + password (bcrypt), JWT sessions, roles `USER` / `ADMIN` |
| Payments | Razorpay (server-side HMAC verification) and cash on delivery |
| SMS / WhatsApp | Twilio REST API (OTP, order notifications) |
| Media | Cloudinary (`next-cloudinary`), signed admin uploads |
| UI | Tailwind CSS 4, shadcn on Base UI, lucide-react, framer-motion |
| Validation | zod |
| Client state | Zustand (cart, wishlist in localStorage) |
| Monitoring | Sentry (server, edge, client) |
| Tests | Vitest: unit tests plus integration tests against Postgres |

---

## How it fits together

```
app/
  (storefront)/        public site: home, shop, product, cart, checkout, orders, training, policies
  admin/               ADMIN-only back-office
  api/(storefront)/    route handlers: auth, register, otp, orders (create/verify/track), coupons, account
  actions/             Server Actions (contact enquiry)
proxy.ts               blocks /admin/* for anyone who isn't an admin, before rendering
instrumentation*.ts    Sentry setup + env validation at server start
lib/                   prisma, auth, admin-guard, rate-limit, order-pricing, otp, notifications, env
prisma/                schema.prisma, migrations/, seed.ts
tests/                 unit/ and integration/
```

Key rules the code relies on:

- **Admin access is checked three times.** `proxy.ts` redirects non-admins before any admin route renders. Every admin page (and `generateMetadata`) calls `requireAdminPage()`. Every admin Server Action calls `requireAdmin()`. Don't rely on `app/admin/layout.tsx` alone: layouts and pages render in parallel and layouts don't re-run on client navigation.
- **Prices are computed on the server.** The cart sends only product ids and quantities; prices, coupons and delivery charges are recomputed in `lib/order-pricing.ts`.
- **Stock is reserved atomically** when an order is created (conditional decrement inside the order transaction). Cancelling releases it; re-opening a cancelled order takes it back only if it is still available.
- **Money is exact.** Amount columns are `NUMERIC(10,2)`. `lib/prisma.ts` converts them to plain numbers on read, so app code uses numbers; aggregates (`_sum`, `_avg`) still return `Decimal`, so wrap them in `Number()`.
- **`Order.shippingAddress` is JSONB.** Always read it with `readShippingAddress()` (`lib/shipping-address.ts`), which also handles legacy rows.
- **Rate limits are shared across instances** via the `RateLimit` table (`lib/rate-limit.ts`): login, OTP (per IP and per phone), registration, coupons, enquiries and pre-orders. If the database is down, checks fail open.
- **Online ordering is behind a flag.** Unless `NEXT_PUBLIC_ORDERS_ENABLED=true`, cart/checkout/account pages redirect away and the order, OTP, account and delivery APIs return 404. The value is inlined at build time, so changing it needs a rebuild.

---

## Local setup

Requires Node 22+.

```bash
npm install                 # also runs prisma generate
cp .env.example .env        # fill in values

# Local Postgres without Docker (Prisma's built-in dev server):
npx prisma dev --detach     # prints a postgres:// URL; put it in DATABASE_URL and DIRECT_URL

npm run db:migrate:deploy   # apply migrations
npm run db:seed             # categories, products, training from lib/data.ts
ADMIN_PASSWORD='choose-a-long-one' npx tsx create-admin.ts

npm run dev                 # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (webpack); `dev:turbo` for Turbopack |
| `npm run build` / `start` | Production build / server |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Unit tests; integration tests too when `TEST_DATABASE_URL` is set |
| `npm run db:migrate:dev` | Create a new migration after editing `schema.prisma` |
| `npm run db:migrate:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Seed data |

### Tests

```bash
npm test                                            # unit tests only
TEST_DATABASE_URL=postgresql://... npm test         # + integration (disposable, migrated DB!)
```

The integration suite (`tests/integration/orders.test.ts`) runs the real order routes and admin actions: server-side pricing, the last unit selling exactly once under concurrent checkouts, stock release on cancel, Razorpay signature checks and replay protection, and the rate limiter under concurrency. CI (`.github/workflows/ci.yml`) runs migrations, lint, typecheck, all tests and a build against Postgres 16.

> Prisma's local dev server (PGlite) can drop connections under the concurrent integration tests; if you see "Connection terminated unexpectedly", restart it or use a real Postgres.

---

## Environment

See [.env.example](.env.example) for every variable with notes. Required in production: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (and `NEXTAUTH_URL` outside Vercel). Razorpay and Twilio keys become required when `NEXT_PUBLIC_ORDERS_ENABLED=true`.

---

## Deploying

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), including the one-time steps to move the existing production database onto versioned migrations.
