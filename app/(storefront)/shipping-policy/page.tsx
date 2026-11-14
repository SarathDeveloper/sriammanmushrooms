import type { Metadata } from "next";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping & Delivery Policy",
  description:
    "Shipping charges, delivery timelines, and delivery terms for Sri Amman Mushroom Farm.",
  path: "/shipping-policy",
});

const sections = [
  {
    title: "1. How Ordering Works",
    body: "We take orders on WhatsApp and by phone. The forms on this website do not place an order — they open WhatsApp with your message ready to send. Your order is confirmed only when we reply on WhatsApp confirming the quantity, price, delivery date and any delivery charge.",
  },
  {
    title: "2. Delivery Areas",
    body: "We deliver to select areas in Tamil Nadu. Send us your location on WhatsApp and we will tell you whether we can deliver there. If we cannot, we will let you know and suggest another option, such as collecting from the farm.",
  },
  {
    title: "3. Delivery Timeline",
    body: "We harvest fresh and deliver as soon as we can. Nearby orders usually arrive the same day or the next day; farther areas may take longer. We tell you the expected delivery date when we confirm your order. This is our best estimate, not a guarantee.",
  },
  {
    title: "4. Delivery Charges",
    body: "Delivery is free on orders above ₹500. Smaller orders or distant locations may have a delivery charge. We always tell you the exact amount on WhatsApp before you confirm, so there are no surprises.",
  },
  {
    title: "5. Packing & Freshness",
    body: "Fresh mushrooms are perishable, so we pack every order in clean, food-safe packaging to keep them fresh on the way. Please check your order when it arrives and put the mushrooms in the refrigerator straight away.",
  },
  {
    title: "6. Missed Deliveries",
    body: "If no one is available to receive the order, or the address is incorrect, we will call or message you on the number you gave us to arrange another time. Fresh mushrooms cannot be held for long, so please keep your phone reachable on the delivery day.",
  },
  {
    title: "7. Delivery Updates",
    body: "We keep you updated on WhatsApp or by phone, including when your order leaves the farm. There is no online tracking page.",
  },
  {
    title: "8. Pre-Orders & Bulk Orders",
    body: "Pre-orders are harvested and delivered on the date we agree when you book. Bulk orders may need extra time; we will confirm the delivery schedule with you before you confirm the order.",
  },
  {
    title: "9. Contact Us",
    body: "For any delivery question, WhatsApp us on +91 63806 87811, call +91 93855 26105, or email sriammanmushrooms@gmail.com. We are available Monday–Sunday, 6:00 AM – 8:00 PM.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Legal"
        title="Shipping & Delivery Policy"
        description="Last updated: November 14, 2026"
        image="/gallery/farm/oyster-mushroom-growing.png"
      />
      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-10">
          {sections.map((section, i) => (
            <FadeIn key={section.title} delay={Math.min(i * 0.05, 0.3)}>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-[var(--color-body)] text-base sm:text-lg leading-relaxed">
                {section.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
