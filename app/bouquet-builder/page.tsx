import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = { title: "Баглаа бүрдүүлэх" };

export default function BouquetBuilderPage() {
  return (
    <PageShell
      eyebrow="Баглаа бүрдүүлэх"
      title="Өөрийн баглаа"
      subtitle="Цэцэг, өнгө, боодлоо сонгож өвөрмөц баглаа бүтээгээрэй."
    />
  );
}
