import { Clock, MessageSquareText, Package } from "lucide-react";
import Link from "next/link";

import { EnquireButton } from "@/components/ProductEnquiryDialog";
import { SafeImage } from "@/components/SafeImage";
import type { Product } from "@/lib/content";
import { packSizeLabel } from "@/lib/utils";

/**
 * Catalogue card: image, name, pack size, a couple of highlights and an
 * enquiry button. A Server Component, so only the product name and pack size
 * (what the enquiry needs) are sent to the browser for the button.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const href = `/products/${product.slug}`;
  const highlights = product.highlights.filter(Boolean).slice(0, 2);
  const shelfLife =
    product.shelfLifeDays != null && product.shelfLifeDays > 0 ? product.shelfLifeDays : null;

  return (
    <article className="group flex h-full flex-col bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <div className="relative aspect-square sm:aspect-[3/2] overflow-hidden bg-secondary">
        <Link href={href} tabIndex={-1} aria-hidden className="relative block h-full w-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {product.tag && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-accent text-white text-xs sm:text-sm font-semibold shadow-sm">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
          {product.category}
        </span>

        <Link href={href} className="min-w-0">
          <h3 className="font-bold text-base sm:text-lg leading-snug text-foreground line-clamp-2 font-heading hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Package size={14} className="shrink-0 text-primary/70" aria-hidden />
            {packSizeLabel(product.weight)}
          </span>
          {shelfLife && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-amber-700">
              <Clock size={13} className="shrink-0" aria-hidden />
              Best within {shelfLife} day{shelfLife > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <p className="hidden sm:block text-base text-muted-foreground leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {highlights.length > 0 && (
          <ul className="hidden sm:flex flex-wrap gap-1.5">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary border border-primary/10"
              >
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-1 sm:pt-2">
          <EnquireButton
            product={{ name: product.name, weight: product.weight }}
            size="sm"
            className="w-full h-9 sm:h-10 rounded-full bg-primary hover:bg-primary/90 text-white text-sm sm:text-base font-semibold gap-1.5 px-3"
          >
            <MessageSquareText size={15} aria-hidden />
            <span className="sm:hidden">Enquire</span>
            <span className="hidden sm:inline">Enquire for today&apos;s price</span>
          </EnquireButton>
        </div>
      </div>
    </article>
  );
}
