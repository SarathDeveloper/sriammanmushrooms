import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ShopControls } from "@/components/ShopControls";
import { getCategories, getProducts } from "@/lib/content";
import { queryProducts } from "@/lib/shop";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop Fresh Mushrooms",
  description:
    "Browse fresh oyster, milky, button and shiitake mushrooms and ready-made mushroom products from Sri Amman Mushroom Farms. Enquire on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const single = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const activeCategorySlug = single(searchParams?.category);
  const sort = single(searchParams?.sort);
  const query = single(searchParams?.q);

  const categories = getCategories();
  const { products, totalCount, totalPages, page } = queryProducts(getProducts(), {
    category: activeCategorySlug,
    q: query,
    sort,
    page: Number(single(searchParams?.page)) || 1,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Shop"
        title="Fresh From Our Farm"
        description="Hand-picked mushrooms from our farm, delivered straight to your doorstep."
        image="https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2000&auto=format&fit=crop"
      />

      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeIn className="mb-8 -mx-4 sm:mx-0">
            <div className="flex sm:flex-wrap sm:justify-center gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-2 sm:pb-0">
              <Link
                href="/shop"
                className={cn(
                  "px-5 py-2.5 rounded-full text-base font-semibold transition-colors border whitespace-nowrap shrink-0",
                  !activeCategorySlug || activeCategorySlug === "all"
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-base font-semibold transition-colors border whitespace-nowrap shrink-0",
                    activeCategorySlug === category.slug
                      ? "bg-primary text-white border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </FadeIn>

          <Suspense>
            <ShopControls />
          </Suspense>

          <FadeIn className="mb-8 text-center text-base text-muted-foreground">
            Showing {products.length} of {totalCount} product{totalCount !== 1 && "s"}
            {query && (
              <span>
                {" "}
                for &ldquo;{query}&rdquo;
              </span>
            )}
          </FadeIn>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {products.map((product, i) => (
                  <FadeIn key={product.id} delay={(i % 3) * 0.08}>
                    <ProductCard product={product} priority={i < 3} />
                  </FadeIn>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination currentPage={page} totalPages={totalPages} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              {query
                ? `No products found for "${query}".`
                : "No products found in this category."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
