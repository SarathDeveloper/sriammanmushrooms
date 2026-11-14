import { isCloudinarySrc, toCloudinaryPublicId } from "@/lib/cloudinary-utils";
import type { Product } from "@/lib/content";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

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

export function productJsonLd(product: Product) {
  const images = product.gallery
    .map(absoluteImageUrl)
    .filter((u): u is string => u !== null);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    category: product.category,
    ...(images.length > 0 ? { image: images } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/shop/${product.slug}`),
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
