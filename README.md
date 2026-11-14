# Sri Amman Mushroom Farm: showcase site

Public website for Sri Amman Mushroom Farm (Kallakurichi, Tamil Nadu). It shows the
product catalogue, farming training and farm information. Every enquiry and pre-order
goes to the farm's WhatsApp. There is no database, login, cart or payment on this
version.

The full-stack version (admin dashboard, Razorpay checkout, OTP, customer accounts)
lives on the `feature/fullstack-admin` branch for later use.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No `.env` file is needed to run or build. See [Environment variables](#environment-variables)
for the optional ones production should set.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest unit tests |
| `npm run content:export` | One-off import of the catalogue from the old database (below) |

## Editing content

Catalogue content lives in JSON files and is checked at build time. A mistake (missing
field, unknown category, duplicate slug) fails `npm run build` and `npm test` with a
message naming the file and field.

| File | Contents |
|---|---|
| `content/products.json` | Products: name, slug, `category` (a category slug), pack size (`weight`), images, highlights, `isFeatured`, `sortOrder`… No prices, ratings or stock: visitors enquire on WhatsApp for today's price |
| `content/categories.json` | Category filters on Our Mushrooms (`/products`) |
| `content/hero-slides.json` | Home page hero carousel |
| `content/reviews.json` | Customer quotes shown on product pages as testimonials, without star ratings (`product` is a product slug) |
| `lib/data.ts` | Training programmes, stats, testimonials, certifications |

The schema is in `lib/content-schema.ts`. Images can be a Cloudinary public ID
(`mushroom-farm/products/oyster-1`), a `res.cloudinary.com` URL, or a local path under
`public/` (`/gallery/products/oyster.jpg`).

To change content: edit the JSON, run `npm test`, commit, and push. Vercel redeploys.

### Importing the current catalogue from the old database

The JSON was first seeded from `lib/data.ts`. To bring over the products, categories,
hero slides and approved reviews that admins edited in the old app's database:

```bash
DATABASE_URL="postgres://…" npm run content:export -- --dry-run   # check counts first
DATABASE_URL="postgres://…" npm run content:export
git diff content/                                                  # review, then commit
```

The script only runs `SELECT`s inside a read-only transaction, exports active
products only (without prices, ratings or stock), keeps only approved reviews that have a
written comment and only reviewers' first names, and validates the output with the same
schema the site uses.

## How enquiries work

The product "Enquire" dialog, the contact forms, the pre-order form and the floating
WhatsApp button all validate in the browser (name, 10-digit Indian mobile, required
fields). They then open `wa.me/<farm number>` with a pre-filled message. If the browser
blocks the new tab, an "Open WhatsApp" button is shown. Nothing is sent to a server, so
there is nothing to store, rate-limit or secure.

The farm's WhatsApp number is `WHATSAPP_NUMBER` in `lib/whatsapp.ts`. Message wording is
in the `build*Message` functions in the same file.

## Environment variables

All optional. Set them in Vercel → Project → Settings → Environment Variables.

| Variable | Purpose | If missing |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Serves product images stored on Cloudinary | Cloudinary images show a leaf placeholder (local `/gallery` images still work) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph | Uses `https://vellimalaifarms.in` |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Server / browser error reporting | Errors aren't reported |

`NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.
Missing values are logged as warnings when the server starts.

## Deploying on Vercel

1. Import the repository. Framework preset: Next.js. Defaults are fine (Node 22+).
2. Add the environment variables above (at least `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).
3. Deploy. Every page except `/products` (which reads search params) is prerendered.

After deploying, check: home page images load, an enquiry opens WhatsApp with the
details, and `/sitemap.xml` lists the products. Old links (`/shop`, `/shop/<slug>`,
`/wishlist`, `/compare`, `/cart`, `/checkout`, `/login`, `/admin`, …) permanently redirect
to `/products`, `/contact` or `/` (see `lib/redirects.ts`).

## Project layout

```
app/(storefront)/   pages: home, products ("Our Mushrooms") + product detail, pre-order, training, about, contact, policies
app/sitemap.ts      sitemap.xml (static pages + every product)
app/robots.ts       robots.txt
components/         page sections, forms (ContactForm, PreOrderSection, ProductEnquiryDialog), shadcn ui
content/            catalogue JSON
lib/content.ts      loads + validates content; getProducts(), getProductBySlug()…
lib/whatsapp.ts     WhatsApp link, form schemas, message builders
lib/seo.ts          JSON-LD (BreadcrumbList) and absolute image URLs
lib/redirects.ts    permanent redirects used by next.config.ts
scripts/            export-content.ts
tests/              vitest
```

See `PROJECT.md` for more detail. This repo uses Next.js 16; see `AGENTS.md`.
