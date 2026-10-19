"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { CatalogItem } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

/**
 * «Манай цуглуулга»: нуман (arch) хүрээтэй зурагтай карт — hover дээр зураг томорч, ард нь
 * ягаан гэрэл тодорно. Хэвтээ scroll-snap, desktop-д сум.
 */
export function CollectionRail({ items }: { items: CatalogItem[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = () => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => sync());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap) * 2, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section id="collection" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <SectionHeading eyebrow="Цуглуулга" title={["Манай ", "цэцэгс", ""]} />
          <div className="flex items-center gap-3">
            <Link href="/catalog" className="mr-4 text-sm text-ivory/70 transition-colors hover:text-blush-100">
              Бүгдийг үзэх <span aria-hidden>→</span>
            </Link>
            <Arrow label="Өмнөх" disabled={edges.start} onClick={() => scroll(-1)} flip />
            <Arrow label="Дараах" disabled={edges.end} onClick={() => scroll(1)} />
          </div>
        </div>

        <ul
          ref={track}
          onScroll={sync}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto overscroll-x-contain px-4 pt-6 pb-4 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:gap-7 sm:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <li key={item.slug} className="w-[62%] shrink-0 snap-start sm:w-[34%] lg:w-[calc((100%-5.25rem)/4)]">
              <CollectionCard item={item} eager={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CollectionCard({ item, eager }: { item: CatalogItem; eager: boolean }) {
  const { cover } = item;
  return (
    <article className="group">
      <Link href={`/flowers/${item.slug}`} className="block focus-visible:outline-none">
        <div className="relative">
          {/* Ард нь hover дээр тодрох гэрэл */}
          <div
            aria-hidden
            className="absolute inset-x-6 top-10 bottom-0 rounded-t-full bg-blush-500/40 opacity-0 blur-3xl transition-opacity duration-700 ease-bloom group-hover:opacity-100"
          />
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-t-full border border-ivory/10 ring-blush-300/0 transition-[box-shadow,border-color] duration-700 group-hover:border-blush-300/40 group-focus-visible:ring-2 group-focus-visible:ring-blush-300"
            style={{ background: `linear-gradient(160deg, ${item.swatch[0]}, ${item.swatch[1]})` }}
          >
            {cover && (
              <FlowerPhoto
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 34vw, 62vw"
                loading={eager ? "eager" : "lazy"}
                className="object-cover transition-transform duration-[1.4s] ease-bloom group-hover:scale-[1.06]"
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-plum-950/70 via-transparent to-transparent" />
          </div>
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl leading-tight font-light transition-colors group-hover:text-blush-100">
              {item.nameMn}
            </h3>
            <p className="mt-1 text-[0.65rem] tracking-[0.3em] text-ivory/45 uppercase">{item.nameEn}</p>
          </div>
          <p className="shrink-0 text-sm text-gold-soft tabular-nums">{formatPrice(item.startingPrice)}</p>
        </div>
      </Link>
      {cover && <PhotoCredit image={cover} className="mt-2 text-[0.6rem]" />}
    </article>
  );
}

function Arrow({ label, disabled, onClick, flip }: { label: string; disabled: boolean; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-300 enabled:hover:border-blush-100 enabled:hover:text-blush-100 disabled:opacity-30"
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className={cn("size-5", flip && "rotate-180")}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
