import Link from "next/link";
import type { CatalogItem } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { FeaturedItem } from "./FeaturedItem";
import { RevealGroup } from "./Motion";

/**
 * «Онцлох цуглуулга»: бутик дэлгүүрийн цонх мэт асимметр сүлжээ. Эхний баглаа том (2.5D
 * зурагтай), бусад нь өөр өөр өндөр, хэмнэлтэй — ижил дугуй карт биш. Нэр, үнэ намуухан,
 * «Сагсанд» нь зураг дээр hover хийхэд л тодорно (touch-д үргэлж харагдана).
 */
export function FeaturedCollection({ items }: { items: (CatalogItem & { depth: string | null })[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <RevealGroup id="collection" label="Онцлох цуглуулга" className="relative scroll-mt-(--header-height) border-t border-ivory/[0.06] py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-x-8 gap-y-16 lg:grid-cols-12">
          <header className="reveal lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
            <p className="eyebrow">Цуглуулга</p>
            <h2 className="mt-8 font-display text-5xl leading-[1.02] font-extralight text-balance sm:text-6xl">
              Энэ улирлын <em className="font-light text-blush-100">дуртай</em> баглаанууд
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-ivory/60">
              Өглөө бүр шинээр ирсэн цэцгээс гараар сонгож, таны цагт хүргэнэ.
            </p>
            <Link href="/catalog" className="link-line mt-8 inline-flex items-center gap-3 text-sm text-ivory">
              Бүх цэцэг <span aria-hidden>→</span>
            </Link>
          </header>

          <FeaturedItem
            item={lead}
            index={0}
            aspect="4/5"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="lg:col-span-7 lg:row-span-2 lg:row-start-1"
            lead
          />

          {rest.map((item, i) => (
            <FeaturedItem
              key={item.slug}
              item={item}
              index={i + 1}
              aspect={LAYOUT[i]?.aspect ?? "4/5"}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
              className={cn(LAYOUT[i]?.className)}
            />
          ))}
        </div>
      </div>
    </RevealGroup>
  );
}

/** Lead-ийн дараах баглаануудын байрлал — тэгш бус хэмнэл (12 баганат сүлжээ) */
const LAYOUT = [
  { aspect: "1/1", className: "lg:col-span-4 lg:col-start-9 lg:row-start-2" },
  { aspect: "3/4", className: "lg:col-span-4 lg:col-start-1 lg:mt-24" },
  { aspect: "4/5", className: "lg:col-span-4 lg:col-start-5" },
  { aspect: "3/4", className: "lg:col-span-3 lg:col-start-10 lg:mt-40" },
] as const;
