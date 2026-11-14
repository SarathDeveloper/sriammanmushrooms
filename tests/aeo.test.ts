import { describe, expect, it } from "vitest";

import { getProducts } from "@/lib/content";
import { HOME_FAQ } from "@/lib/faq";
import { buildLlmsTxt } from "@/lib/llms";
import { faqPageJsonLd, localBusinessJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  DEFAULT_OG_IMAGE,
  FARM_LOCATION,
  OPENING_HOURS,
  resolveSiteUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

describe("resolveSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL, then the Vercel production domain, then the brand domain", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.com/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe(
      "https://example.com",
    );
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "sriammanmushrooms.vercel.app" })).toBe(
      "https://sriammanmushrooms.vercel.app",
    );
    expect(resolveSiteUrl({})).toBe("https://vellimalaifarms.in");
  });
});

describe("pageMetadata", () => {
  it("gives each page its own canonical and share URL, plus a default share image", () => {
    const m = pageMetadata({ title: "Contact Us", description: "Reach us", path: "/contact" });
    expect(m.alternates?.canonical).toBe("/contact");
    expect(m.openGraph).toMatchObject({ url: "/contact", title: `Contact Us | ${SITE_NAME}`, locale: "en_IN" });
    expect(JSON.stringify(m.openGraph?.images)).toContain(DEFAULT_OG_IMAGE.path);
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("uses a page's own image when given", () => {
    const m = pageMetadata({ title: "Oyster", description: "d", path: "/products/x", image: { url: "https://cdn/x.jpg", alt: "x" } });
    expect(JSON.stringify(m.openGraph?.images)).toContain("https://cdn/x.jpg");
    expect(JSON.stringify(m.openGraph?.images)).not.toContain(DEFAULT_OG_IMAGE.path);
  });
});

describe("LocalBusiness and WebSite structured data", () => {
  const business = localBusinessJsonLd(getProducts());

  it("carries the facts answer engines need", () => {
    expect(business).toMatchObject({
      "@type": "LocalBusiness",
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      geo: { latitude: FARM_LOCATION.lat, longitude: FARM_LOCATION.lng },
      openingHoursSpecification: { opens: "06:00", closes: "20:00" },
    });
    expect(business.openingHoursSpecification.dayOfWeek).toHaveLength(7);
    expect(business.sameAs.length).toBeGreaterThan(0);
  });

  it("lists exactly the products on sale, without price or Product type", () => {
    const names = business.hasOfferCatalog.itemListElement.map((o) => o.itemOffered.name);
    expect(names.sort()).toEqual(getProducts().map((p) => p.name).sort());
    const json = JSON.stringify(business);
    expect(json).not.toMatch(/"price"|"Product"|aggregateRating/);
  });

  it("links the website to the business", () => {
    expect(websiteJsonLd().publisher["@id"]).toBe(business["@id"]);
  });
});

describe("FAQ", () => {
  it("FAQPage markup mirrors the visible questions and answers exactly", () => {
    const ld = faqPageJsonLd(HOME_FAQ);
    expect(ld.mainEntity).toHaveLength(HOME_FAQ.length);
    ld.mainEntity.forEach((q, i) => {
      expect(q.name).toBe(HOME_FAQ[i].question);
      expect(q.acceptedAnswer.text).toBe(HOME_FAQ[i].answer);
    });
  });

  it("answers the core questions people ask about the farm", () => {
    const text = HOME_FAQ.map((f) => `${f.question} ${f.answer}`).join(" ").toLowerCase();
    for (const fact of ["oyster", "button", "whatsapp", "kallakurichi", "6:00 am", "deliver"]) {
      expect(text).toContain(fact);
    }
  });
});

describe("llms.txt", () => {
  const txt = buildLlmsTxt({ products: getProducts(), faq: HOME_FAQ });

  it("summarises the business with every product, hours, contact and location", () => {
    expect(txt.startsWith(`# ${SITE_NAME}\n`)).toBe(true);
    for (const p of getProducts()) expect(txt).toContain(`${SITE_URL}/products/${p.slug}`);
    expect(txt).toContain(OPENING_HOURS);
    expect(txt).toContain(CONTACT_EMAIL);
    expect(txt).toContain(`${FARM_LOCATION.lat}, ${FARM_LOCATION.lng}`);
    for (const f of HOME_FAQ) expect(txt).toContain(f.question);
  });

  it("states that prices are not listed instead of quoting any", () => {
    expect(txt).toMatch(/Prices: not listed online/);
    expect(txt).not.toMatch(/₹\s?\d/);
  });
});
