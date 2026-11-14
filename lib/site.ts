/**
 * Public site URL used for canonical links, the sitemap, robots.txt, Open
 * Graph and structured data.
 *
 * 1. NEXT_PUBLIC_SITE_URL when set (use this once a custom domain is live).
 * 2. On Vercel, VERCEL_PROJECT_PRODUCTION_URL: the project's production
 *    domain (the custom domain once one is assigned, otherwise
 *    <project>.vercel.app). Vercel sets it automatically at build and run
 *    time, so canonical URLs never point at a domain that isn't serving.
 * 3. Otherwise the brand domain.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "https://vellimalaifarms.in";
}

export const SITE_URL = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
});

export const SITE_NAME = "Sri Amman Mushroom Farm";

/** One-sentence summary used for the home page description, structured data and llms.txt. */
export const SITE_DESCRIPTION =
  "Sri Amman Mushroom Farm grows fresh oyster and button mushrooms in Vellimalai, Kalvarayan Hills (Kallakurichi district, Tamil Nadu), harvested every morning, delivered fresh, and offers hands-on mushroom farming training.";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Default social-share image (1200x630) for pages without their own. */
export const DEFAULT_OG_IMAGE = {
  path: "/og/sri-amman-mushroom-farm.jpg",
  width: 1200,
  height: 630,
  alt: "Fresh oyster mushrooms growing at Sri Amman Mushroom Farm",
} as const;

/** Public contact email shown on the site (footer, contact sections, policies, structured data). */
export const CONTACT_EMAIL = "sriammanmushrooms@gmail.com";

/** Main phone number (display form and E.164). */
export const CONTACT_PHONE = { display: "+91 93855 26105", e164: "+919385526105" } as const;

/** Postal address of the farm. */
export const FARM_ADDRESS = {
  streetAddress: "Vellimalai, Melsathanur",
  addressLocality: "Kallakurichi",
  addressRegion: "Tamil Nadu",
  postalCode: "606209",
  addressCountry: "IN",
} as const;

/** Farm location used for the map embeds, "open in Google Maps" links and structured data. */
export const FARM_LOCATION = { lat: 11.802164912962507, lng: 78.71149729234672 } as const;

export const FARM_MAPS_EMBED_URL = `https://www.google.com/maps?q=${FARM_LOCATION.lat},${FARM_LOCATION.lng}&z=14&output=embed`;
export const FARM_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${FARM_LOCATION.lat},${FARM_LOCATION.lng}`;

/** Opening hours shown on the site. Keep OPENING_HOURS_SCHEMA (schema.org format) in sync. */
export const OPENING_HOURS = "Monday–Sunday: 6:00 AM – 8:00 PM";
export const OPENING_HOURS_SCHEMA = "Mo-Su 06:00-20:00";

/** Instagram profile, shown on the contact sections and in the footer. */
export const INSTAGRAM = {
  handle: "sri_amman_mushrooms",
  url: "https://www.instagram.com/sri_amman_mushrooms/",
} as const;

/** Official social profiles (also linked in the footer); used as schema.org sameAs. */
export const SOCIAL_PROFILES = [INSTAGRAM.url, "https://youtube.com/@vellimalaifarms"] as const;

/** Towns the farm delivers to (same list as the home page FAQ). */
export const DELIVERY_AREAS = [
  "Salem",
  "Namakkal",
  "Erode",
  "Coimbatore",
  "Trichy",
  "Madurai",
  "Chennai",
  "Bangalore",
] as const;
