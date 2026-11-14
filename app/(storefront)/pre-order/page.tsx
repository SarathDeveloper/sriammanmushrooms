import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { PreOrderSection } from "@/components/PreOrderSection";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pre-Order Fresh Mushrooms",
  description:
    "Pre-order fresh oyster and button mushrooms from Sri Amman Mushroom Farm in the Kalvarayan Hills. Send your order on WhatsApp and we'll confirm availability and delivery.",
  path: "/pre-order",
});

export default function PreOrderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Book Early"
        title="Pre-Order Mushrooms"
        description="Get farm-fresh mushrooms for an upcoming harvest. Tell us what you need and when, and we'll confirm availability on WhatsApp."
        image="https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2000&auto=format&fit=crop"
      />

      <PreOrderSection />
    </div>
  );
}
