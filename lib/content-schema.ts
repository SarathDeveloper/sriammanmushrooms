import { z } from "zod";

/**
 * Shape of the files in /content. Kept separate from lib/content.ts so the
 * export script and tests can validate JSON without importing the files.
 */

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

/** Cloudinary public ID, res.cloudinary.com URL, local /path or https URL. */
const imageRef = z.string().min(1);

export const categorySchema = z.object({
  name: z.string().min(1),
  slug,
  description: z.string().nullable().default(null),
  image: imageRef.nullable().default(null),
  sortOrder: z.number().int().default(0),
});

/**
 * Prices, ratings and stock are deliberately not part of the content: the
 * showcase never shows them (prices change with the daily harvest; visitors
 * enquire on WhatsApp for today's price).
 */
export const productSchema = z.object({
  id: z.string().min(1),
  slug,
  name: z.string().min(1),
  /** Category slug; must match an entry in categories.json. */
  category: slug,
  description: z.string().min(1),
  weight: z.string().min(1),
  images: z.array(imageRef).min(1),
  tag: z.string().nullable().default(null),
  highlights: z.array(z.string()).default([]),
  shelfLifeDays: z.number().int().nonnegative().nullable().default(null),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const heroSlideSchema = z.object({
  badge: z.string(),
  headline: z.string().min(1),
  subtitle: z.string(),
  primaryCtaLabel: z.string(),
  primaryCtaHref: z.string(),
  secondaryCtaLabel: z.string(),
  secondaryCtaHref: z.string(),
  image: imageRef,
});

export const reviewSchema = z.object({
  id: z.string().min(1),
  /** Product slug the review belongs to. */
  product: slug,
  name: z.string().min(1),
  /** Shown as a plain testimonial quote (no star ratings on the site). */
  comment: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export const categoriesFileSchema = z.array(categorySchema);
export const productsFileSchema = z.array(productSchema);
export const heroSlidesFileSchema = z.array(heroSlideSchema);
export const reviewsFileSchema = z.array(reviewSchema);

export type CategoryEntry = z.infer<typeof categorySchema>;
export type ProductEntry = z.infer<typeof productSchema>;
export type HeroSlideEntry = z.infer<typeof heroSlideSchema>;
export type ReviewEntry = z.infer<typeof reviewSchema>;

/** Cross-file checks: unique slugs/ids, products point at real categories, reviews at real products. */
export function checkContentIntegrity(content: {
  categories: CategoryEntry[];
  products: ProductEntry[];
  reviews: ReviewEntry[];
}): string[] {
  const errors: string[] = [];
  const dupes = (values: string[]) =>
    values.filter((v, i) => values.indexOf(v) !== i);

  for (const d of dupes(content.categories.map((c) => c.slug))) {
    errors.push(`Duplicate category slug "${d}"`);
  }
  for (const d of dupes(content.products.map((p) => p.slug))) {
    errors.push(`Duplicate product slug "${d}"`);
  }
  for (const d of dupes(content.products.map((p) => p.id))) {
    errors.push(`Duplicate product id "${d}"`);
  }

  const categorySlugs = new Set(content.categories.map((c) => c.slug));
  for (const p of content.products) {
    if (!categorySlugs.has(p.category)) {
      errors.push(`Product "${p.slug}" uses unknown category "${p.category}"`);
    }
  }

  const productSlugs = new Set(content.products.map((p) => p.slug));
  for (const r of content.reviews) {
    if (!productSlugs.has(r.product)) {
      errors.push(`Review "${r.id}" points at unknown product "${r.product}"`);
    }
  }

  return errors;
}
