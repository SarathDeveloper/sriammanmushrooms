import { describe, expect, it } from "vitest";

import { CATALOGUE_PRODUCT_SLUGS, DISCONTINUED_VARIETY_PATTERN } from "@/lib/catalogue";
import { getCategories, getHeroSlides, getProducts } from "@/lib/content";

describe("catalogue scope (oyster and button only)", () => {
  it("lists exactly the products in lib/catalogue.ts", () => {
    expect(getProducts().map((p) => p.slug).sort()).toEqual([...CATALOGUE_PRODUCT_SLUGS].sort());
  });

  it("has only the oyster and button categories", () => {
    expect(getCategories().map((c) => c.slug).sort()).toEqual(["button", "oyster"]);
  });

  it("never mentions discontinued varieties in products or hero slides", () => {
    for (const p of getProducts()) {
      expect(`${p.name} ${p.description} ${p.highlights.join(" ")}`).not.toMatch(DISCONTINUED_VARIETY_PATTERN);
    }
    for (const s of getHeroSlides()) {
      expect(`${s.headline} ${s.subtitle}`).not.toMatch(DISCONTINUED_VARIETY_PATTERN);
    }
  });
});
