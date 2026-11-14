/** Public site URL used for canonical links, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vellimalaifarms.in").replace(/\/$/, "");

export const SITE_NAME = "Sri Amman Mushroom Farm";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Public contact email shown on the site (footer, contact sections, policies, structured data). */
export const CONTACT_EMAIL = "sriammanmushrooms@gmail.com";

/** Farm location used for the map embeds, "open in Google Maps" links and structured data. */
export const FARM_LOCATION = { lat: 11.802164912962507, lng: 78.71149729234672 } as const;

export const FARM_MAPS_EMBED_URL = `https://www.google.com/maps?q=${FARM_LOCATION.lat},${FARM_LOCATION.lng}&z=14&output=embed`;
export const FARM_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${FARM_LOCATION.lat},${FARM_LOCATION.lng}`;

/** Opening hours shown on the site. Keep OPENING_HOURS_SCHEMA (schema.org format) in sync. */
export const OPENING_HOURS = "Monday–Sunday: 6:00 AM – 8:00 PM";
export const OPENING_HOURS_SCHEMA = "Mo-Su 06:00-20:00";
