"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogCard } from "@/components/ui/CatalogCard";
import {
  applyFilters,
  countActive,
  emptyFilters,
  hasAnyFilter,
  parseFilters,
  serializeFilters,
  slugify,
  sortOptions,
  type CatalogFilters,
  type CatalogItem,
  type SortId,
} from "@/lib/catalog";
import { capitalize } from "@/lib/utils";
import { ActiveFilters, FilterPanel, type FilterOptions } from "./CatalogFilters";
import { FilterSheet } from "./FilterSheet";

const PRICE_STEP = 5000;

/** Сүүлд бидний URL-д бичсэн query — гаднаас (жишээ нь Header-ийн «Каталог») ирсэн өөрчлөлтийг ялгана */
let lastWrittenQs: string | null = null;

/**
 * Каталог: хайлт, шүүлтүүр, эрэмбэ. Шүүлтүүр нь local state-д амьдарч, URL-д (replaceState)
 * бага зэрэг хоцорч бичигдэнэ — Safari-ийн history throttling-аас сэргийлнэ, холбоосыг хуваалцаж болно.
 */
export function CatalogBrowser({ items }: { items: CatalogItem[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState(() => parseFilters(searchParams));
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL гаднаас өөрчлөгдвөл (ижил хуудас руу Link) state-ийг дагуулна
  const urlQs = serializeFilters(parseFilters(searchParams));
  const [seenQs, setSeenQs] = useState(urlQs);
  if (urlQs !== seenQs) {
    setSeenQs(urlQs);
    if (urlQs !== lastWrittenQs) setFilters(parseFilters(searchParams));
  }

  const qs = serializeFilters(filters);
  useEffect(() => {
    const id = setTimeout(() => {
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (url === window.location.pathname + window.location.search) return;
      lastWrittenQs = qs;
      window.history.replaceState(null, "", url);
    }, 250);
    return () => clearTimeout(id);
  }, [qs, pathname]);

  const update = useCallback((patch: Partial<CatalogFilters>) => setFilters((f) => ({ ...f, ...patch })), []);
  const clear = useCallback(() => setFilters((f) => ({ ...emptyFilters, sort: f.sort })), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const options = useMemo(() => buildOptions(items), [items]);
  const results = useMemo(() => applyFilters(items, filters), [items, filters]);
  const active = countActive(filters);

  const panel = <FilterPanel filters={filters} options={options} update={update} />;

  return (
    <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-14 xl:gap-20">
      <aside aria-label="Шүүлтүүр" className="hidden lg:block">
        {panel}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-ivory/10 pb-6 sm:flex-nowrap">
          <SearchField value={filters.q} onChange={(q) => update({ q })} />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="flex h-12 items-center gap-2.5 border border-ivory/15 px-4 text-xs tracking-[0.2em] text-ivory/80 uppercase transition-colors duration-300 hover:border-gold-soft/50 lg:hidden"
          >
            <FilterIcon />
            Шүүлтүүр
            {active > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blush-300 px-1.5 text-[0.65rem] text-plum-950 tabular-nums">
                {active}
              </span>
            )}
          </button>
          <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p aria-live="polite" className="text-xs tracking-[0.2em] text-ivory/50 uppercase tabular-nums">
            {results.length} цэцэг
          </p>
          <ActiveFilters filters={filters} options={options} update={update} clear={clear} />
        </div>

        {results.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-14 xl:grid-cols-3">
            {results.map((item, i) => (
              <li
                key={item.slug}
                className="animate-card-in"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <CatalogCard item={item} eager={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState query={filters.q} onClear={clear} />
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        resultCount={results.length}
        onClear={hasAnyFilter(filters) ? clear : undefined}
      >
        {panel}
      </FilterSheet>
    </div>
  );
}

function buildOptions(items: CatalogItem[]): FilterOptions {
  const categories = [...new Set(items.map((i) => i.category))];
  // Тохиолдлыг хамгийн олон цэцэгт таарахаас нь эхэлж харуулна
  const occasionCount = new Map<string, number>();
  for (const o of items.flatMap((i) => i.occasions)) occasionCount.set(o, (occasionCount.get(o) ?? 0) + 1);
  const occasions = [...occasionCount.keys()].sort((a, b) => occasionCount.get(b)! - occasionCount.get(a)!);
  const prices = items.map((i) => i.startingPrice);
  return {
    types: categories.map((c) => ({ id: slugify(c), label: capitalize(c) })),
    occasions: occasions.map((o) => ({ id: slugify(o), label: capitalize(o) })),
    price: {
      min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
      max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
      step: PRICE_STEP,
    },
  };
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full sm:flex-1">
      <label htmlFor="catalog-search" className="sr-only">
        Цэцэг хайх
      </label>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-none stroke-ivory/45 stroke-[1.5]"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" strokeLinecap="round" />
      </svg>
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Цээнэ, peony, tseene…"
        autoComplete="off"
        spellCheck={false}
        className="h-12 w-full border border-ivory/15 bg-plum-800/25 pr-12 pl-11 text-sm text-ivory transition-colors duration-300 placeholder:text-ivory/35 hover:border-ivory/25 focus:border-blush-300/60 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Хайлтыг цэвэрлэх"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center text-ivory/50 transition-colors hover:text-blush-100"
        >
          <span aria-hidden>×</span>
        </button>
      )}
    </form>
  );
}

function SortSelect({ value, onChange }: { value: SortId; onChange: (value: SortId) => void }) {
  return (
    <label className="relative ml-auto flex h-12 shrink-0 items-center gap-3 border border-ivory/15 pr-9 pl-4 transition-colors duration-300 hover:border-gold-soft/50 has-focus-visible:border-blush-300/60">
      <span className="text-[0.65rem] tracking-[0.16em] text-ivory/45 uppercase">Эрэмбэ</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortId)}
        className="appearance-none bg-transparent text-sm text-ivory focus:outline-none"
      >
        {sortOptions.map((o) => (
          <option key={o.id} value={o.id} className="bg-plum-950 text-ivory">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-4 size-2.5 fill-none stroke-gold-soft stroke-[1.5]"
      >
        <path d="m2 4 4 4 4-4" />
      </svg>
    </label>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 fill-none stroke-current stroke-[1.25]">
      <path d="M1 4h14M3.5 8h9M6 12h4" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  const q = query.trim();
  return (
    <div className="mt-10 flex flex-col items-center border border-ivory/10 bg-plum-800/15 px-6 py-20 text-center sm:py-28">
      <svg aria-hidden viewBox="0 0 48 48" className="size-12 fill-none stroke-gold-soft/70 stroke-[1]">
        <path d="M24 30c-6-3-9-8-9-13 4 0 7 2 9 5 2-3 5-5 9-5 0 5-3 10-9 13Z" />
        <path d="M24 30v12M24 38c-3-3-7-4-10-3M24 36c2-2 5-3 8-2" strokeLinecap="round" />
      </svg>
      <p className="mt-8 text-xs tracking-[0.16em] text-gold-soft uppercase">Үр дүн олдсонгүй</p>
      <h2 className="mt-4 max-w-lg font-display text-3xl leading-tight font-light text-balance sm:text-4xl">
        {q ? <>«{q}» — тохирох цэцэг алга байна</> : "Сонгосон шүүлтүүрт тохирох цэцэг алга байна"}
      </h2>
      <p className="mt-4 max-w-md text-sm text-ivory/55">
        Шүүлтүүрээ сулруулж үзээрэй. Нэрийг монгол, англи эсвэл латин үсгээр (жишээ нь «tsetseg») бичиж болно.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-10 btn-primary"
      >
        Шүүлтүүр арилгах
      </button>
    </div>
  );
}

/** Suspense fallback — prerender-ийн статик бүрхүүлд харагдана */
export function CatalogSkeleton() {
  return (
    <div aria-hidden className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-14 xl:gap-20">
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-8 bg-ivory/5" />
        ))}
      </div>
      <div>
        <div className="h-12 border border-ivory/10" />
        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <div className="aspect-[4/5] animate-pulse bg-plum-800/40" />
              <div className="mt-5 h-7 w-1/2 bg-ivory/5" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
