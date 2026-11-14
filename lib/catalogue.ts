/**
 * The products the farm currently sells. The farm grows only oyster and button
 * mushrooms right now, so the catalogue is limited to these two even though the
 * old database still holds other products. scripts/export-content.ts only
 * exports these slugs; add a slug here (and to content/products.json) to bring
 * a product back.
 */
export const CATALOGUE_PRODUCT_SLUGS = ["premium-oyster-mushroom", "button-mushroom"] as const;

/** Varieties the farm no longer grows; used to flag stale copy in exported content. */
export const DISCONTINUED_VARIETY_PATTERN = /\b(milky|shiitake|pink oyster|king oyster|grey oyster)\b/i;
