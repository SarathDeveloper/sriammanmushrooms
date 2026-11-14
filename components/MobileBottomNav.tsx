"use client";

import { CalendarClock, Home, MessageSquareText, Sprout } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/products", icon: Sprout, label: "Mushrooms" },
  { href: "/pre-order", icon: CalendarClock, label: "Pre-Order" },
  { href: "/contact", icon: MessageSquareText, label: "Enquire" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-sm font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
