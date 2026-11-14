import { DELIVERY_AREAS, OPENING_HOURS } from "@/lib/site";

export type FaqItem = { question: string; answer: string };

function listWithAnd(items: readonly string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Home page "Common Questions". The same list renders the visible accordion
 * and the FAQPage structured data, so the two can never drift apart (Google
 * requires FAQ markup to match visible content). Answers are plain text and
 * written to be quotable on their own by search and AI answer engines.
 */
export const HOME_FAQ: FaqItem[] = [
  {
    question: "What mushrooms does Sri Amman Mushroom Farm grow?",
    answer:
      "We grow fresh oyster mushrooms and button mushrooms at our farm in Vellimalai, in the Kalvarayan Hills of Kallakurichi district, Tamil Nadu.",
  },
  {
    question: "Are the mushrooms fresh when I get them?",
    answer:
      "Yes. We pick mushrooms early every morning and send them out the same day, packed in cool boxes so they stay fresh. Nearby orders usually arrive the same day; farther areas the next day.",
  },
  {
    question: "How do I order, and what is the price?",
    answer:
      "Prices follow the daily harvest, so we don't list them on the website. Tap Enquire on a product or message us on WhatsApp with the variety and quantity, and we'll confirm today's price and delivery.",
  },
  {
    question: "Where do you deliver?",
    answer: `We deliver to ${listWithAnd(DELIVERY_AREAS)}. Check your pincode on a product page to see if we deliver to your area.`,
  },
  {
    question: "Can I get mushrooms every week?",
    answer:
      "Yes. Message us on WhatsApp to set up a regular weekly, fortnightly or monthly supply. You can stop anytime.",
  },
  {
    question: "What are your opening hours?",
    answer: `We're open ${OPENING_HOURS.replace(": ", ", ")}.`,
  },
  {
    question: "Where is the farm?",
    answer:
      "Our farm is at Vellimalai, Melsathanur, Kallakurichi – 606 209, Tamil Nadu, in the Kalvarayan Hills. The map and directions are on our Contact page.",
  },
  {
    question: "How do you grow your mushrooms?",
    answer:
      "We follow natural growing practices at our farm and pack each harvest with care. Contact us if you need details about a particular variety or batch.",
  },
  {
    question: "Do you offer mushroom farming training?",
    answer:
      "Yes. We give hands-on training at our farm, then help you with setup, spawn bags and customer orders. Message us on WhatsApp for the next training dates and fees, or see our Training page.",
  },
];
