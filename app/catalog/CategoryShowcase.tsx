"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { hasAnyFilter, parseFilters, type CatalogItem } from "@/lib/catalog";
import { buildStoreNav, type NavCategory } from "@/lib/storeNav";
import { useHydrated } from "@/lib/useHydrated";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Төрөл бүрийн хавтан (desktop): харьцаа, өргөн нь ялгаатай — ижил хайрцаг давтагдахгүй, тэгш бус
 * хэмнэл. Mobile-ийн хэвтээ мөрөнд бүгд 3:4 (өндөр нь тэнцүү).
 */
const SPECIES_LAYOUT = [
  { col: "lg:col-span-5", aspect: "lg:aspect-[4/5]" },
  { col: "lg:col-span-4 lg:mt-24", aspect: "lg:aspect-[3/4]" },
  { col: "lg:col-span-3", aspect: "lg:aspect-[2/3]" },
  { col: "lg:col-span-3", aspect: "lg:aspect-[3/4]" },
  { col: "lg:col-span-4", aspect: "lg:aspect-[4/3]" },
  { col: "lg:col-span-5", aspect: "lg:aspect-[5/4]" },
];

/**
 * Дэлгүүрийн танхим (шүүлтүүргүйгээр орж ирэхэд): 1) улирлын онцлох, 2) цэцгийн төрөл — өөрийн
 * зурагтай, 3) баглаа бүрдүүлэх, 4) тохиолдол — редакцын индекс, 5) өнгө — ботаникийн палитр.
 * Холбоосууд `#results` руу — шүүгдсэн үр дүн шууд харагдана. Шүүлтүүртэй ирвэл харагдахгүй
 * (анхны URL-аар — хуудсан дээр шүүхэд контент «үсрэхгүй»).
 */
