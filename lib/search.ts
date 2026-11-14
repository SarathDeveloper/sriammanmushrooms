import type { SearchItem } from "@/lib/content";

/** Case-insensitive match on name and category; every word in the query must match. */
export function filterSearchItems(items: SearchItem[], query: string, limit = 8): SearchItem[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];
  const words = trimmed.split(/\s+/);
  return items
    .filter((item) => {
      const haystack = `${item.name} ${item.category}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    })
    .slice(0, limit);
}
