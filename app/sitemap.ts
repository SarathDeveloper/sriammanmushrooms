import type { MetadataRoute } from "next";

import { getProducts } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

/** Public pages, in rough order of importance. */
export const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pre-order", priority: 0.8, changeFrequency: "monthly" },
  { path: "/training", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/shipping-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const products = getProducts().map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...pages, ...products];
}
