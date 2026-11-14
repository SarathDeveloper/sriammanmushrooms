import type { z } from "zod";

import categoriesJson from "@/content/categories.json";
import heroSlidesJson from "@/content/hero-slides.json";
import productsJson from "@/content/products.json";
import reviewsJson from "@/content/reviews.json";
import {
  categoriesFileSchema,
  checkContentIntegrity,
  heroSlidesFileSchema,
  productsFileSchema,
  reviewsFileSchema,
  type CategoryEntry,
  type HeroSlideEntry,
  type ReviewEntry,
} from "@/lib/content-schema";

/**
 * Static site content. Everything the storefront shows comes from the JSON
 * files in /content, validated here at build time: a typo in a content file
 * fails `next build` instead of shipping a broken page.
 *
 * Import this only from Server Components / route files. Client components get
 * the data they need as props (see getSearchItems) so the full catalogue and
 * zod don't end up in the browser bundle.
 */

function parse<S extends z.ZodType>(label: string, schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  content/${label}.json ${i.path.map(String).join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid content:\n${details}`);
  }
  return result.data;
}

const categoryEntries = parse("categories", categoriesFileSchema, categoriesJson).sort(
  (a, b) => a.sortOrder - b.sortOrder,
);
const productEntries = parse("products", productsFileSchema, productsJson).sort(
  (a, b) => a.sortOrder - b.sortOrder,
);
const heroSlideEntries = parse("hero-slides", heroSlidesFileSchema, heroSlidesJson);
const reviewEntries = parse("reviews", reviewsFileSchema, reviewsJson);

const integrityErrors = checkContentIntegrity({
  categories: categoryEntries,
  products: productEntries,
  reviews: reviewEntries,
});
if (integrityErrors.length > 0) {
  throw new Error(`Invalid content:\n  ${integrityErrors.join("\n  ")}`);
}

/** Product as the UI components consume it. Deliberately has no price, rating or stock fields. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Category display name, e.g. "Oyster". */
  category: string;
  categorySlug: string;
  /** Pack size, e.g. "250g". */
  weight: string;
  /** First image; same as gallery[0]. */
  image: string;
  gallery: string[];
  tag: string | null;
  isFeatured: boolean;
  description: string;
  highlights: string[];
  shelfLifeDays: number | null;
}

export type Category = CategoryEntry;
export type HeroSlide = HeroSlideEntry;
export type Review = ReviewEntry;

const categoryBySlug = new Map(categoryEntries.map((c) => [c.slug, c]));

const products: Product[] = productEntries.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: categoryBySlug.get(p.category)!.name,
  categorySlug: p.category,
  weight: p.weight,
  image: p.images[0],
  gallery: p.images,
  tag: p.tag,
  isFeatured: p.isFeatured,
  description: p.description,
  highlights: p.highlights,
  shelfLifeDays: p.shelfLifeDays,
}));

export function getCategories(): Category[] {
  return categoryEntries;
}

export function getProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Featured products for the home page; falls back to the first few if none are flagged. */
export function getFeaturedProducts(count = 3): Product[] {
  const featured = products.filter((p) => p.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, count);
}

/** Same-category products first, then the rest. */
export function getRelatedProducts(product: Product, count = 3): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  return [
    ...others.filter((p) => p.categorySlug === product.categorySlug),
    ...others.filter((p) => p.categorySlug !== product.categorySlug),
  ].slice(0, count);
}

export function getReviewsForProduct(slug: string, count = 6): Review[] {
  return reviewEntries
    .filter((r) => r.product === slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

export function getHeroSlides(): HeroSlide[] {
  return heroSlideEntries;
}

/** Lightweight list for the client-side search dialog. */
export type SearchItem = Pick<Product, "slug" | "name" | "category" | "weight" | "image">;

export function getSearchItems(): SearchItem[] {
  return products.map(({ slug, name, category, weight, image }) => ({
    slug,
    name,
    category,
    weight,
    image,
  }));
}
