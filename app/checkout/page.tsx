import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = { title: "Захиалга" };

export default function CheckoutPage() {
  return (
    <PageShell eyebrow="Захиалга" title="Захиалга баталгаажуулах" subtitle="Хүргэлтийн мэдээллээ оруулна уу." />
  );
}
