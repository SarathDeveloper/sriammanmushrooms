/**
 * Permanent redirects for next.config.ts. Kept in their own module (no `@/`
 * imports, no Next APIs) so tests can check them without loading the config.
 *
 * Next.js passes the query string through, so /shop?category=oyster lands on
 * /products?category=oyster.
 */
export type SiteRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

/**
 * Products no longer sold (the farm now grows only oyster and button
 * mushrooms). Their old pages, under /shop or /products, go to the catalogue
 * instead of a 404 so shared links and search results still work.
 */
export const REMOVED_PRODUCT_SLUGS = [
  "fresh-milky-mushroom",
  "shiitake-exotic",
  "grey-oyster-mushroom",
  "mushroom-pickle",
  "dried-shiitake",
  "mixed-mushroom-combo",
  "pink-oyster-mushroom",
  "king-oyster-mushroom",
  "brown-button-mushroom",
  "jumbo-button-mushroom",
  "milky-mushroom-family-pack",
  "fresh-shiitake-caps",
  "mushroom-masala-powder",
  "mushroom-soup-mix",
] as const;

export const SITE_REDIRECTS: SiteRedirect[] = [
  ...REMOVED_PRODUCT_SLUGS.flatMap((slug) => [
    { source: `/shop/${slug}`, destination: "/products", permanent: true as const },
    { source: `/products/${slug}`, destination: "/products", permanent: true as const },
  ]),

  // The catalogue moved from /shop to /products ("Our Mushrooms").
  { source: "/shop", destination: "/products", permanent: true },
  { source: "/shop/:slug", destination: "/products/:slug", permanent: true },

  // Removed shopping features: wishlist and the variety comparison page.
  { source: "/wishlist", destination: "/products", permanent: true },
  { source: "/compare", destination: "/products", permanent: true },

  // The showcase site has no ordering, accounts or admin. Old links and
  // bookmarks to those pages land somewhere useful instead of a 404. The full
  // version with these pages lives on the feature/fullstack-admin branch.
  { source: "/cart", destination: "/products", permanent: true },
  { source: "/checkout", destination: "/products", permanent: true },
  { source: "/orders", destination: "/contact", permanent: true },
  { source: "/track-order", destination: "/contact", permanent: true },
  { source: "/account", destination: "/", permanent: true },
  { source: "/register", destination: "/contact", permanent: true },
  { source: "/login", destination: "/", permanent: true },
  { source: "/admin", destination: "/", permanent: true },
  { source: "/admin/:path*", destination: "/", permanent: true },
];
