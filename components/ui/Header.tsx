"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brand } from "@/lib/brand";
import type { CatalogItem } from "@/lib/catalog";
import { selectCartCount, useCart, useUI } from "@/lib/store";
import { buildStoreNav } from "@/lib/storeNav";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { CloseOnNavigate } from "./CloseOnNavigate";
import { BagIcon, ChevronIcon, MenuIcon, SearchIcon } from "./Icons";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";
import { StoreMenu } from "./StoreMenu";

/** «Өөрийн баглаа» хавтанд — гараар боосон бодит баглааны зураг */
const ATELIER_SLUG = "spray-rose";
const STORE_MENU_ID = "store-menu";

type Props = { items: CatalogItem[] };

/**
 * `usePathname` нь урьдчилан мэдэгдэхгүй param-тай route (/order/[id])-д suspend болдог
 * (cacheComponents) — тэр үед идэвхтэй линкгүй ижил header prerender-д орно.
 */
export function Header({ items }: Props) {
  return (
    <Suspense fallback={<HeaderView items={items} pathname="" />}>
      <HeaderWithPath items={items} />
    </Suspense>
  );
}

function HeaderWithPath({ items }: Props) {
  return <HeaderView items={items} pathname={usePathname()} />;
}

/**
 * Редакцын header: голдоо лого, зүүн талд «Дэлгүүр» (тэргүүлэх — mega цэс) ба хоёр холбоос,
 * баруун талд хайлт ба сагс. Hero дээр тунгалаг (дээрээс зөөлөн сүүдэр — гэрэл зураг дээр ч
 * уншигдана), гүйлгэсний дараа бараан. Mobile: зүүн талд цэс, баруун талд хайлт ба сагс.
 */
