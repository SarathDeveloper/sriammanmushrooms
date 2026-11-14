/** Public site URL used for canonical links, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vellimalaifarms.in").replace(/\/$/, "");

export const SITE_NAME = "Sri Amman Mushroom Farms";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
