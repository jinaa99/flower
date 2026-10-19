import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { toBuilderFlower } from "@/lib/bouquet";
import { getCoverImage, getFlowers } from "@/lib/data";
import { BouquetBuilder } from "./BouquetBuilder";

export const metadata: Metadata = { title: "Баглаа бүрдүүлэх" };

export default async function BouquetBuilderPage(props: PageProps<"/bouquet-builder">) {
  const flowers = (await getFlowers())
    .map((f) => {
      const cover = getCoverImage(f);
      return toBuilderFlower(f, cover ? { src: cover.src, color: cover.color } : null);
    })
    // Түгээмэл нь эхэнд
    .sort((a, b) => b.popularity - a.popularity);

  return (
    <PageShell
      eyebrow="Баглаа бүрдүүлэх"
      title="Өөрийн баглаа"
      subtitle="Цэцэг, ногоон навч, боодлоо сонгож өвөрмөц баглаа бүтээгээрэй."
    >
      <Suspense fallback={<BouquetBuilder flowers={flowers} />}>
        <WithInitialFlower flowers={flowers} searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}

/** `?flower=peony` (дэлгэрэнгүй хуудасны «Өөрийн баглаа бүрдүүлэх») — тэр цэцэгтэйгээр эхэлнэ */
async function WithInitialFlower({
  flowers,
  searchParams,
}: {
  flowers: Parameters<typeof BouquetBuilder>[0]["flowers"];
  searchParams: PageProps<"/bouquet-builder">["searchParams"];
}) {
  const { flower } = await searchParams;
  return <BouquetBuilder flowers={flowers} initialSlug={typeof flower === "string" ? flower : undefined} />;
}
