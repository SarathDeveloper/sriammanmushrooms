import Footer from "@/components/Footer";
import { HeaderTopBar } from "@/components/HeaderTopBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { getSearchItems } from "@/lib/content";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderTopBar />
      <Navbar searchItems={getSearchItems()} />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <MobileBottomNav />
    </>
  );
}
