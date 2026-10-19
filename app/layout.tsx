import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { Header } from "@/components/ui/Header";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { getCartCatalog } from "@/lib/data";
import "./globals.css";

// Fraunces кирилл дэмждэггүй тул display-д Cormorant Garamond.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  // Гарчиг 300 (+ italic онцлол), лого/үнэ 400 — бусад жин татагдахгүй
  weight: ["300", "400"],
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
    default: "Flower — Тансаг цэцгийн дэлгүүр",
    template: "%s · Flower",
  },
  description: "Гараар сонгосон тансаг цэцэг, баглаа.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <CartDrawer catalog={await getCartCatalog()} />
      </body>
    </html>
  );
}
