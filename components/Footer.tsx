import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { CONTACT_EMAIL, INSTAGRAM, OPENING_HOURS } from "@/lib/site";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Our Mushrooms" },
  { href: "/training", label: "Training" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const productLinks = [
  { href: "/products", label: "Fresh Mushrooms" },
  { href: "/pre-order", label: "Pre-Order" },
  { href: "/training", label: "Farm Training" },
];

const supportLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const phoneNumbers = [
  { value: "+91 93855 26105", href: "tel:+919385526105" },
  { value: "+91 89031 56142", href: "tel:+918903156142" },
  { value: "+91 63833 61207", href: "tel:+916383361207" },
];

const contactItems = [
  {
    icon: Mail,
    label: "Email Us",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MapPin,
    label: "Our Location",
    value: "Sri Amman Mushroom Farm\nVellimalai, Melsathanur\nKallakurichi – 606 209, Tamil Nadu",
  },
  {
    icon: Clock,
    label: "Open Hours",
    value: OPENING_HOURS,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-16 sm:pt-20 pb-20 md:pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-12 lg:gap-8 xl:gap-12 justify-between">
          {/* Brand */}
          <div className="space-y-5 w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:max-w-[300px]">
            <Link href="/" className="inline-flex flex-col gap-3 group">
              <div className="relative h-20 w-20 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/gallery/brand-logo.png"
                  alt="Sri Amman Mushroom Farm"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="leading-none flex flex-col">
                <span className="block font-display text-2xl sm:text-3xl font-extrabold tracking-[0.01em] text-white transition-colors duration-300 group-hover:text-white/90">
                  Sri Amman
                </span>
                <span className="block font-sans text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-white/60 mt-1.5">
                  Mushroom Farm
                </span>
                <svg className="w-8 h-2 text-white/30 mt-2 transition-all duration-300 group-hover:w-12 group-hover:text-[#2B7A5D]" viewBox="0 0 32 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5C8 2 24 1.5 31 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
            </Link>
            <p className="text-base leading-relaxed text-white/75">
              Fresh mushrooms from Kalvarayan Hills, Vellimalai. Get fresh
              mushrooms, book early, or learn farming with us.
            </p>
            <p className="text-sm text-white/45">
              Grown with care — Fresh and healthy
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-base font-medium text-black transition-opacity hover:opacity-90"
            >
              Contact Us
            </Link>
          </div>

          {/* Navigation */}
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto shrink-0">
            <h3 className="mb-5 text-base font-semibold tracking-[0.18em] uppercase text-white/45">
              Navigation
            </h3>
            <ul className="space-y-3.5">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base text-white/90 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto shrink-0">
            <h3 className="mb-5 text-base font-semibold tracking-[0.18em] uppercase text-white/45">
              Products
            </h3>
            <ul className="space-y-3.5">
              {productLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-base text-white/90 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto shrink-0">
            <h3 className="mb-5 text-base font-semibold tracking-[0.18em] uppercase text-white/45">
              Support
            </h3>
            <ul className="space-y-3.5">
              {supportLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-base text-white/90 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:max-w-[340px]">
            <h3 className="mb-5 text-base font-semibold tracking-[0.18em] uppercase text-white/45">
              Get in Touch
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
                  <Phone size={15} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs font-semibold tracking-[0.16em] uppercase text-white/40">
                    Call Us
                  </p>
                  <div className="flex flex-wrap items-center gap-x-1.5 text-base leading-relaxed text-white/90">
                    {phoneNumbers.map((phone, i) => (
                      <span key={phone.href} className="inline-flex items-center gap-x-1.5">
                        {i > 0 && <span className="text-white/35 select-none" aria-hidden>/</span>}
                        <a
                          href={phone.href}
                          className="transition-colors hover:text-white"
                        >
                          {phone.value}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              </li>
              {contactItems.map((item) => {
                const Icon = item.icon;
                const value = (
                  <span className="whitespace-pre-line text-base leading-relaxed text-white/90">
                    {item.value}
                  </span>
                );
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="mb-0.5 text-xs font-semibold tracking-[0.16em] uppercase text-white/40">
                        {item.label}
                      </p>
                      {"href" in item && item.href ? (
                        <a
                          href={item.href}
                          className="transition-colors hover:text-white"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <a
              href="https://wa.me/916380687811"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-whatsapp hover:border-transparent hover:text-white"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="size-4" />
              </a>
              <a
                href={INSTAGRAM.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-[#E4405F] hover:border-transparent hover:text-white"
                aria-label={`Instagram @${INSTAGRAM.handle}`}
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://youtube.com/@vellimalaifarms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-[#FF0000] hover:border-transparent hover:text-white"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex items-center justify-center text-sm text-white/45">
          <p className="text-center">
            &copy; {new Date().getFullYear()} Sri Amman Mushroom Farm. All rights
            reserved. FSSAI Lic: 22424356000315
          </p>
        </div>
      </div>
    </footer>
  );
}
