import { isCloudinarySrc, toCloudinaryPublicId } from "@/lib/cloudinary-utils";
import { absoluteUrl } from "@/lib/site";

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

/**
 * schema.org BreadcrumbList for a trail of site paths, e.g.
 * Home → Our Mushrooms → Premium Oyster Mushroom.
 *
 * Product pages deliberately have no Product JSON-LD: the site shows no
 * prices or ratings, and Google flags a Product without offers, review or
 * aggregateRating as invalid. The breadcrumb plus the site-wide LocalBusiness
 * (app/layout.tsx) is what's left.
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
