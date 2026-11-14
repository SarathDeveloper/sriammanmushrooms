import type { Metadata } from "next";

import { isCloudinarySrc, toCloudinaryPublicId } from "@/lib/cloudinary-utils";
import type { FaqItem } from "@/lib/faq";
import {
  absoluteUrl,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEFAULT_OG_IMAGE,
  DELIVERY_AREAS,
  FARM_ADDRESS,
  FARM_LOCATION,
  FARM_MAPS_LINK,
  OPENING_HOURS_SCHEMA,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/lib/site";

/**
 * Absolute URL for an image reference, for Open Graph and JSON-LD.
 * Returns null for a Cloudinary public ID when the cloud name isn't configured.
 */
export function absoluteImageUrl(src: string): string | null {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return absoluteUrl(src);
  if (isCloudinarySrc(src)) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return null;
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1200/${toCloudinaryPublicId(src)}`;
  }
  return null;
}

type PageImage = { url: string; alt: string; width?: number; height?: number };

/**
 * Complete metadata for a page: title, description, canonical URL, and Open
 * Graph / Twitter cards that point at THIS page (not the home page) with a
 * share image. Use it for every page so shared links preview correctly.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: {
  /** Page title; the layout appends " | Sri Amman Mushroom Farm". Omit for the home page. */
  title?: string;
  description: string;
  path: string;
  image?: PageImage | null;
  noIndex?: boolean;
}): Metadata {
  const shareImage: PageImage = image ?? {
    url: DEFAULT_OG_IMAGE.path,
    alt: DEFAULT_OG_IMAGE.alt,
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
  };
  const shareTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Fresh Oyster & Button Mushrooms`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      url: path,
      title: shareTitle,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [shareImage.url],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Site-wide LocalBusiness: the facts search engines and AI answer engines use
 * for "where / when / how to contact / what do they sell" questions.
 * Products are listed as an OfferCatalog of plain items (not schema.org
 * Product, which Google flags as invalid without a price or rating).
 */
export function localBusinessJsonLd(products: Array<{ name: string; slug: string; description: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    image: [absoluteUrl(DEFAULT_OG_IMAGE.path)],
    telephone: CONTACT_PHONE.e164,
    email: CONTACT_EMAIL,
    address: { "@type": "PostalAddress", ...FARM_ADDRESS },
    geo: { "@type": "GeoCoordinates", latitude: FARM_LOCATION.lat, longitude: FARM_LOCATION.lng },
    hasMap: FARM_MAPS_LINK,
    openingHours: OPENING_HOURS_SCHEMA,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "06:00",
      closes: "20:00",
    },
    areaServed: DELIVERY_AREAS.map((name) => ({ "@type": "City", name })),
    sameAs: [...SOCIAL_PROFILES],
    knowsAbout: ["Oyster mushrooms", "Button mushrooms", "Mushroom cultivation", "Mushroom farming training"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fresh mushrooms",
      itemListElement: products.map((p) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Thing",
          name: p.name,
          description: p.description,
          url: absoluteUrl(`/products/${p.slug}`),
        },
      })),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** FAQPage for a list of visible questions and answers. */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * schema.org BreadcrumbList for a trail of site paths, e.g.
 * Home → Our Mushrooms → Premium Oyster Mushroom.
 *
 * Product pages deliberately have no Product JSON-LD: the site shows no
 * prices or ratings, and Google flags a Product without offers, review or
 * aggregateRating as invalid.
 */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
