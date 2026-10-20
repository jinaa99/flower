import type { Metadata } from "next";
import { Manrope, Noto_Serif_Display } from "next/font/google";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { brand } from "@/lib/brand";
import { toCatalogItem } from "@/lib/catalog";
import { getCartCatalog, getCoverImage, getFlowers } from "@/lib/data";
import "./globals.css";

// Display: өндөр контрасттай Didone маягийн serif — кирилл дэмждэг (Fraunces, Bodoni Moda дэмждэггүй).
const serifDisplay = Noto_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin", "cyrillic"],
  // Том гарчиг 200–300 (+ italic онцлол), лого/үнэ 400 — бусад жин татагдахгүй
  weight: ["200", "300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Тансаг цэцгийн ателье`,
    template: `%s · ${brand.name}`,
  },
  description: brand.tagline,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${serifDisplay.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">
        <SmoothScroll />
        <Header items={(await getFlowers()).map((f) => toCatalogItem(f, getCoverImage(f)))} />
        <main>{children}</main>
        <Footer />
        <CartDrawer catalog={await getCartCatalog()} />
      </body>
    </html>
  );
}
