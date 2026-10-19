import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { getFlowers } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Каталог" };

export default function CatalogPage() {
  const flowers = getFlowers();
  return (
    <PageShell eyebrow="Каталог" title="Манай цэцэгс" subtitle="Улирлын шилдэг цэцэгсээс сонгоорой.">
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {flowers.map((f) => (
          <li key={f.slug}>
            <Link
              href={`/flowers/${f.slug}`}
              className="group block border border-ivory/10 p-8 transition-colors duration-500 hover:border-gold-soft/40"
            >
              <h2 className="font-display text-3xl">{f.name.mn}</h2>
              <p className="mt-1 text-sm tracking-widest text-ivory/50 uppercase">{f.name.en}</p>
              <p className="mt-6 text-gold-soft">{formatPrice(f.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
