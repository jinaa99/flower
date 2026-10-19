import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = { title: "Сагс" };

export default function CartPage() {
  return <PageShell eyebrow="Сагс" title="Таны сагс" subtitle="Сагс хоосон байна." />;
}
