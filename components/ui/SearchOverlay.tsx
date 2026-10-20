"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { colorFamilies, searchKey, type CatalogItem } from "@/lib/catalog";
import { useUI } from "@/lib/store";
import type { StoreNav } from "@/lib/storeNav";
import { cn, formatPrice } from "@/lib/utils";
import { CloseOnNavigate, useScrollLock } from "./CloseOnNavigate";
import { FlowerPhoto } from "./FlowerPhoto";
import { ArrowIcon, CloseIcon, SearchIcon } from "./Icons";

const SUGGESTIONS = ["Сарнай", "Цээнэ", "Ягаан", "Цагаан", "Хурим", "Төрсөн өдөр"];
const MAX_RESULTS = 8;

type Indexed = { item: CatalogItem; name: string; full: string };

/**
 * Бүтэн дэлгэцийн хайлт (native <dialog>: focus trap, Esc). Нэр (Мн/En/латин, «tseene» гэх мэт
 * латин бичлэг), төрөл, өнгө, тохиолдлоор хайна — каталогийн `searchKey`-тэй ижил дүрэм.
 * Нэрээр таарсан нь эхэнд. ↑↓ сонгож Enter-ээр нээнэ; сонголтгүй Enter → каталог `?q=`.
 */
export function SearchOverlay({ items, nav }: { items: CatalogItem[]; nav: StoreNav }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const close = () => setOpen(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [active, setActive] = useState(-1);
  const listId = useId();

  useScrollLock(open);
  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) {
      dialog.showModal();
      input.current?.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // «/» эсвэл ⌘K — хаанаас ч хайлт нээнэ (талбарт бичиж байхад биш)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const index = useMemo<Indexed[]>(
    () =>
      items.map((item) => {
        const colors = colorFamilies.filter((f) => item.colorFamilies.includes(f.id)).map((f) => f.label);
        return {
          item,
          name: searchKey(`${item.nameMn} ${item.nameEn} ${item.latinName}`),
          full: `${item.searchKey} ${searchKey([...colors, ...item.occasions].join(" "))}`,
        };
      }),
    [items],
  );

  const tokens = searchKey(deferred).split(" ").filter(Boolean);
  const results = useMemo(() => {
    if (tokens.length === 0) return [];
    return index
      .filter((e) => tokens.every((t) => e.full.includes(t)))
      .sort((a, b) => score(b, tokens) - score(a, tokens) || b.item.popularity - a.item.popularity)
      .slice(0, MAX_RESULTS)
      .map((e) => e.item);
    // tokens нь deferred-ээс гаралтай
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, deferred]);

  // Төрөл, тохиолдол, өнгөний нэр шууд таарвал — ангилал руу шууд холбоос
  const shortcuts = useMemo(() => {
    if (tokens.length === 0) return [];
    const match = (label: string) => tokens.every((t) => searchKey(label).includes(t));
    return [
      ...nav.categories.filter((c) => match(c.label)).map((c) => ({ href: c.href, label: c.label, kind: "Төрөл" })),
      ...nav.occasions.filter((o) => match(o.label)).map((o) => ({ href: o.href, label: o.label, kind: "Тохиолдол" })),
      ...nav.colors.filter((c) => match(c.label)).map((c) => ({ href: c.href, label: c.label, kind: "Өнгө" })),
    ].slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, deferred]);

  const popular = useMemo(() => [...items].sort((a, b) => b.popularity - a.popularity).slice(0, 4), [items]);
  const shown = tokens.length ? results : popular;
  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <dialog
      ref={ref}
      aria-label="Цэцэг хайх"
      onClose={close}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-plum-950/[0.97] p-0 text-ivory opacity-0 backdrop-blur-sm transition-[opacity,display,overlay] transition-discrete duration-300 ease-bloom open:opacity-100 starting:open:opacity-0 backdrop:bg-transparent"
    >
      <Suspense>
        <CloseOnNavigate onNavigate={close} />
      </Suspense>
      <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-5xl px-4 pt-6 pb-20 sm:px-8 sm:pt-8">
          <div className="flex items-center justify-between">
            <p className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Хайх</p>
            <button
              type="button"
              onClick={close}
              className="-mr-2 flex items-center gap-2 p-2 text-sm text-ivory/60 transition-colors hover:text-ivory"
            >
              Хаах <CloseIcon />
            </button>
          </div>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const pick = active >= 0 ? shown[active] : null;
              if (pick) go(`/flowers/${pick.slug}`);
              else if (query.trim()) go(`/catalog?q=${encodeURIComponent(query.trim())}`);
            }}
            className="mt-10 flex items-center gap-4 border-b border-ivory/20 pb-4 transition-colors focus-within:border-ivory/60 sm:mt-16"
          >
            <SearchIcon className="size-6 shrink-0 text-ivory/40 sm:size-7" />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const n = shown.length;
                  if (n) setActive((a) => (e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
                }
              }}
              placeholder="Сарнай, ягаан, хурим…"
              aria-label="Цэцэг, өнгө, тохиолдлоор хайх"
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              autoComplete="off"
              enterKeyHint="search"
              className="w-full bg-transparent font-display text-4xl font-extralight text-ivory placeholder:text-ivory/25 focus:outline-none sm:text-6xl [&::-webkit-search-cancel-button]:hidden"
            />
          </form>

          {tokens.length === 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <span className="text-ivory/40">Түгээмэл:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    input.current?.focus();
                  }}
                  className="link-line text-ivory/75 transition-colors hover:text-ivory"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            shortcuts.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-3">
                {shortcuts.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={close}
                      className="flex items-center gap-2.5 rounded-full border border-ivory/15 px-4 py-2 text-sm transition-colors hover:border-ivory/50"
                    >
                      <span className="text-ivory/40">{s.kind}</span> {s.label} <ArrowIcon className="size-3.5 text-ivory/50" />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}

          <section className="mt-14" aria-live="polite">
            <h2 className="flex items-baseline justify-between text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">
              {tokens.length ? (results.length ? `${results.length} цэцэг` : "Илэрц") : "Эрэлттэй"}
              {tokens.length > 0 && results.length > 0 && (
                <Link href={`/catalog?q=${encodeURIComponent(query.trim())}`} onClick={close} className="link-line tracking-normal normal-case text-ivory/70">
                  Каталогт бүгдийг үзэх →
                </Link>
              )}
            </h2>

            {tokens.length > 0 && results.length === 0 ? (
              <div className="mt-8 border-t border-ivory/10 pt-10">
                <p className="font-display text-3xl font-extralight">
                  «{query.trim()}» гэх цэцэг <em className="font-light text-blush-100">олдсонгүй</em>
                </p>
                <p className="mt-4 max-w-md text-ivory/55">
                  Нэр, өнгө (ягаан, цагаан…) эсвэл тохиолдлоор (хурим, төрсөн өдөр…) хайж үзээрэй.
                </p>
                <Link href="/catalog" onClick={close} className="btn-ghost mt-8">
                  Бүх цэцэг үзэх
                </Link>
              </div>
            ) : (
              <ul id={listId} role="listbox" aria-label="Илэрц" className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
                {shown.map((item, i) => (
                  <li key={item.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/flowers/${item.slug}`}
                      onClick={close}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "group grid grid-cols-[3.5rem_1fr_auto] items-center gap-5 py-4 transition-colors sm:grid-cols-[4.5rem_1fr_auto] sm:gap-7",
                        i === active && "bg-ivory/[0.03]",
                      )}
                    >
                      <span className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: item.cover?.color }}>
                        {item.cover && <FlowerPhoto src={item.cover.src} alt="" fill sizes="72px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="block font-display text-2xl leading-tight font-light transition-colors group-hover:text-blush-100 sm:text-3xl">
                          {item.nameMn}
                        </span>
                        <span className="mt-1 block text-sm text-ivory/45">
                          <span className="font-display italic">{item.nameEn}</span>
                          {" · "}
                          {colorFamilies.filter((f) => item.colorFamilies.includes(f.id)).map((f) => f.label).join(", ")}
                        </span>
                      </span>
                      <span className="text-sm text-gold-soft tabular-nums">{formatPrice(item.startingPrice)}-аас</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </dialog>
  );
}

/** Нэрээр (эхлэлээрээ бол бүр илүү) таарсан цэцэг эхэнд */
function score(e: Indexed, tokens: string[]) {
  return tokens.reduce((s, t) => s + (e.name.startsWith(t) ? 3 : e.name.includes(t) ? 2 : 0), 0);
}
