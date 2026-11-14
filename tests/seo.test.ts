import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap, { STATIC_ROUTES } from "@/app/sitemap";
import { getProducts } from "@/lib/content";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every static page and every product exactly once", () => {
    expect(entries).toHaveLength(STATIC_ROUTES.length + getProducts().length);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${SITE_URL}/products`);
    for (const product of getProducts()) {
      expect(urls).toContain(`${SITE_URL}/products/${product.slug}`);
    }
  });

  it("uses absolute URLs on the site domain", () => {
    expect(urls[0]).toBe(`${SITE_URL}/`);
    for (const url of urls) expect(url.startsWith(`${SITE_URL}/`)).toBe(true);
  });

  it("does not list removed, redirected or private pages", () => {
    for (const path of ["/cart", "/checkout", "/admin", "/login", "/account", "/orders", "/wishlist", "/compare"]) {
      expect(urls).not.toContain(`${SITE_URL}${path}`);
    }
    for (const url of urls) expect(url.startsWith(`${SITE_URL}/shop`)).toBe(false);
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules).toContainEqual({ userAgent: "*", allow: "/" });
    expect(rules.some((rule) => rule.disallow)).toBe(false);
    const aiRule = rules.find((rule) => Array.isArray(rule.userAgent));
    expect(aiRule?.userAgent).toEqual(expect.arrayContaining(["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]));
    expect(aiRule?.allow).toBe("/");
  });
});

describe("breadcrumb JSON-LD", () => {
  const product = getProducts()[0];
  const data = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Our Mushrooms", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  it("lists the trail in order with absolute /products URLs", () => {
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Our Mushrooms", item: `${SITE_URL}/products` },
        { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
      ],
    });
  });

  it("carries no price, offer or rating data", () => {
    const json = serializeJsonLd(data);
    for (const word of ["price", "offers", "Offer", "aggregateRating", "review"]) {
      expect(json).not.toContain(word);
    }
  });

  it("escapes < so content can't close the script tag", () => {
    expect(serializeJsonLd({ name: "</script><b>" })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
