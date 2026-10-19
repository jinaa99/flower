import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/ui/Header";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

// Fraunces кирилл дэмждэггүй тул display-д Cormorant Garamond.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">
        <SmoothScroll />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
