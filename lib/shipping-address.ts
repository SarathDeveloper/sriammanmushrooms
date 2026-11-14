/**
 * Order.shippingAddress is a JSONB column. Rows written before it was JSONB may
 * still hold a JSON *string*, and rows that were never valid JSON were migrated
 * as {"raw": "<text>"}. Checkout writes fullName/address; the admin manual
 * order form historically wrote name/street. readShippingAddress accepts all of
 * these and returns one normalised shape.
 *
 * Safe to import from Client Components (no server-only imports).
 */
export type ShippingAddress = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  paymentMethod?: string;
  deliverySlot?: string;
  notes?: string;
  /** Original text for addresses that were never valid JSON. */
  raw?: string;
};

const STRING_KEYS = [
  "fullName",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "country",
  "paymentMethod",
  "deliverySlot",
  "notes",
  "raw",
] as const;

export function readShippingAddress(value: unknown): ShippingAddress {
  let data = value;
  if (typeof value === "string") {
    try {
      data = JSON.parse(value);
    } catch {
      return value.trim() ? { raw: value } : {};
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  const source = data as Record<string, unknown>;
  const result: ShippingAddress = {};
  for (const key of STRING_KEYS) {
    const v = source[key];
    if (typeof v === "string" && v.trim()) result[key] = v;
  }
  if (!result.fullName && typeof source.name === "string") result.fullName = source.name;
  if (!result.address && typeof source.street === "string") result.address = source.street;
  return result;
}
