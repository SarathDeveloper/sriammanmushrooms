import type { Metadata } from "next";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Sri Amman Mushroom Farm collects, uses, and protects your personal information.",
  path: "/privacy",
});

const sections = [
  {
    title: "1. Who We Are",
    body: "This website belongs to Sri Amman Mushroom Farm, Vellimalai, Melsathanur, Kallakurichi – 606 209, Tamil Nadu. This policy explains what happens to your information when you use this website or contact us.",
  },
  {
    title: "2. What This Website Collects",
    body: "This website has no user accounts, no online payments and no email newsletter. The forms on this website (contact, pre-order and training enquiries) do not send your details to us or store them anywhere. When you press send, they open WhatsApp on your device with your message filled in. Nothing reaches us until you send that message in WhatsApp yourself.",
  },
  {
    title: "3. Information You Send Us",
    body: "When you message us on WhatsApp, call us or email us, we receive the details you choose to share, such as your name, phone number, delivery address and what you want to order. We use this only to reply to you, confirm and deliver your orders, arrange training, and send updates you have asked for.",
  },
  {
    title: "4. Other Services",
    body: "Messages you send on WhatsApp are also handled under WhatsApp's own privacy policy. Links to Google Maps, Instagram and YouTube open those services, which have their own policies. This website is hosted by Vercel, which keeps standard technical records (such as IP address and browser type) to run and protect the website.",
  },
  {
    title: "5. Cookies",
    body: "We do not use advertising or tracking cookies, and we do not use analytics to follow you around the web. Your browser may save some website files so that pages load faster on your next visit.",
  },
  {
    title: "6. Sharing Your Information",
    body: "We never sell or rent your information. We share only what is needed to complete your order — for example, your address and phone number with the person delivering it — or when the law requires us to.",
  },
  {
    title: "7. How Long We Keep It",
    body: "We keep your details only as long as we need them to handle your orders and enquiries, and for our normal business records.",
  },
  {
    title: "8. Your Choices",
    body: "You can ask us at any time to show you, correct or delete the information we hold about you. If you joined our WhatsApp updates, just tell us and we will remove you from the list.",
  },
  {
    title: "9. Changes to This Policy",
    body: "If we change this policy, we will post the new version on this page with a new date at the top.",
  },
  {
    title: "10. Contact Us",
    body: "For any privacy question or request, WhatsApp us on +91 63806 87811, call +91 93855 26105, or email sriammanmushrooms@gmail.com. We are available Monday–Sunday, 6:00 AM – 8:00 PM.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: November 14, 2026"
        image="/gallery/farm/oyster-mushroom-growing.png"
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
