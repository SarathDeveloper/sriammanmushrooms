/**
 * One-off export of catalogue content from the old Postgres database into the
 * static JSON files the showcase site reads (content/*.json).
 *
 *   DATABASE_URL=postgres://... npm run content:export
 *   npm run content:export -- --dry-run     # validate and print counts only
 *
 * Read-only: it only runs SELECT statements. Output is validated with the
 * same zod schemas the site uses at build time, so a successful export is a
 * buildable one. Review the diff (git diff content/) before committing.
 */
import "dotenv/config";

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { Client } from "pg";

import {
  categoriesFileSchema,
  checkContentIntegrity,
  heroSlidesFileSchema,
  productsFileSchema,
  reviewsFileSchema,
} from "../lib/content-schema";

const CONTENT_DIR = join(__dirname, "..", "content");
const dryRun = process.argv.includes("--dry-run");

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Set DATABASE_URL (the old app's Postgres connection string) before running this script.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    // Read-only transaction: guarantees this script can never modify the database.
    await client.query("BEGIN TRANSACTION READ ONLY");

    const categoryRows = await client.query<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      sortOrder: number;
    }>(`SELECT id, name, slug, description, image, "sortOrder"
          FROM "Category"
         ORDER BY "sortOrder" ASC, name ASC`);

    const productRows = await client.query<{
      id: string;
      slug: string;
      name: string;
      categoryId: string;
      description: string;
      price: string | number;
      compareAtPrice: string | number | null;
      weight: string;
      images: string[];
      tag: string | null;
      rating: number;
      reviewCount: number;
      highlights: string[];
      shelfLifeDays: number | null;
      stock: number;
      isFeatured: boolean;
    }>(`SELECT id, slug, name, "categoryId", description, price, "compareAtPrice", weight,
               images, tag, rating, "reviewCount", highlights, "shelfLifeDays", stock, "isFeatured"
          FROM "Product"
         WHERE "isActive" = true
         ORDER BY "createdAt" ASC`);

    const slideRows = await client.query<{
      badge: string;
      headline: string;
      subtitle: string;
      primaryCtaLabel: string;
      primaryCtaHref: string;
      secondaryCtaLabel: string;
      secondaryCtaHref: string;
      image: string;
    }>(`SELECT badge, headline, subtitle, "primaryCtaLabel", "primaryCtaHref",
               "secondaryCtaLabel", "secondaryCtaHref", image
          FROM "HeroSlide"
         WHERE "isActive" = true
         ORDER BY "sortOrder" ASC`);

    // Approved reviews only, with the reviewer's first name (no surnames, emails or phones).
    const reviewRows = await client.query<{
      id: string;
      productSlug: string;
      userName: string | null;
      rating: number;
      comment: string | null;
      createdAt: Date;
    }>(`SELECT r.id, p.slug AS "productSlug", u.name AS "userName", r.rating, r.comment, r."createdAt"
          FROM "Review" r
          JOIN "Product" p ON p.id = r."productId" AND p."isActive" = true
          JOIN "User" u ON u.id = r."userId"
         WHERE r."isApproved" = true
         ORDER BY r."createdAt" DESC`);

    await client.query("COMMIT");

    const categorySlugById = new Map(
      categoryRows.rows.map((c) => [c.id, c.slug || toSlug(c.name)]),
    );

    const categories = categoriesFileSchema.parse(
      categoryRows.rows.map((c, i) => ({
        name: c.name,
        slug: c.slug || toSlug(c.name),
        description: c.description,
        image: c.image,
        sortOrder: c.sortOrder ?? i,
      })),
    );

    const products = productsFileSchema.parse(
      productRows.rows
        .filter((p) => p.images.length > 0)
        .map((p, i) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: categorySlugById.get(p.categoryId),
          description: p.description,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
          weight: p.weight,
          images: p.images,
          tag: p.tag,
          rating: p.rating,
          reviewCount: p.reviewCount,
          highlights: p.highlights ?? [],
          shelfLifeDays: p.shelfLifeDays,
          inStock: p.stock > 0,
          isFeatured: p.isFeatured,
          sortOrder: i + 1,
        })),
    );

    const skipped = productRows.rows.filter((p) => p.images.length === 0);
    for (const p of skipped) {
      console.warn(`Skipped product "${p.slug}": it has no images.`);
    }

    // Keep only categories that still have products, so the shop has no empty filters.
    const usedCategories = new Set(products.map((p) => p.category));
    const activeCategories = categories.filter((c) => usedCategories.has(c.slug));

    const heroSlides = heroSlidesFileSchema.parse(slideRows.rows);

    const reviews = reviewsFileSchema.parse(
      reviewRows.rows.map((r) => ({
        id: r.id,
        product: r.productSlug,
        name: r.userName?.trim().split(/\s+/)[0] || "Verified customer",
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString().slice(0, 10),
      })),
    );

    const errors = checkContentIntegrity({ categories: activeCategories, products, reviews });
    if (errors.length > 0) {
      throw new Error(`Exported content is inconsistent:\n  ${errors.join("\n  ")}`);
    }

    console.log(
      `Categories: ${activeCategories.length}, products: ${products.length}, hero slides: ${heroSlides.length}, reviews: ${reviews.length}`,
    );

    if (dryRun) {
      console.log("Dry run: no files written.");
      return;
    }

    const write = (file: string, data: unknown) =>
      writeFileSync(join(CONTENT_DIR, file), `${JSON.stringify(data, null, 2)}\n`);

    write("categories.json", activeCategories);
    write("products.json", products);
    // An empty slide list would fall back to the built-in hero; keep the
    // existing file in that case rather than overwriting it with [].
    if (heroSlides.length > 0) write("hero-slides.json", heroSlides);
    write("reviews.json", reviews);

    console.log(`Wrote content to ${CONTENT_DIR}. Review with: git diff content/`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
