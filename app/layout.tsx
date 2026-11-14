import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Providers from "@/components/Providers";
import { getProducts } from "@/lib/content";
import { localBusinessJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/seo";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

// Site-wide defaults. Every page sets its own canonical, Open Graph and
// Twitter metadata through pageMetadata() (lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | Fresh Oyster & Button Mushrooms`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Sri Amman Mushroom Farm",
    "oyster mushroom",
    "button mushroom",
    "fresh mushrooms",
    "mushroom farm Kallakurichi",
    "Kalvarayan Hills mushrooms",
    "mushroom farming training Tamil Nadu",
    "mushroom delivery Salem",
  ],
  category: "agriculture",
  formatDetection: { telephone: true, email: true, address: true },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE.path,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.path] },
};

const siteJsonLd = [localBusinessJsonLd(getProducts()), websiteJsonLd()];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${effra.variable} ${playfair.variable} h-full antialiased`}
      style={{ ["--font-heading" as string]: "var(--font-sans)" }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(siteJsonLd),
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
