import { ChevronRight, Truck, ShieldCheck, RotateCcw, Clock, Share2, Timer, Package, Quote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FadeIn } from "@/components/FadeIn";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { PincodeChecker } from "@/components/PincodeChecker";
import { ProductCard } from "@/components/ProductCard";
import { EnquireButton } from "@/components/ProductEnquiryDialog";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductShare } from "@/components/ProductShare";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  getReviewsForProduct,
} from "@/lib/content";
import { absoluteImageUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { packSizeLabel } from "@/lib/utils";

// Every product page is generated at build time; unknown slugs are a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  const image = absoluteImageUrl(product.image);
  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: image ? { url: image, alt: `${product.name} from ${SITE_NAME}` } : null,
  });
}

const nutritionData: Record<string, { calories: number; protein: string; fiber: string; vitD: string; iron: string }> = {
  Oyster: { calories: 33, protein: "3.3g", fiber: "2.3g", vitD: "Low", iron: "1.3mg" },
  Button: { calories: 22, protein: "3.1g", fiber: "1.0g", vitD: "Medium", iron: "0.5mg" },
};

const storageInstructions: Record<string, string> = {
  Oyster: "Store in a paper bag in the refrigerator. Best consumed within 3-4 days of delivery.",
  Button: "Store in a paper bag or open container in the fridge. Stays fresh for 5-7 days.",
};

