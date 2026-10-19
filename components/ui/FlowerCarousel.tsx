"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/lib/catalog";
import { CatalogCard } from "./CatalogCard";

type Props = {
  eyebrow: string;
  title: string;
  items: CatalogItem[];
};

/**
 * Хэвтээ scroll-snap carousel — touch-д swipe, desktop-д сум. Бүх карт багтвал сум нуугдана.
 * Хуудасны padding-ийг давж дэлгэцийн ирмэг хүртэл гүйнэ.
 */
export function FlowerCarousel({ eyebrow, title, items }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

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
    // observe() нь эхний хэмжээг шууд мэдээлнэ — анхны төлөв ч эндээс
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
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduced ? "auto" : "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mt-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-gold-soft uppercase">{eyebrow}</p>
          <h2 className="font-display text-4xl leading-none font-light sm:text-5xl">{title}</h2>
        </div>
        {!(edges.start && edges.end) && (
          <div className="flex shrink-0 gap-2">
            <ArrowButton label="Өмнөх" disabled={edges.start} onClick={() => scroll(-1)} flip />
            <ArrowButton label="Дараах" disabled={edges.end} onClick={() => scroll(1)} />
          </div>
        )}
      </div>
      <ul
        ref={track}
        onScroll={sync}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.slug}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <CatalogCard item={item} heading="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  flip,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 items-center justify-center border border-ivory/15 text-ivory/70 transition-colors duration-300 enabled:hover:border-gold-soft/60 enabled:hover:text-gold-soft disabled:opacity-30"
    >
      <svg aria-hidden viewBox="0 0 16 16" className={flip ? "size-3.5 rotate-180" : "size-3.5"}>
        <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
