import { z } from "zod";

import { indianMobileError, normalizeIndianMobile } from "@/lib/phone";

/**
 * Every enquiry on the showcase site ends in a WhatsApp chat with the farm:
 * forms validate in the browser, build a readable message and open wa.me.
 * Nothing is sent to or stored on a server.
 */

/** Farm WhatsApp number in international format without "+". */
export const WHATSAPP_NUMBER = "916380687811";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Opens WhatsApp in a new tab. Must be called synchronously from the submit or
 * click handler (no `await` before it) or popup blockers will stop it.
 * Returns false when the browser blocked the window, so callers can show the
 * fallback link prominently.
 */
export function openWhatsApp(url: string): boolean {
  if (typeof window === "undefined") return false;
  const win = window.open(url, "_blank");
  if (!win) return false;
  win.opener = null;
  return true;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const name = z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long.");

const mobile = z
  .string()
  .transform((v) => normalizeIndianMobile(v))
  .superRefine((v, ctx) => {
    const err = indianMobileError(v);
    if (err) ctx.addIssue({ code: "custom", message: err });
  });

const optionalText = (max: number) =>
  z.string().trim().max(max, `Please keep this under ${max} characters.`).optional().default("");

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .optional()
  .default("")
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address.");

export const productEnquirySchema = z.object({
  name,
  phone: mobile,
  quantity: z.coerce
    .number({ message: "Enter how many packs you need." })
    .int("Enter a whole number of packs.")
    .min(1, "Enter at least 1 pack.")
    .max(999, "For orders over 999 packs, mention it in the message."),
  location: optionalText(80),
  message: optionalText(1000),
});

export const INQUIRY_TYPES = ["Products", "Training", "Farm Visit", "Wholesale", "Other"] as const;

export const contactEnquirySchema = z.object({
  name,
  phone: mobile,
  email: optionalEmail,
  inquiryType: z.string().trim().min(1, "Please choose what you need.").max(40),
  location: optionalText(80),
  company: optionalText(120),
  message: optionalText(2000),
});

export const preOrderSchema = z.object({
  name,
  phone: mobile,
  email: optionalEmail,
  product: z.string().trim().min(1, "Tell us which mushrooms you want.").max(120),
  quantity: z.string().trim().min(1, "Tell us how much you need.").max(40),
  preferredDate: z.string().trim().min(1, "Choose a preferred date."),
  location: z.string().trim().min(2, "Enter your delivery location.").max(120),
  notes: optionalText(1000),
});

export type ProductEnquiry = z.infer<typeof productEnquirySchema>;
export type ContactEnquiry = z.infer<typeof contactEnquirySchema>;
export type PreOrderEnquiry = z.infer<typeof preOrderSchema>;

/** First validation message per field, for showing under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Message builders
// ---------------------------------------------------------------------------

function lines(parts: Array<[label: string, value: string | number | undefined | null]>) {
  return parts
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function buildProductEnquiryMessage(
  product: { name: string; weight: string },
  enquiry: ProductEnquiry,
) {
  const details = lines([
    ["Product", `${product.name} (${product.weight})`],
    ["Quantity", `${enquiry.quantity} pack${enquiry.quantity === 1 ? "" : "s"}`],
    ["Name", enquiry.name],
    ["Mobile", enquiry.phone],
    ["Location", enquiry.location],
  ]);
  const note = enquiry.message ? `\n\n${enquiry.message}` : "";
  return `Hi Sri Amman Mushroom Farm! I'd like to enquire about a product.\n\n${details}${note}\n\nPlease share today's price, availability and delivery details.`;
}

export function buildContactMessage(enquiry: ContactEnquiry) {
  const details = lines([
    ["Enquiry", enquiry.inquiryType],
    ["Name", enquiry.name],
    ["Mobile", enquiry.phone],
    ["Email", enquiry.email],
    ["Location", enquiry.location],
    ["Company", enquiry.company],
  ]);
  const note = enquiry.message ? `\n\n${enquiry.message}` : "";
  return `Hi Sri Amman Mushroom Farm! I have an enquiry.\n\n${details}${note}`;
}

export function buildPreOrderMessage(order: PreOrderEnquiry) {
  const details = lines([
    ["Product(s)", order.product],
    ["Quantity", order.quantity],
    ["Preferred date", formatDate(order.preferredDate)],
    ["Delivery location", order.location],
    ["Name", order.name],
    ["Mobile", order.phone],
    ["Email", order.email],
  ]);
  const note = order.notes ? `\n\nNotes: ${order.notes}` : "";
  return `Hi Sri Amman Mushroom Farm! I'd like to pre-order.\n\n${details}${note}\n\nPlease confirm availability.`;
}

export function buildUpdatesMessage() {
  return "Hi Sri Amman Mushroom Farm! Please add me to your WhatsApp updates for fresh harvests, offers and training dates.";
}
