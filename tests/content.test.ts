import { describe, expect, it } from "vitest";

import categories from "@/content/categories.json";
import heroSlides from "@/content/hero-slides.json";
import products from "@/content/products.json";
import reviews from "@/content/reviews.json";
import {
  categoriesFileSchema,
  checkContentIntegrity,
  heroSlidesFileSchema,
  productsFileSchema,
  reviewsFileSchema,
} from "@/lib/content-schema";

describe("content files", () => {
  it("categories.json matches the schema", () => {
    expect(categoriesFileSchema.safeParse(categories).success).toBe(true);
  });

  it("products.json matches the schema", () => {
    const result = productsFileSchema.safeParse(products);
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it("hero-slides.json matches the schema", () => {
    expect(heroSlidesFileSchema.safeParse(heroSlides).success).toBe(true);
  });

  it("reviews.json matches the schema", () => {
    expect(reviewsFileSchema.safeParse(reviews).success).toBe(true);
  });

  it("has no broken references or duplicate slugs", () => {
    const errors = checkContentIntegrity({
      categories: categoriesFileSchema.parse(categories),
      products: productsFileSchema.parse(products),
      reviews: reviewsFileSchema.parse(reviews),
    });
    expect(errors).toEqual([]);
  });

  it("has at least one product and one category", () => {
    expect(products.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("products.json has no prices, ratings or stock levels", () => {
    for (const product of products) {
      for (const key of ["price", "compareAtPrice", "rating", "reviewCount", "inStock"]) {
        expect(product).not.toHaveProperty(key);
      }
    }
  });

  it("hero slides link to /products, not the old /shop", () => {
    for (const slide of heroSlides) {
      for (const href of [slide.primaryCtaHref, slide.secondaryCtaHref]) {
        expect(href.startsWith("/shop")).toBe(false);
      }
    }
  });
});

describe("checkContentIntegrity", () => {
  const category = categoriesFileSchema.parse([{ name: "Oyster", slug: "oyster" }])[0];
  const product = productsFileSchema.parse([
    {
      id: "p1",
      slug: "oyster-pack",
      name: "Oyster Pack",
      category: "oyster",
      description: "Fresh oyster mushrooms.",
      weight: "250g",
      images: ["/gallery/products/oyster.jpg"],
    },
  ])[0];

  it("reports unknown categories, duplicate slugs and orphan reviews", () => {
    const errors = checkContentIntegrity({
      categories: [category],
      products: [product, { ...product, id: "p2" }, { ...product, id: "p3", slug: "x", category: "milky" }],
      reviews: [
        { id: "r1", product: "missing", name: "Asha", comment: "Very fresh!", date: "2026-01-01" },
      ],
    });
    expect(errors).toEqual([
      'Duplicate product slug "oyster-pack"',
      'Product "x" uses unknown category "milky"',
      'Review "r1" points at unknown product "missing"',
    ]);
  });

  it("rejects malformed slugs in the schema", () => {
    const bad = productsFileSchema.safeParse([{ ...product, slug: "Bad Slug" }]);
    expect(bad.success).toBe(false);
  });

  it("drops price, rating and stock fields if an old export still has them", () => {
    const [parsed] = productsFileSchema.parse([
      { ...product, price: 150, compareAtPrice: 180, rating: 4.5, reviewCount: 3, inStock: true },
    ]);
    for (const key of ["price", "compareAtPrice", "rating", "reviewCount", "inStock"]) {
      expect(parsed).not.toHaveProperty(key);
    }
  });

  it("reviews are text testimonials: a comment is required and ratings are dropped", () => {
    const base = { id: "r1", product: "oyster-pack", name: "Asha", date: "2026-01-01" };
    expect(reviewsFileSchema.safeParse([{ ...base, comment: "  " }]).success).toBe(false);
    const [review] = reviewsFileSchema.parse([{ ...base, comment: "Very fresh!", rating: 5 }]);
    expect(review).not.toHaveProperty("rating");
  });
});
