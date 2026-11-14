import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { getProducts } from "@/lib/content";

import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  // Personal, browser-only list: nothing for search engines here.
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        eyebrow="Wishlist"
        title="Your Saved Favorites"
        image="https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?q=80&w=2000&auto=format&fit=crop"
      />

      <section className="py-10 sm:py-14 bg-background">
        <WishlistClient products={getProducts()} />
      </section>
    </div>
  );
}
