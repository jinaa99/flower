import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminFlowers } from "@/lib/adminCatalog";
import { requireAdmin } from "@/lib/adminSession";
import { InventoryRow } from "./InventoryRow";

export const metadata: Metadata = { title: "Цэцэг, нөөц" };

export default function FlowersAdminPage() {
  return (
    <>
      <p className="mb-8 max-w-2xl text-sm text-ivory/55">
        Нөөц нь иш тоогоор — энгийн баглаа ч, өөрийн баглаа ч эндээс хасна. Нэр, тайлбар, хэмжээ бүрийн иш тоог
        цэцгийн нэр дээр дарж засна. Хадгалмагц сайтад шууд харагдана.
      </p>
      <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-ivory/[0.03]" />}>
        <FlowerList />
      </Suspense>
    </>
  );
}

async function FlowerList() {
  await requireAdmin();
  const flowers = await getAdminFlowers();
  return (
    <ul className="space-y-3">
      {flowers.map((f) => (
        <InventoryRow key={f.slug} flower={f} />
      ))}
    </ul>
  );
}
