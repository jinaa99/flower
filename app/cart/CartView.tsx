"use client";

import Link from "next/link";
import { CartLineRow } from "@/components/ui/CartLineRow";
import { CartSummary } from "@/components/ui/CartSummary";
import type { CartFlower } from "@/lib/cart";
import { useCartView } from "@/lib/useCartView";

export function CartView({ catalog }: { catalog: CartFlower[] }) {
  const { ready, lines, totals, setLineQuantity, removeLine } = useCartView(catalog);

  if (!ready) return <div aria-hidden className="h-72 animate-pulse bg-ivory/[0.03]" />;

  if (lines.length === 0) {
    return (
      <div className="max-w-xl space-y-8">
        <p className="text-lg text-ivory/60">Сагс хоосон байна. Улирлын шинэхэн цэцэг эсвэл өөрийн баглаагаа бүрдүүлээрэй.</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/catalog"
            className="btn-primary"
          >
            Каталог үзэх
          </Link>
          <Link
            href="/bouquet-builder"
            className="border border-ivory/20 px-8 py-4 text-xs tracking-[0.2em] text-ivory/80 uppercase transition-colors hover:border-blush-100 hover:text-blush-100"
          >
            Баглаа бүрдүүлэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
      <section aria-label="Сагсан дахь бараа">
        <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
          {lines.map((line) => (
            <CartLineRow
              key={line.key}
              line={line}
              onQuantity={(q) => setLineQuantity(line, q)}
              onRemove={() => removeLine(line)}
            />
          ))}
        </ul>
        <Link
          href="/catalog"
          className="mt-8 inline-block text-xs tracking-[0.2em] text-ivory/60 uppercase underline-offset-4 transition-colors hover:text-blush-100 hover:underline"
        >
          ← Үргэлжлүүлэн сонгох
        </Link>
      </section>

      <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <div className="border border-ivory/10 bg-plum-800/20 p-6 sm:p-8">
          <p className="mb-6 text-xs tracking-[0.16em] text-gold-soft uppercase">Захиалгын дүн</p>
          <CartSummary totals={totals} />
          <Link
            href="/checkout"
            className="mt-8 flex w-full btn-primary"
          >
            Захиалах
          </Link>
          <p className="mt-4 text-xs leading-relaxed text-ivory/45">
            Улаанбаатар хотод захиалснаас хойш 3 цагийн дотор хүргэнэ. Хүргэх өдөр, цагаа дараагийн алхамд сонгоно.
          </p>
        </div>
      </aside>
    </div>
  );
}