export function CategoryShowcase({ items, atelier }: { items: CatalogItem[]; atelier: CatalogItem | null }) {
  const params = useSearchParams();
  const [show] = useState(() => !hasAnyFilter(parseFilters(params)));
  const mounted = useHydrated();
  const nav = useMemo(() => buildStoreNav(items, mounted ? new Date().getMonth() + 1 : 0), [items, mounted]);
  if (!show) return null;

  const [lead, ...seasonal] = nav.seasonal.items;
  // Онцлох нь нүүр зураг, төрлийн хавтан нь 2 дахь зураг — дээр дээрээ давтагдахгүй
  const leadImage = lead?.cover ?? null;
  const species = nav.categories.slice(0, SPECIES_LAYOUT.length);
  const moreSpecies = nav.categories.slice(SPECIES_LAYOUT.length);

  return (
    <div className="mb-28 space-y-28 sm:mb-36 sm:space-y-36">
      {/* 1 · Улирлын онцлох */}
      {lead && (
        <section aria-labelledby="season-title" className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Link href={`/flowers/${lead.slug}`} className="group relative block lg:col-span-7">
            <div className="relative aspect-[5/4] overflow-hidden" style={{ backgroundColor: leadImage?.color }}>
              {leadImage && (
                <FlowerPhoto
                  src={leadImage.src}
                  alt={leadImage.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  preload
                  className="object-cover transition-transform duration-[1.6s] ease-bloom group-hover:scale-[1.02]"
                />
              )}
            </div>
          </Link>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow">{nav.seasonal.title}</p>
            <h2 id="season-title" className="mt-7 font-display text-5xl leading-none font-extralight sm:text-6xl">
              {lead.nameMn}
            </h2>
            <p className="mt-3 font-display text-lg text-ivory/50 italic">{lead.nameEn}</p>
            <p className="mt-6 text-sm text-gold-soft tabular-nums">{formatPrice(lead.startingPrice)}-аас</p>
            <Link href={`/flowers/${lead.slug}`} className="btn-primary mt-8">
              Баглаа сонгох <span aria-hidden>→</span>
            </Link>
            {seasonal.length > 0 && (
              <ul className="mt-12 space-y-3 border-t border-ivory/10 pt-6 text-sm">
                {seasonal.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/flowers/${s.slug}`} className="flex justify-between gap-4 text-ivory/70 transition-colors hover:text-ivory">
                      <span className="link-line">{s.nameMn}</span>
                      <span className="text-ivory/40 tabular-nums">{formatPrice(s.startingPrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* 2 · Цэцгийн төрөл */}
      <section aria-labelledby="species-title">
        <div className="flex items-end justify-between gap-6">
          <h2 id="species-title" className="font-display text-4xl font-extralight sm:text-5xl">
            Цэцгийн <em className="font-light text-blush-100">төрөл</em>
          </h2>
          <Link href="#results" className="link-line hidden text-sm text-ivory/70 sm:inline">
            Бүх цэцэг ↓
          </Link>
        </div>
        {/* Mobile: эрхий хуруугаар гүйлгэх мөр; desktop: тэгш бус сүлжээ */}
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-14 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {species.map((c, i) => (
            <li key={c.id} className={cn("w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-auto", SPECIES_LAYOUT[i].col)}>
              <SpeciesTile category={c} aspect={SPECIES_LAYOUT[i].aspect} />
            </li>
          ))}
        </ul>
        {moreSpecies.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-ivory/10 pt-6">
            {moreSpecies.map((c) => (
              <li key={c.id}>
                <Link href={`${c.href}#results`} className="font-display text-xl font-light text-ivory/75 transition-colors hover:text-ivory">
                  <span className="link-line">{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3 · Баглаа ба 4 · Тохиолдол */}
      <section aria-label="Баглаа ба тохиолдол" className="grid gap-16 lg:grid-cols-12 lg:gap-8">
        {atelier?.cover && (
          <Link href="/bouquet-builder" className="group block lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: atelier.cover.color }}>
              <FlowerPhoto
                src={atelier.cover.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-bloom group-hover:scale-[1.02]"
              />
            </div>
            <p className="mt-5 text-[0.7rem] tracking-[0.16em] text-gold-soft uppercase">Ателье</p>
            <p className="mt-2 font-display text-4xl font-extralight">Өөрийн баглаа бүтээх</p>
            <p className="mt-2 text-sm text-ivory/55">Иш бүрийг, өнгө, боодлыг өөрөө сонгоно. Үнэ шууд тооцогдоно.</p>
          </Link>
        )}

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Тохиолдлоор</h2>
          <ul className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-display text-4xl leading-tight font-extralight sm:text-5xl">
            {nav.occasions.map((o) => (
              <li key={o.id}>
                <Link href={`${o.href}#results`} className="transition-colors hover:text-blush-100">
                  {o.label}
                  <sup className="ml-1 font-sans text-[0.7rem] text-ivory/35 tabular-nums">{o.count}</sup>
                </Link>
              </li>
            ))}
          </ul>

          {/* 5 · Өнгө */}
          <h2 className="mt-16 text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Өнгөөр</h2>
          <ul className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6 sm:grid-cols-8">
            {nav.colors.map((c) => (
              <li key={c.id}>
                <Link href={`${c.href}#results`} className="group flex flex-col items-center gap-2.5 text-center">
                  <span
                    aria-hidden
                    className="size-11 rounded-full ring-1 ring-ivory/10 transition-transform duration-500 ease-bloom group-hover:scale-110"
                    style={{ background: c.hex }}
                  />
                  <span className="text-[0.78rem] text-ivory/65 transition-colors group-hover:text-ivory">{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function SpeciesTile({ category, aspect }: { category: NavCategory; aspect: string }) {
  const image = category.altImage;
  return (
    <Link href={`${category.href}#results`} className="group block">
      <div className={cn("relative aspect-[3/4] overflow-hidden", aspect)} style={{ backgroundColor: image?.color }}>
        {image && (
          <FlowerPhoto
            src={image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 35vw, 62vw"
            className="object-cover transition-transform duration-[1.6s] ease-bloom group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="mt-4 flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl font-light transition-colors group-hover:text-blush-100 sm:text-3xl">{category.label}</span>
        <span className="text-xs text-ivory/40 tabular-nums">{category.count > 1 ? `${category.count} төрөл` : ""}</span>
      </p>
    </Link>
  );
}
