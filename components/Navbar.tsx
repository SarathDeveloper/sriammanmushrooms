"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { SearchItem } from "@/lib/content";
import { cn } from "@/lib/utils";

const SearchDialog = dynamic(
  () => import("@/components/SearchDialog").then((m) => ({ default: m.SearchDialog })),
  { ssr: false, loading: () => <Search size={20} className="text-muted-foreground" /> },
);

const MobileSheet = dynamic(
  () => import("@/components/NavbarMobileSheet"),
  { ssr: false },
);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Our Mushrooms" },
  { href: "/pre-order", label: "Pre Order" },
  { href: "/training", label: "Training" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ searchItems }: { searchItems: SearchItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 min-w-0 group">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/gallery/brand-logo.png"
                alt="Sri Amman Mushroom Farms"
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <span className="leading-none min-w-0 flex flex-col justify-center">
              <span className="block font-display text-[17px] sm:text-[21px] font-extrabold tracking-[0.01em] text-primary transition-colors duration-300 group-hover:text-primary/90">
                Sri Amman
              </span>
              <span className="block font-sans text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-primary/90 mt-1">
                Mushroom Farms
              </span>
              <svg className="w-7 h-1.5 text-primary/40 mt-1 transition-all duration-300 group-hover:w-11 group-hover:text-primary" viewBox="0 0 32 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4.5C8 2 24 1.5 31 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SearchDialog items={searchItems} />

            <div className="hidden md:flex">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-medium">
                <Link href="/contact">Enquire Now</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileSheet />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
