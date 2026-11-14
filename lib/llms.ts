import type { Product } from "@/lib/content";
import type { FaqItem } from "@/lib/faq";
import {
  absoluteUrl,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DELIVERY_AREAS,
  FARM_ADDRESS,
  FARM_LOCATION,
  FARM_MAPS_LINK,
  OPENING_HOURS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_PROFILES,
} from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * /llms.txt (https://llmstxt.org): a plain-markdown summary of the business
 * for AI assistants and answer engines, built from the same facts the site
 * shows so it never drifts.
 */
export function buildLlmsTxt({ products, faq }: { products: Product[]; faq: FaqItem[] }): string {
  const address = `${FARM_ADDRESS.streetAddress}, ${FARM_ADDRESS.addressLocality} – ${FARM_ADDRESS.postalCode}, ${FARM_ADDRESS.addressRegion}, India`;
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Key facts",
    "",
    `- Business name: ${SITE_NAME}`,
    "- What we sell: fresh oyster mushrooms and button mushrooms, grown on our own farm",
    "- Prices: not listed online; they follow the daily harvest. Ask on WhatsApp for today's price.",
    `- How to order: WhatsApp ${whatsappLink("Hi, I'd like to order fresh mushrooms.")} or call ${CONTACT_PHONE.display}`,
    `- Opening hours: ${OPENING_HOURS}`,
    `- Address: ${address}`,
    `- Location: ${FARM_LOCATION.lat}, ${FARM_LOCATION.lng} (${FARM_MAPS_LINK})`,
    `- Delivery areas: ${DELIVERY_AREAS.join(", ")}`,
    `- Email: ${CONTACT_EMAIL}`,
    `- Phone: ${CONTACT_PHONE.display}`,
    `- Social: ${SOCIAL_PROFILES.join(", ")}`,
    "",
    "## Products",
    "",
    ...products.map(
      (p) =>
        `- [${p.name}](${absoluteUrl(`/products/${p.slug}`)}): ${p.weight} pack. ${p.description}${
          p.highlights.length ? ` Highlights: ${p.highlights.join(", ")}.` : ""
        }`,
    ),
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): fresh mushrooms, delivery schedule and common questions`,
    `- [Our Mushrooms](${absoluteUrl("/products")}): the oyster and button mushrooms we grow`,
    `- [Pre-Order](${absoluteUrl("/pre-order")}): book mushrooms in advance on WhatsApp`,
    `- [Training](${absoluteUrl("/training")}): mushroom farming training and setup support`,
    `- [About](${absoluteUrl("/about")}): our farm and story`,
    `- [Contact](${absoluteUrl("/contact")}): phone, WhatsApp, email and map`,
    "",
    "## Common questions",
    "",
    ...faq.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}
