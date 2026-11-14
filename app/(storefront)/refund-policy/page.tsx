import type { Metadata } from "next";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Refund & Cancellation Policy",
  description:
    "Refund, return, and order cancellation policy for Sri Amman Mushroom Farm.",
  path: "/refund-policy",
});

const sections = [
  {
    title: "1. Cancelling an Order",
    body: "You can cancel an order by WhatsApp or phone any time before it leaves the farm. Once an order is out for delivery, it cannot be cancelled. Pre-orders can be cancelled up to 24 hours before the agreed harvest date.",
  },
  {
    title: "2. Problems With Your Order",
    body: "If your mushrooms arrive damaged, spoiled or different from what you ordered, send us a WhatsApp message with photos within 24 hours of delivery. We cannot accept claims for mushrooms that have been eaten or stored incorrectly, or that are reported more than 24 hours after delivery.",
  },
  {
    title: "3. Replacement or Refund",
    body: "After checking your photos, we will offer either a replacement at the next available delivery or a full refund for the affected items — whichever you prefer. If only part of the order is affected, we will replace or refund that part.",
  },
  {
    title: "4. How Refunds Are Paid",
    body: "Refunds are paid back the same way you paid, for example by UPI or bank transfer, within 5–7 working days of approval. If you paid in cash, we will refund you by UPI or bank transfer and ask for the details on WhatsApp.",
  },
  {
    title: "5. Pre-Order Advances",
    body: "If you paid an advance for a pre-order and cancel more than 24 hours before the agreed harvest date, you get a full refund. Cancellations within 24 hours of harvest are not refundable, because that harvest has already been set aside for you.",
  },
  {
    title: "6. Non-Refundable Items",
    body: "Custom or bulk orders cannot be refunded once confirmed, unless there is a problem with quality (see section 2). Training fees are not refundable if you cancel less than 48 hours before the session. Delivery charges are not refundable unless the problem was our mistake.",
  },
  {
    title: "7. How to Ask for a Refund",
    body: "Send us a WhatsApp message or call us with your name, the date of your order and photos of the problem. We will reply within 24 hours.",
  },
  {
    title: "8. Contact Us",
    body: "For any question about cancellations or refunds, WhatsApp us on +91 63806 87811, call +91 93855 26105, or email sriammanmushrooms@gmail.com. We are available Monday–Sunday, 6:00 AM – 8:00 PM.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Legal"
        title="Refund & Cancellation Policy"
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
