import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAdminFlower } from "@/lib/adminCatalog";
import { requireAdmin } from "@/lib/adminSession";
import { FlowerForm } from "./FlowerForm";

export const metadata: Metadata = { title: "Цэцэг засах" };

export default function EditFlowerPage(props: PageProps<"/admin/flowers/[slug]">) {
  return (
    <>
      <Link
        href="/admin/flowers"
        className="mb-10 inline-block text-xs tracking-[0.2em] text-ivory/50 uppercase transition-colors hover:text-blush-100"
      >
        ← Бүх цэцэг
      </Link>
      <Suspense fallback={<div aria-hidden className="h-[40rem] animate-pulse bg-ivory/[0.03]" />}>
        <Editor params={props.params} />
      </Suspense>
    </>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/flowers/[slug]">["params"] }) {
  await requireAdmin();
  const { slug } = await params;
  const flower = await getAdminFlower(slug);
  if (!flower) notFound();
  return <FlowerForm flower={flower} />;
}
