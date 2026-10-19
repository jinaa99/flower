import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { getCartCatalog } from "@/lib/data";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Сагс" };

export default async function CartPage() {
  return (
    <PageShell eyebrow="Сагс" title="Таны сагс">
      <CartView catalog={await getCartCatalog()} />
    </PageShell>
  );
}
