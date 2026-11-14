import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

// Everything public is crawlable. The wishlist page opts out with a
// `noindex` robots meta tag instead of a disallow rule, so crawlers can see it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
