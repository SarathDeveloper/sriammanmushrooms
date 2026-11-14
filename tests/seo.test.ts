import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap, { STATIC_ROUTES } from "@/app/sitemap";
import { getProducts } from "@/lib/content";
import { productJsonLd, serializeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every static page and every product exactly once", () => {
    expect(entries).toHaveLength(STATIC_ROUTES.length + getProducts().length);
    expect(new Set(urls).size).toBe(urls.length);
    for (const product of getProducts()) {
      expect(urls).toContain(`${SITE_URL}/shop/${product.slug}`);
    }
  });

  it("uses absolute URLs on the site domain", () => {
    expect(urls[0]).toBe(`${SITE_URL}/`);
    for (const url of urls) expect(url.startsWith(`${SITE_URL}/`)).toBe(true);
  });

  it("does not list removed or private pages", () => {
    for (const path of ["/cart", "/checkout", "/admin", "/login", "/account", "/orders", "/wishlist"]) {
      expect(urls).not.toContain(`${SITE_URL}${path}`);
    }
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });
});

describe("product JSON-LD", () => {
  const product = getProducts()[0];

  it("describes the product with an INR offer", () => {
    const data = productJsonLd(product);
    expect(data).toMatchObject({
      "@type": "Product",
      name: product.name,
      offers: { priceCurrency: "INR", price: product.price, url: `${SITE_URL}/shop/${product.slug}` },
    });
  });

  it("escapes < so content can't close the script tag", () => {
    expect(serializeJsonLd({ name: "</script><b>" })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