const recipesByCategory: Record<string, { title: string; time: string; description: string }[]> = {
  Oyster: [
    { title: "Pepper Garlic Oyster Mushrooms", time: "20 min", description: "Toss with garlic, black pepper, curry leaves, and a little oil for a quick side dish." },
    { title: "Oyster Mushroom Stir-Fry", time: "15 min", description: "Cook with onions, capsicum, and soy or spices until lightly crisp at the edges." },
  ],
  Button: [
    { title: "Everyday Mushroom Masala", time: "25 min", description: "Sauté with onion, tomato, turmeric, and garam masala for an easy weeknight dish." },
    { title: "Creamy Mushroom Toast", time: "15 min", description: "Cook sliced mushrooms with garlic and herbs, then serve over toasted bread." },
  ],
};

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 3);
  const nutrition = nutritionData[product.category] || nutritionData.Oyster;
  const storage = storageInstructions[product.category] || storageInstructions.Oyster;
  const recipes = recipesByCategory[product.category] || recipesByCategory.Oyster;
  const reviews = getReviewsForProduct(product.slug);
  const hasReviews = reviews.length > 0;
  const shareText = `Check out ${product.name} from Sri Amman Mushroom Farm! ${absoluteUrl(`/products/${product.slug}`)}`;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Our Mushrooms", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* No Product JSON-LD on purpose: without a price or rating Google treats it as invalid (see lib/seo.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {/* Breadcrumb */}
      <div className="bg-secondary py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center gap-2 text-base text-muted-foreground min-w-0">
          <Link href="/" className="hover:text-primary shrink-0">Home</Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link href="/products" className="hover:text-primary shrink-0">Our Mushrooms</Link>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-foreground font-medium truncate min-w-0">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <FadeIn direction="right">
              <ProductGallery images={product.gallery} name={product.name} />
            </FadeIn>

            <FadeIn direction="left" className="flex flex-col">
              {product.tag && (
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-wide mb-4">
                  {product.tag}
                </span>
              )}
              <span className="text-base font-semibold text-primary uppercase tracking-wider mb-2">
                {product.category} Mushroom
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border text-sm font-semibold text-foreground">
                  <Package size={16} className="text-primary shrink-0" aria-hidden />
                  {packSizeLabel(product.weight)}
                </span>
                {product.shelfLifeDays != null && product.shelfLifeDays > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700">
                    <Timer size={16} className="text-amber-600 shrink-0" aria-hidden />
                    Best consumed within {product.shelfLifeDays} day{product.shelfLifeDays > 1 ? "s" : ""} of delivery
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-foreground leading-relaxed mb-6">{product.description}</p>

              {product.highlights.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-6">
                  {product.highlights.map((h) => (
                    <li
                      key={h}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/10"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              {/* Enquiry: prices follow the daily harvest, so they are given on WhatsApp. */}
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
                  Today&apos;s price on WhatsApp
                </h2>
                <p className="mt-1 mb-4 text-sm sm:text-base text-[var(--color-body)] leading-relaxed">
                  Our prices follow the daily harvest. Send a quick enquiry and we&apos;ll reply with
                  today&apos;s price, stock and delivery slot.
                </p>
                <EnquireButton
                  product={{ name: product.name, weight: product.weight }}
                  className="w-full rounded-lg h-11 bg-[#1A4938] hover:bg-[#14392c]"
                />
              </div>

              {/* Pincode Checker */}
              <div className="mt-6">
                <PincodeChecker />
              </div>

              {/* Share */}
              <div className="mt-4 flex items-center gap-3 text-base text-muted-foreground">
                <Share2 size={14} />
                <span>Share:</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-whatsapp hover:text-whatsapp-hover font-medium"
                >
                  <WhatsAppIcon className="size-3.5" />
                  WhatsApp
                </a>
                <span>·</span>
                <ProductShare productName={product.name} />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={22} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Free delivery over ₹500</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck size={22} className="text-primary" />
                  <span className="text-sm text-muted-foreground">FSSAI registered business</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw size={22} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Easy replacement</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Product information */}
      <section className="py-10 sm:py-14 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn className="h-full">
              <div className="bg-card rounded-2xl border border-border p-6 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-4">
                  Freshness Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <span className="text-muted-foreground">Harvested</span>
                    <span className="font-semibold text-right">
                      Fresh farm harvest
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <span className="text-muted-foreground">Best before</span>
                    <span className="font-semibold text-right">
                      See pack label
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Pack size</span>
                    <span className="font-semibold">{product.weight}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn className="h-full">
              <div className="bg-card rounded-2xl border border-border p-6 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Nutrition Facts (per 100g)
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Calories", value: `${nutrition.calories} kcal` },
                    { label: "Protein", value: nutrition.protein },
                    { label: "Fiber", value: nutrition.fiber },
                    { label: "Vitamin D", value: nutrition.vitD },
                    { label: "Iron", value: nutrition.iron },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="h-full">
              <div className="bg-card rounded-2xl border border-border p-6 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" /> Storage Instructions
                </h3>
                <p className="text-sm text-foreground leading-relaxed mb-4">{storage}</p>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <h4 className="text-sm font-bold text-primary mb-2">Pro Tips:</h4>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    <li>• Never wash mushrooms before storing — moisture causes spoilage</li>
                    <li>• Use a paper bag, not plastic, to allow airflow</li>
                    <li>• Bring to room temperature before cooking for best texture</li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Customer testimonials: shown only when this product has written feedback. */}
      {hasReviews && (
        <section className="py-10 sm:py-14 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <FadeIn>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-px w-6 sm:w-8 bg-border" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">From our customers</span>
                  <span className="h-px w-6 sm:w-8 bg-border" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading tracking-tight">What customers say</h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <FadeIn key={review.id} className="h-full">
                  <article className="h-full rounded-2xl border border-border bg-card p-5">
                    <Quote size={20} className="mb-3 text-primary/40" aria-hidden />
                    <blockquote className="text-base leading-relaxed text-[var(--color-body)]">
                      {review.comment}
                    </blockquote>
                    <p className="mt-4 text-sm font-semibold text-muted-foreground">
                      {review.name}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recipe ideas */}
      <section className={`py-10 sm:py-14 ${hasReviews ? "bg-secondary" : "bg-background"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeIn>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-6 sm:w-8 bg-border" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Cook something good</span>
              <span className="h-px w-6 sm:w-8 bg-border" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading tracking-tight mb-8">
              Recipe ideas for {product.name}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <FadeIn key={recipe.title}>
                <article className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-foreground font-heading">{recipe.title}</h3>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                      {recipe.time}
                    </span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{recipe.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className={`py-10 sm:py-14 ${hasReviews ? "bg-background" : "bg-secondary"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-px w-6 sm:w-8 bg-border" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">More Options</span>
                <span className="h-px w-6 sm:w-8 bg-border" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-10 font-heading tracking-tight text-center">You Might Also Like</h2>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {related.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.08} className="h-full">
                  <ProductCard product={p} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
