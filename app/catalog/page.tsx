import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { toCatalogItem, type CatalogItem } from "@/lib/catalog";
import { getCoverImage, getFlowers } from "@/lib/data";
import { CatalogBrowser, CatalogSkeleton } from "./CatalogBrowser";

export const metadata: Metadata = { title: "Каталог" };

export default async function CatalogPage() {
  const items = (await getFlowers()).map((f) => toCatalogItem(f, getCoverImage(f)));
  return (
    <PageShell eyebrow="Каталог" title="Манай цэцэгс" subtitle="Улирлын шилдэг цэцэгсээс сонгоорой.">
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
  return <CatalogBrowser items={items} />;
}
