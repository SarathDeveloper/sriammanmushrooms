import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CATALOGUE_PRODUCT_SLUGS } from "@/lib/catalogue";
import { getProducts } from "@/lib/content";
import { REMOVED_PRODUCT_SLUGS, SITE_REDIRECTS } from "@/lib/redirects";

const ROUTES_DIR = join(__dirname, "..", "app", "(storefront)");
const destinationOf = (source: string) => SITE_REDIRECTS.find((r) => r.source === source)?.destination;

describe("redirects", () => {
  it("moves the old /shop URLs to /products", () => {
    expect(destinationOf("/shop")).toBe("/products");
    expect(destinationOf("/shop/:slug")).toBe("/products/:slug");
  });

  it("sends the removed wishlist, compare, cart and checkout pages to /products", () => {
    for (const source of ["/wishlist", "/compare", "/cart", "/checkout"]) {
      expect(destinationOf(source)).toBe("/products");
    }
  });

  it("are all permanent and never point at a redirected path", () => {
    const sources = new Set(SITE_REDIRECTS.map((r) => r.source));
    for (const r of SITE_REDIRECTS) {
      expect(r.permanent).toBe(true);
      expect(sources.has(r.destination)).toBe(false);
    }
  });

  it("shadow no existing page, and the removed pages are gone", () => {
    const liveSlugs = new Set(getProducts().map((p) => p.slug));
    for (const r of SITE_REDIRECTS) {
      const [, segment, slug] = r.source.split("/");
      if (segment === "products") {
        // Only discontinued product pages may be redirected under /products.
        expect(liveSlugs.has(slug)).toBe(false);
        continue;
      }
      expect(existsSync(join(ROUTES_DIR, segment))).toBe(false);
    }
    expect(existsSync(join(ROUTES_DIR, "products", "page.tsx"))).toBe(true);
    expect(existsSync(join(ROUTES_DIR, "products", "[slug]", "page.tsx"))).toBe(true);
  });

  it("sends every discontinued product page, old or new URL, straight to /products", () => {
    expect(REMOVED_PRODUCT_SLUGS.length).toBeGreaterThan(0);
    for (const slug of REMOVED_PRODUCT_SLUGS) {
      expect(destinationOf(`/shop/${slug}`)).toBe("/products");
      expect(destinationOf(`/products/${slug}`)).toBe("/products");
      expect(CATALOGUE_PRODUCT_SLUGS as readonly string[]).not.toContain(slug);
    }
  });

  it("matches discontinued /shop slugs before the generic /shop/:slug rule (no redirect chains)", () => {
    const generic = SITE_REDIRECTS.findIndex((r) => r.source === "/shop/:slug");
    for (const slug of REMOVED_PRODUCT_SLUGS) {
      expect(SITE_REDIRECTS.findIndex((r) => r.source === `/shop/${slug}`)).toBeLessThan(generic);
    }
  });
});
