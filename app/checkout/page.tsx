import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { getCartCatalog, getDeliverySlots } from "@/lib/data";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Захиалга", robots: { index: false } };

export default async function CheckoutPage() {
  return (
    <PageShell eyebrow="Захиалга" title="Захиалга баталгаажуулах" subtitle="Хүргэлтийн мэдээллээ оруулна уу.">
      <CheckoutForm catalog={await getCartCatalog()} slots={await getDeliverySlots()} />
    </PageShell>
  );
}
