import type { Product } from "@/lib/content";

export const PRODUCTS_PER_PAGE = 12;

export type ShopQuery = {
  category?: string;
  q?: string;
  sort?: string;
  page?: number;
};

/**
 * Filters, sorts and paginates the static catalogue for the shop page.
 * "Default" keeps the content file order (sortOrder); "newest" reverses it,
 * so products added at the end of products.json show first.
 */
export function queryProducts(all: Product[], query: ShopQuery) {
  let list = all;

  if (query.category && query.category !== "all") {
    list = list.filter((p) => p.categorySlug === query.category);
  }

  const q = query.q?.trim().toLowerCase();
  if (q && q.length >= 2) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }

  const sorted = [...list];
  switch (query.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      sorted.reverse();
      break;
  }

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const products = sorted.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  return { products, totalCount, totalPages, page };
}
