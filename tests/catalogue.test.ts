import { describe, expect, it } from "vitest";

import { getProducts, getRelatedProducts, type Product } from "@/lib/content";
import { filterSearchItems } from "@/lib/search";
import { PRODUCTS_PER_PAGE, queryProducts } from "@/lib/shop";

const make = (overrides: Partial<Product>): Product => ({
  id: "x",
  slug: "x",
  name: "X",
  category: "Oyster",
  categorySlug: "oyster",
  price: 100,
  compareAtPrice: null,
  weight: "200g",
  image: "/a.jpg",
  gallery: ["/a.jpg"],
  rating: 4,
  reviewCount: 0,
  tag: null,
  inStock: true,
  isFeatured: false,
  description: "",
  highlights: [],
  shelfLifeDays: null,
  ...overrides,
});

const sample = [
  make({ id: "1", slug: "a", name: "Pink Oyster", price: 190, description: "Mild" }),
  make({ id: "2", slug: "b", name: "Button", category: "Button", categorySlug: "button", price: 120 }),
  make({ id: "3", slug: "c", name: "Grey Oyster", price: 160, description: "Firm texture" }),
];

describe("queryProducts", () => {
  it("filters by category slug", () => {
    expect(queryProducts(sample, { category: "button" }).products.map((p) => p.slug)).toEqual(["b"]);
    expect(queryProducts(sample, { category: "all" }).totalCount).toBe(3);
  });

  it("searches name and description, ignoring one-letter queries", () => {
    expect(queryProducts(sample, { q: "firm" }).products.map((p) => p.slug)).toEqual(["c"]);
    expect(queryProducts(sample, { q: "o" }).totalCount).toBe(3);
  });

  it("sorts by price, name and newest", () => {
    expect(queryProducts(sample, { sort: "price-asc" }).products.map((p) => p.price)).toEqual([120, 160, 190]);
    expect(queryProducts(sample, { sort: "price-desc" }).products.map((p) => p.price)).toEqual([190, 160, 120]);
    expect(queryProducts(sample, { sort: "name-asc" }).products.map((p) => p.name)).toEqual(["Button", "Grey Oyster", "Pink Oyster"]);
    expect(queryProducts(sample, { sort: "newest" }).products.map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("paginates and clamps the page number", () => {
    const many = Array.from({ length: PRODUCTS_PER_PAGE + 2 }, (_, i) => make({ id: `${i}`, slug: `p${i}` }));
    expect(queryProducts(many, { page: 2 }).products).toHaveLength(2);
    expect(queryProducts(many, { page: 99 }).page).toBe(2);
    expect(queryProducts(many, { page: -5 }).page).toBe(1);
    expect(queryProducts([], {}).totalPages).toBe(1);
  });
});

describe("filterSearchItems", () => {
  const items = getProducts().map(({ slug, name, category, price, weight, image }) => ({
    slug,
    name,
    category,
    price,
    weight,
    image,
  }));

  it("matches every word against name and category", () => {
    const results = filterSearchItems(items, "oyster pink");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      const text = `${r.name} ${r.category}`.toLowerCase();
      expect(text).toContain("oyster");
      expect(text).toContain("pink");
    }
  });

  it("returns nothing for very short queries", () => {
    expect(filterSearchItems(items, "o")).toEqual([]);
  });
});

describe("getRelatedProducts", () => {
  it("prefers the same category and never includes the product itself", () => {
    const product = getProducts().find((p) => p.categorySlug === "oyster")!;
    const related = getRelatedProducts(product, 3);
    expect(related).toHaveLength(3);
    expect(related.map((p) => p.id)).not.toContain(product.id);
    expect(related[0].categorySlug).toBe("oyster");
  });
});
