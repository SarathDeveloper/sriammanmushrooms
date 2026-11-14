import { describe, expect, it } from "vitest";

import { getProducts, getRelatedProducts, getSearchItems, type Product } from "@/lib/content";
import { filterSearchItems } from "@/lib/search";
import { PRODUCTS_PER_PAGE, queryProducts } from "@/lib/shop";
import { packSizeLabel } from "@/lib/utils";

const make = (overrides: Partial<Product>): Product => ({
  id: "x",
  slug: "x",
  name: "X",
  category: "Oyster",
  categorySlug: "oyster",
  weight: "200g",
  image: "/a.jpg",
  gallery: ["/a.jpg"],
  tag: null,
  isFeatured: false,
  description: "",
  highlights: [],
  shelfLifeDays: null,
  ...overrides,
});

const sample = [
  make({ id: "1", slug: "a", name: "Pink Oyster", description: "Mild" }),
  make({ id: "2", slug: "b", name: "Button", category: "Button", categorySlug: "button" }),
  make({ id: "3", slug: "c", name: "Grey Oyster", description: "Firm texture" }),
];

/** Keys that must never reach the catalogue UI (the showcase hides prices, ratings and stock). */
const HIDDEN_KEYS = ["price", "compareAtPrice", "rating", "reviewCount", "inStock"];

describe("queryProducts", () => {
  it("filters by category slug", () => {
    expect(queryProducts(sample, { category: "button" }).products.map((p) => p.slug)).toEqual(["b"]);
    expect(queryProducts(sample, { category: "all" }).totalCount).toBe(3);
  });

  it("searches name and description, ignoring one-letter queries", () => {
    expect(queryProducts(sample, { q: "firm" }).products.map((p) => p.slug)).toEqual(["c"]);
    expect(queryProducts(sample, { q: "o" }).totalCount).toBe(3);
  });

  it("sorts by name and newest", () => {
    expect(queryProducts(sample, { sort: "name-asc" }).products.map((p) => p.name)).toEqual(["Button", "Grey Oyster", "Pink Oyster"]);
    expect(queryProducts(sample, { sort: "newest" }).products.map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("ignores the removed price sorts and keeps the default order", () => {
    const defaultOrder = queryProducts(sample, {}).products.map((p) => p.slug);
    expect(defaultOrder).toEqual(["a", "b", "c"]);
    expect(queryProducts(sample, { sort: "price-asc" }).products.map((p) => p.slug)).toEqual(defaultOrder);
    expect(queryProducts(sample, { sort: "price-desc" }).products.map((p) => p.slug)).toEqual(defaultOrder);
  });

  it("paginates and clamps the page number", () => {
    const many = Array.from({ length: PRODUCTS_PER_PAGE + 2 }, (_, i) => make({ id: `${i}`, slug: `p${i}` }));
    expect(queryProducts(many, { page: 2 }).products).toHaveLength(2);
    expect(queryProducts(many, { page: 99 }).page).toBe(2);
    expect(queryProducts(many, { page: -5 }).page).toBe(1);
    expect(queryProducts([], {}).totalPages).toBe(1);
  });
});

describe("catalogue data", () => {
  it("never carries prices, ratings or stock", () => {
    for (const product of getProducts()) {
      for (const key of HIDDEN_KEYS) expect(product).not.toHaveProperty(key);
    }
  });

  it("search items (sent to the browser) only carry what the search dialog shows", () => {
    for (const item of getSearchItems()) {
      expect(Object.keys(item).sort()).toEqual(["category", "image", "name", "slug", "weight"]);
    }
  });
});

describe("filterSearchItems", () => {
  const items = getSearchItems();

  it("matches every word against name and category", () => {
    const results = filterSearchItems(items, "premium oyster");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      const text = `${r.name} ${r.category}`.toLowerCase();
      expect(text).toContain("oyster");
      expect(text).toContain("premium");
    }
    expect(filterSearchItems(items, "oyster button")).toEqual([]);
  });

  it("returns nothing for very short queries", () => {
    expect(filterSearchItems(items, "o")).toEqual([]);
  });
});

describe("getRelatedProducts", () => {
  it("prefers the same category and never includes the product itself", () => {
    const all = getProducts();
    const product = all.find((p) => p.categorySlug === "oyster")!;
    const related = getRelatedProducts(product, 3);
    expect(related).toHaveLength(Math.min(3, all.length - 1));
    expect(related.map((p) => p.id)).not.toContain(product.id);
    // Same-category products come before any others.
    const firstOther = related.findIndex((p) => p.categorySlug !== product.categorySlug);
    if (firstOther !== -1) {
      expect(related.slice(firstOther).every((p) => p.categorySlug !== product.categorySlug)).toBe(true);
    }
  });
});

describe("packSizeLabel", () => {
  it("adds 'pack' once", () => {
    expect(packSizeLabel("250g")).toBe("250g pack");
    expect(packSizeLabel("100g Pack")).toBe("100g pack");
    expect(packSizeLabel(" 1kg ")).toBe("1kg pack");
  });
});
