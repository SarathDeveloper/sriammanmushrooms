"use client";

import { Mail, Menu, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM } from "@/lib/site";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Our Mushrooms" },
  { href: "/pre-order", label: "Pre Order" },
  { href: "/training", label: "Training" },
  { href: "/contact", label: "Contact" },
];

export default function NavbarMobileSheet() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger aria-label="Open menu" className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary">
        <Menu size={24} />
      </SheetTrigger>
      <SheetContent className="p-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-left flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
              <Image src="/gallery/brand-logo.png" alt="Logo" fill sizes="40px" className="object-cover" />
            </div>
            <span className="leading-none flex flex-col justify-center">
              <span className="block font-display text-xl font-extrabold tracking-[0.01em] text-primary">
                Sri Amman
              </span>
              <span className="block font-sans text-[10px] font-semibold tracking-[0.22em] uppercase text-primary/70 mt-0.5">
                Mushroom Farm
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col py-4">
          <div className="px-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary hover:text-primary"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mx-6 my-4 border-t border-border" />
          <div className="px-4 space-y-1">
            <p className="px-4 mb-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Get in Touch
            </p>
            <div className="px-4 pt-1 space-y-2">
              <Button asChild className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-white">
                <Link href="/contact">Enquire Now</Link>
              </Button>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full h-11 bg-whatsapp text-white font-medium hover:bg-whatsapp-hover transition-colors"
              >
                <WhatsAppIcon className="size-4" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="px-4 pt-4 space-y-1 text-base">
              <a
                href={`tel:${CONTACT_PHONE.e164}`}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-foreground hover:bg-secondary transition-colors"
              >
                <Phone size={17} className="text-primary shrink-0" />
                {CONTACT_PHONE.display}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-foreground hover:bg-secondary transition-colors"
              >
                <Mail size={17} className="text-primary shrink-0" />
                {/* wrap only at the "@" on narrow screens */}
                <span className="min-w-0">
                  {CONTACT_EMAIL.split("@")[0]}
                  <wbr />@{CONTACT_EMAIL.split("@")[1]}
                </span>
              </a>
              <a
                href={INSTAGRAM.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-foreground hover:bg-secondary transition-colors"
              >
                <InstagramIcon className="size-[17px] text-[#E4405F] shrink-0" />
                @{INSTAGRAM.handle}
              </a>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
