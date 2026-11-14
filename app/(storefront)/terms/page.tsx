import type { Metadata } from "next";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of the Sri Amman Mushroom Farm website and services.",
  path: "/terms",
});

const sections = [
  {
    title: "1. About These Terms",
    body: "These terms apply when you use the Sri Amman Mushroom Farm website or order from us. By using this website, you agree to these terms and to our Privacy Policy.",
  },
  {
    title: "2. Information on This Website",
    body: "Product descriptions, nutrition values and photos are for general information. Fresh produce varies from harvest to harvest, so what you receive may look a little different from the photos. Prices are not listed on this website because they change with the daily harvest — we give you today's price on WhatsApp.",
  },
  {
    title: "3. Orders",
    body: "Sending a form or a message is an enquiry, not a confirmed order. An order is confirmed only when we confirm the quantity, price, delivery date and any delivery charge on WhatsApp or by phone. We may decline an order, for example if stock runs out or we cannot deliver to your area.",
  },
  {
    title: "4. Payment",
    body: "No payment is taken on this website. Payment is arranged directly with us when we confirm your order. We will never ask you for card details, OTPs or passwords.",
  },
  {
    title: "5. Delivery, Cancellations & Refunds",
    body: "Delivery is covered by our Shipping & Delivery Policy, and cancellations and refunds by our Refund & Cancellation Policy.",
  },
  {
    title: "6. Training & Farming Support",
    body: "Training dates, fees and what is included are confirmed directly with our team before you pay. Income figures, harvest times and other numbers on this website are estimates based on our own experience. Your results depend on your setup, effort, weather and market prices, and are not guaranteed. Government subsidies and loans are decided by the government departments and banks concerned; we can help you apply, but we cannot promise approval.",
  },
  {
    title: "7. Intellectual Property",
    body: "All content on this website, including text, photos, logos and graphics, belongs to Sri Amman Mushroom Farm. Please do not copy or reuse it without our written permission.",
  },
  {
    title: "8. Limitation of Liability",
    body: "To the fullest extent the law allows, Sri Amman Mushroom Farm is not responsible for any indirect or consequential loss arising from your use of this website or our products.",
  },
  {
    title: "9. Governing Law",
    body: "These terms are governed by the laws of India. Any dispute will be handled by the courts of Tamil Nadu.",
  },
  {
    title: "10. Contact Us",
    body: "For any question about these terms, WhatsApp us on +91 63806 87811, call +91 93855 26105, or email sriammanmushrooms@gmail.com. We are available Monday–Sunday, 6:00 AM – 8:00 PM.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: November 14, 2026"
        image="https://images.unsplash.com/photo-1445282768818-728615cc910a?q=80&w=2000&auto=format&fit=crop"
      />
      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-10">
          {sections.map((section, i) => (
            <FadeIn key={section.title} delay={Math.min(i * 0.05, 0.3)}>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-3">{section.title}</h2>
              <p className="text-[var(--color-body)] text-base sm:text-lg leading-relaxed">{section.body}</p>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