function HeaderView({ items, pathname }: Props & { pathname: string }) {
  const count = useCart(selectCartCount);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const cartOpen = useUI((s) => s.cartOpen);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  // persist нь localStorage-аас уншдаг тул hydration зөрөхөөс сэргийлж hydrate болсны дараа харуулна
  const mounted = useHydrated();
  const cartCount = mounted ? count : 0;
  const scrolled = useScrolled();
  const store = useStoreMenu();

  // Улирал нь хэрэглэгчийн сараар — prerender-д (сар тодорхойгүй) жилийн турш байдаг сонголт
  const month = mounted ? new Date().getMonth() + 1 : 0;
  const nav = useMemo(() => buildStoreNav(items, month), [items, month]);
  const atelierImage = useMemo(() => items.find((i) => i.slug === ATELIER_SLUG)?.cover ?? null, [items]);

  const linkClass = (active: boolean) =>
    cn(
      "relative py-2 transition-colors duration-300 hover:text-ivory",
      "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ivory/70 after:transition-transform after:duration-500 after:ease-bloom",
      active ? "text-ivory after:scale-x-100" : "text-ivory/60",
    );

  return (
    <>
      <header
        data-scrolled={scrolled || undefined}
        data-menu={store.open || undefined}
        onMouseLeave={store.leave}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-(--header-height) border-b border-transparent transition-[background-color,border-color] duration-500 ease-bloom",
          // Hero дээр: дээрээс зөөлөн сүүдэр — цайвар зураг дээр ч nav уншигдана
          "bg-linear-to-b from-plum-950/55 to-transparent",
          "data-scrolled:border-ivory/[0.07] data-scrolled:bg-plum-950/90 data-scrolled:backdrop-blur-md",
          "data-menu:border-ivory/[0.07] data-menu:bg-plum-950",
          // Нүүрний 3D аялал дээр: кадрыг хуваахгүй
          "in-data-immersive:not-data-menu:border-transparent! in-data-immersive:not-data-menu:bg-transparent! in-data-immersive:not-data-menu:backdrop-blur-none!",
        )}
      >
        <Suspense>
          <CloseOnNavigate onNavigate={store.close} />
        </Suspense>
        <div className="mx-auto grid h-full max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8 lg:px-10">
          <div className="flex items-center justify-self-start">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Цэс нээх"
              className="-ml-2 flex size-11 items-center justify-center text-ivory/85 lg:hidden"
            >
              <MenuIcon className="size-6" />
            </button>
            <nav aria-label="Үндсэн цэс" className="hidden items-center gap-9 text-[0.84rem] tracking-[0.01em] lg:flex">
              <button
                type="button"
                aria-expanded={store.open}
                aria-controls={STORE_MENU_ID}
                onClick={store.toggle}
                onMouseEnter={store.enter}
                className={cn(linkClass(store.open || pathname.startsWith("/catalog") || pathname.startsWith("/flowers")), "flex items-center gap-1.5 text-ivory")}
              >
                Дэлгүүр
                <ChevronIcon className={cn("size-3.5 transition-transform duration-300", store.open && "rotate-180")} />
              </button>
              <Link href="/bouquet-builder" onMouseEnter={store.leave} className={linkClass(pathname.startsWith("/bouquet-builder"))}>
                Өөрийн баглаа
              </Link>
              <Link href="/#language" onMouseEnter={store.leave} className={linkClass(false)}>
                Цэцгийн хэл
              </Link>
            </nav>
          </div>

          <Link href="/" aria-label={`${brand.name} — нүүр хуудас`} onMouseEnter={store.leave}>
            <Logo />
          </Link>

          <div className="flex items-center gap-1 justify-self-end text-[0.84rem] sm:gap-4" onMouseEnter={store.leave}>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              className="flex h-11 items-center gap-2.5 px-2 text-ivory/75 transition-colors hover:text-ivory"
            >
              <SearchIcon />
              <span className="hidden lg:inline">Хайх</span>
            </button>
            {/* JS ачаалагдахаас өмнө /cart руу шилжинэ; дараа нь mini-cart drawer нээнэ */}
            <a
              href="/cart"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                setCartOpen(true);
              }}
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-label={`Сагс — ${cartCount} бараа`}
              className="-mr-2 flex h-11 items-center gap-2.5 px-2 text-ivory/75 transition-colors hover:text-ivory"
            >
              <BagIcon />
              <span className="hidden lg:inline">Сагс</span>
              {cartCount > 0 && (
                <span key={cartCount} aria-hidden className="text-ivory tabular-nums motion-safe:animate-card-in">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {store.open && (
          <div
            onMouseEnter={store.enter}
            className="absolute inset-x-0 top-full hidden border-b border-ivory/[0.07] bg-plum-950 motion-safe:animate-menu-in lg:block"
          >
            <StoreMenu id={STORE_MENU_ID} nav={nav} atelierImage={atelierImage} total={items.length} onNavigate={store.close} />
          </div>
        )}
      </header>

      {/* Цэс нээлттэй үед доорх хуудсыг бүдгэрүүлнэ — дарвал хаагдана */}
      {store.open && (
        <div aria-hidden onClick={store.close} className="fixed inset-0 z-40 hidden bg-plum-950/55 motion-safe:animate-fade-in lg:block" />
      )}

      <SearchOverlay items={items} nav={nav} />
      <MobileMenu nav={nav} />
    </>
  );
}

/**
 * «Дэлгүүр» цэс: дарахад нээж/хаана, desktop-д hover-оор (бага саатлаар — санамсаргүй нээгдэхгүй)
 * нээгдэж, header + цэснээс хулгана гарахад хаагдана. Esc-ээр хаагдана.
 */
function useStoreMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef(0);
  const clear = () => window.clearTimeout(timer.current);
  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    open,
    close,
    toggle: () => {
      clear();
      setOpen((o) => !o);
    },
    enter: () => {
      clear();
      if (window.matchMedia("(hover: hover)").matches) timer.current = window.setTimeout(() => setOpen(true), 120);
    },
    leave: () => {
      clear();
      timer.current = window.setTimeout(() => setOpen(false), 180);
    },
  };
}

/** Хуудас бага зэрэг гүйлгэгдсэн эсэх — header-ийн дэвсгэрийг асаана */
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}
