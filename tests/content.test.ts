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
      price: 150,
      weight: "250g",
      images: ["/gallery/products/oyster.jpg"],
      rating: 4.5,
      reviewCount: 3,
    },
  ])[0];

  it("reports unknown categories, duplicate slugs and orphan reviews", () => {
    const errors = checkContentIntegrity({
      categories: [category],
      products: [product, { ...product, id: "p2" }, { ...product, id: "p3", slug: "x", category: "milky" }],
      reviews: [
        { id: "r1", product: "missing", name: "Asha", rating: 5, comment: null, date: "2026-01-01" },
      ],
    });
    expect(errors).toEqual([
      'Duplicate product slug "oyster-pack"',
      'Product "x" uses unknown category "milky"',
      'Review "r1" points at unknown product "missing"',
    ]);
  });

  it("rejects malformed slugs and prices in the schema", () => {
    const bad = productsFileSchema.safeParse([{ ...product, slug: "Bad Slug", price: -1 }]);
    expect(bad.success).toBe(false);
  });
});
