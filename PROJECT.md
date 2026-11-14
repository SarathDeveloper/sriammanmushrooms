# Sri Amman Mushroom Farm: project notes

Showcase website for **Sri Amman Mushroom Farm** (Tamil Nadu): product catalogue,
farming training, farm story, and enquiries/pre-orders handed off to WhatsApp.

Brand site: [vellimalaifarms.in](https://vellimalaifarms.in)

## Two versions

| Branch | What it is |
|---|---|
| this branch (`feature/showcase-site`, intended for `main`) | Static showcase. No database, auth, cart or payments. |
| `feature/fullstack-admin` | Full app: PostgreSQL/Prisma, NextAuth admin dashboard, Razorpay checkout, OTP via Twilio, customer accounts, Cloudinary uploads. Kept for when online ordering is switched on. |

To move back to the full version later, start from `feature/fullstack-admin`. Content
edited in `content/*.json` here can be loaded into its database by hand or with a
small script that reverses `scripts/export-content.ts`.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Content | JSON files in `content/`, validated with zod at build time |
| UI | Tailwind CSS 4, shadcn (Base UI), lucide-react, framer-motion, Embla carousel |
| Images | next/image + next-cloudinary (`CldImage`) |
| Monitoring | Sentry (`instrumentation.ts`, `instrumentation-client.ts`) |
| Tests | Vitest |
| Hosting | Vercel |

## Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | static | Hero (content/hero-slides.json), featured + ready-made products, pre-order form, contact form |
| `/products` | dynamic | "Our Mushrooms": category filter, search, name/newest sort, pagination via search params (lib/shop.ts) |
| `/products/[slug]` | static (SSG) | One page per product; unknown slugs 404; BreadcrumbList JSON-LD (no Product JSON-LD: no price or rating to show) |
| `/pre-order`, `/contact`, `/training` | static | WhatsApp forms |
| `/about`, policies | static | |
| `/sitemap.xml`, `/robots.txt` | static | |

Moved and removed routes return permanent redirects (`lib/redirects.ts`, used by
`next.config.ts`): `/shop` → `/products`, `/shop/:slug` → `/products/:slug`, `/wishlist`,
`/compare`, `/cart`, `/checkout` → `/products`, and `/orders`, `/track-order`, `/account`,
`/login`, `/register`, `/admin/*` → `/contact` or `/`.

## Data flow

```
content/*.json ──► lib/content.ts (zod validate, map to Product) ──► Server Components
                                       └── getSearchItems() ──► Navbar/SearchDialog (client props)

Form (client) ──► zod schema (lib/whatsapp.ts) ──► build message ──► window.open(wa.me/…)
```

Nothing posts to the server; there are no API routes or server actions.

## Notes and known gaps

- **Fonts:** the Effra files in `app/fonts/effra` are trial versions. Replace them with
  licensed files or a free font before relying on the site commercially.
- **Policy pages** (shipping, refund) still describe online orders and delivery. The
  wording may need a review now that orders are confirmed over WhatsApp.
- **Prices, ratings and stock are not shown anywhere** and are not in `content/` (so they
  never reach the browser). Product cards and pages ask visitors to enquire on WhatsApp
  for today's price. Training fees, policy amounts and the delivery promos are unaffected.
