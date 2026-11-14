"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Phone, Mail } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { FadeIn } from "@/components/FadeIn";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { whatsappLink } from "@/lib/whatsapp";

const PHONE = "+91 93855 26105";
const ADDITIONAL_PHONES = ["+91 89031 56142", "+91 63833 61207"];
const EMAIL = "hello@vellimalaifarms.in";
const ADDRESS_LINE = "Sari Amman Oyster Mushroom Farm, Vellimalai, Melsathanur, Kallakurichi - 606 209, Tamil Nadu, India";
const LAT = 11.786746298281923;
const LNG = 78.71029442669108;
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${LAT},${LNG}&z=14&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;

export function HomeContactSection() {
  return (
    <section className="py-10 sm:py-14 bg-secondary grain-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section header */}
        <FadeIn className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-6 sm:w-8 bg-border" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Talk to Us
            </span>
            <span className="h-px w-6 sm:w-8 bg-border" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Contact Us
          </h2>
          <p className="text-[var(--color-body)] max-w-lg mx-auto mt-3 text-base sm:text-lg leading-relaxed">
            Have questions about mushrooms, training, or visiting our farm? Write to us and we will reply.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Left column — reach us + address */}
          <FadeIn direction="right" className="space-y-6">
            {/* Reach us directly */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h3 className="text-xl font-bold font-heading text-foreground mb-1">
                  Call or Message Us
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  Want to talk now? Pick how you want to reach us.
                </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-base font-semibold text-white hover:bg-whatsapp-hover transition-colors"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Phone size={15} />
                  {PHONE}
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Mail size={15} />
                  {EMAIL}
                </a>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-base text-muted-foreground">
                {ADDITIONAL_PHONES.map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-foreground transition-colors">
                    {phone}
                  </a>
                ))}
              </div>

                <p className="text-sm text-muted-foreground mt-4">
                  We usually reply within 24 hours
                </p>
            </div>

            {/* Visit us + map */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold font-heading text-foreground">
                    Come Visit Us
                  </h3>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
                  >
                    See on Google Maps
                    <ExternalLink size={14} />
                  </a>
              </div>

              <div className="flex items-start gap-2.5 mb-5">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base text-foreground">
                    Sari Amman Oyster Mushroom Farm
                  </p>
                  <p className="text-base text-muted-foreground">
                    {ADDRESS_LINE.replace("Sari Amman Oyster Mushroom Farm, ", "")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border h-48 sm:h-56">
                <iframe
                  title="Sri Amman Mushroom Farms location"
                  src={MAPS_EMBED_URL}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mt-4"
              >
                See All Contact Info
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          {/* Right column: form that hands the message to WhatsApp */}
          <FadeIn direction="left">
            <ContactForm showEmail showMessage idPrefix="home" />
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
