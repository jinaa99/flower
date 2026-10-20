"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useUI } from "@/lib/store";
import type { StoreNav } from "@/lib/storeNav";
import { CloseOnNavigate, useScrollLock } from "./CloseOnNavigate";
import { FlowerPhoto } from "./FlowerPhoto";
import { CloseIcon, SearchIcon } from "./Icons";
import { Logo } from "./Logo";

const primary = [
  { href: "/catalog", label: "Дэлгүүр" },
  { href: "/bouquet-builder", label: "Өөрийн баглаа" },
  { href: "/#language", label: "Цэцгийн хэл" },
  { href: "/#delivery", label: "Хүргэлт" },
] as const;

/**
 * Mobile цэс (native <dialog>): том serif холбоосууд, цэцгийн төрлүүд зурагтай хэвтээ гүйлгэх
 * мөрөнд (эрхий хуруугаар), тохиолдол ба өнгө — товч chip-ээр. Хуудас солигдоход хаагдана.
 */
export function MobileMenu({ nav }: { nav: StoreNav }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const close = () => setOpen(false);

  useScrollLock(open);
  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Цэс"
      onClose={close}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-plum-950 p-0 text-ivory opacity-0 transition-[opacity,display,overlay] transition-discrete duration-300 ease-bloom open:opacity-100 starting:open:opacity-0 backdrop:bg-transparent lg:hidden"
    >
      <Suspense>
        <CloseOnNavigate onNavigate={close} />
      </Suspense>
      <div data-lenis-prevent className="flex h-full flex-col overflow-y-auto overscroll-contain">
        <div className="flex h-(--header-height) shrink-0 items-center justify-between px-4 sm:px-8">
          <Link href="/" onClick={close} aria-label="Нүүр хуудас">
            <Logo compact />
          </Link>
          <button type="button" onClick={close} aria-label="Цэс хаах" className="-mr-2 flex size-11 items-center justify-center text-ivory/80">
            <CloseIcon className="size-6" />
          </button>
        </div>

        <div className="flex-1 px-4 pt-6 pb-10 sm:px-8">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 border-b border-ivory/15 pb-3 text-left text-ivory/45"
          >
            <SearchIcon /> Цэцэг, өнгө, тохиолдол…
          </button>

          <nav aria-label="Үндсэн цэс" className="mt-8">
            <ul className="space-y-1">
              {primary.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="block py-1.5 font-display text-[2.6rem] leading-tight font-extralight">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-label="Цэцгийн төрөл" className="mt-12">
            <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Цэцэг</h2>
            <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:scroll-px-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
              {nav.categories.map((c) => (
                <li key={c.id} className="w-28 shrink-0 snap-start">
                  <Link href={c.href} onClick={close} className="block">
                    <span className="relative block aspect-[3/4] overflow-hidden" style={{ backgroundColor: c.image?.color }}>
                      {c.image && <FlowerPhoto src={c.image.src} alt="" fill sizes="112px" className="object-cover" />}
                    </span>
                    <span className="mt-2 block text-sm text-ivory/80">{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Тохиолдол ба өнгө" className="mt-10">
            <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Тохиолдол · Өнгө</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nav.occasions.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link href={o.href} onClick={close} className="block rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory/80">
                    {o.label}
                  </Link>
                </li>
              ))}
              {nav.colors.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} onClick={close} className="flex items-center gap-2 rounded-full border border-ivory/15 py-2 pr-4 pl-2.5 text-sm text-ivory/80">
                    <span aria-hidden className="size-3 rounded-full" style={{ background: c.hex }} />
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </dialog>
  );
}
