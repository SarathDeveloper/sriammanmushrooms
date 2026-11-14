import type { Metadata } from "next";
import Link from "next/link";

import { FadeIn } from "@/components/FadeIn";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/content";
import { queryProducts } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Our Mushrooms",
  description:
    "Fresh oyster and button mushrooms grown and hand-picked at Sri Amman Mushroom Farms in the Kalvarayan Hills. Enquire on WhatsApp for today's price.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  // The search dialog links here with ?q=; the two-product catalogue needs no
  // category filter, sorting or pagination.
  const rawQuery = searchParams?.q;
  const query = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  const { products } = queryProducts(getProducts(), { q: query, page: 1 });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Our Mushrooms"
        title="Fresh From Our Farm"
        description="Hand-picked mushrooms from our farm, delivered straight to your doorstep. Prices follow the daily harvest, so enquire on WhatsApp for today's price."
        image="https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2000&auto=format&fit=crop"
      />

      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {query && (
            <FadeIn className="mb-8 text-center text-base text-muted-foreground">
              Showing results for &ldquo;{query}&rdquo; &middot;{" "}
              <Link href="/products" className="text-primary font-semibold hover:underline">
                Show all
              </Link>
            </FadeIn>
          )}

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {products.map((product, i) => (
                  <FadeIn key={product.id} delay={i * 0.08} className="h-full">
                    <ProductCard product={product} priority />
                  </FadeIn>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No mushrooms match &ldquo;{query}&rdquo;.{" "}
              <Link href="/products" className="text-primary font-semibold hover:underline">
                See all our mushrooms
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
