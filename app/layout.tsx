import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Providers from "@/components/Providers";
import { serializeJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const effra = localFont({
  src: [
    {
      path: "./fonts/effra/EffraVF_Trial_Wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/effra/EffraVF_Trial_WghtItal.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sri Amman Mushroom Farms | Fresh Farm Mushrooms",
    template: "%s | Sri Amman Mushroom Farms",
  },
  description: "Fresh mushrooms from the Kalvarayan Hills with delivery, pre-orders, and mushroom farming training.",
  alternates: { canonical: "/" },
  keywords: ["fresh mushrooms delivery", "mushroom farming training", "mushroom pre-order", "oyster mushroom", "milky mushroom", "Salem", "Tamil Nadu"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: "Sri Amman Mushroom Farms | Fresh Farm Mushrooms",
    description: "Fresh mushrooms from the Kalvarayan Hills with delivery, pre-orders, and farming training.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${effra.variable} ${playfair.variable} h-full antialiased`}
      style={{ ["--font-heading" as string]: "var(--font-sans)" }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Sri Amman Mushroom Farms",
              description: "Fresh mushrooms grown and packed in the Kalvarayan Hills, Tamil Nadu",
              url: SITE_URL,
              telephone: "+919385526105",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Vellimalai, Melsathanur",
                addressLocality: "Kallakurichi",
                addressRegion: "Tamil Nadu",
                postalCode: "606209",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "11.7480",
                longitude: "78.5580",
              },
              openingHours: "Mo-Sa 08:00-18:00",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden w-full">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
