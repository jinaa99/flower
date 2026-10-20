import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { toCatalogItem, type CatalogItem } from "@/lib/catalog";
import { getCoverImage, getFlowers } from "@/lib/data";
import { CatalogBrowser, CatalogSkeleton } from "./CatalogBrowser";
import { CategoryShowcase } from "./CategoryShowcase";

export const metadata: Metadata = { title: "Дэлгүүр" };

export default async function CatalogPage() {
  const items = (await getFlowers()).map((f) => toCatalogItem(f, getCoverImage(f)));
  return (
    <PageShell
      eyebrow="Дэлгүүр"
      title="Цэцгийн дэлгүүр"
      subtitle={`Өглөө бүр шинээр ирсэн ${items.length} төрлийн цэцэг — Улаанбаатарт өдөрт нь хүргэнэ.`}
    >
      {/* Шүүлтүүр URL-аас уншдаг тул request бүрт stream-лэгдэнэ; бүрхүүл нь статик */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults items={items} />
      </Suspense>
    </PageShell>
  );
}

/**
 * Request хүртэл хүлээснээр `useSearchParams` серверт утгатай болж, хуваалцсан холбоос
 * (?q=…&color=…) шүүгдсэн үр дүнгээрээ HTML-д ирнэ — skeleton-оос client render хүлээхгүй.
 */
async function CatalogResults({ items }: { items: CatalogItem[] }) {
  await connection();
  return (
    <>
      <CategoryShowcase items={items} atelier={items.find((i) => i.slug === "spray-rose") ?? null} />
      <section id="results" aria-label="Бүх цэцэг" className="scroll-mt-[calc(var(--header-height)+2rem)]">
        <h2 className="mb-10 font-display text-4xl font-extralight sm:text-5xl">
          Бүх <em className="font-light text-blush-100">цэцэг</em>
        </h2>
        <CatalogBrowser items={items} />
      </section>
    </>
  );
}
