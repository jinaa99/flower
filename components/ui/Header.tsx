"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { brand } from "@/lib/brand";
import { selectCartCount, useCart, useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const nav = [
  { href: "/catalog", label: "Цэцэг" },
  { href: "/bouquet-builder", label: "Баглаа бүрдүүлэх" },
  { href: "/#language", label: "Цэцгийн хэл" },
  { href: "/#delivery", label: "Хүргэлт" },
] as const;

/**
 * `usePathname` нь урьдчилан мэдэгдэхгүй param-тай route (/order/[id])-д suspend болдог
 * (cacheComponents) — тэр үед идэвхтэй линкгүй ижил header prerender-д орно.
 */
export function Header() {
  return (
    <Suspense fallback={<HeaderView pathname="" />}>
      <HeaderWithPath />
    </Suspense>
  );
}

function HeaderWithPath() {
  return <HeaderView pathname={usePathname()} />;
}

function HeaderView({ pathname }: { pathname: string }) {
  const count = useCart(selectCartCount);
  const cartOpen = useUI((s) => s.cartOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  // persist нь localStorage-аас уншдаг тул hydration зөрөхөөс сэргийлж hydrate болсны дараа харуулна
  const mounted = useHydrated();
  const items = mounted ? count : 0;

  const linkClass = (href: string) =>
    cn(
      "relative py-2 transition-colors duration-300 hover:text-blush-100",
      // Идэвхтэй хуудас: доор нь нарийн гэрэлтэх цэг
      "after:absolute after:-bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-blush-300 after:opacity-0 after:transition-opacity",
      !href.includes("#") && pathname.startsWith(href) ? "text-ivory after:opacity-100" : "text-ivory/65",
    );

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-(--header-height) bg-linear-to-b from-plum-950/80 to-plum-950/30 backdrop-blur-xl">
      {/* Доод ирмэг: голдоо гэрэлтэх нарийн шугам */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-blush-300/25 to-transparent"
      />
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={`${brand.name} — нүүр хуудас`} className="justify-self-start">
          <Logo />
        </Link>

        <nav aria-label="Үндсэн цэс" className="hidden items-center gap-10 text-[0.8rem] tracking-[0.08em] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-1 sm:gap-2">
          <Link href="/catalog" className={cn(iconButton, "lg:hidden")} aria-label="Цэцэг (каталог)">
            <FlowerIcon />
          </Link>
          <Link href="/catalog" className={iconButton} aria-label="Цэцэг хайх">
            <SearchIcon />
          </Link>
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
            aria-label={`Сагс — ${items} бараа`}
            className={cn(iconButton, "relative")}
          >
            <BagIcon />
            {items > 0 && (
              <span
                key={items}
                aria-hidden
                className="absolute top-1 right-0.5 flex min-w-[1.15rem] items-center justify-center rounded-full bg-blush-500 px-1 text-[0.62rem] leading-[1.15rem] font-medium text-ivory tabular-nums shadow-glow motion-safe:animate-card-in"
              >
                {items}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}

const iconButton =
  "flex size-11 items-center justify-center rounded-full text-ivory/75 transition-colors duration-300 hover:bg-ivory/[0.05] hover:text-blush-100";

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-[1.3rem]",
} as const;

function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5.5 8.5h13l-1 11.5h-11z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4c2.2 2 2.6 5.6 0 8.5C9.4 9.6 9.8 6 12 4Z" />
      <path d="M12 12.5c-.6-3.4-3.2-5.6-6.5-5.8.3 3.4 2.9 5.6 6.5 5.8ZM12 12.5c.6-3.4 3.2-5.6 6.5-5.8-.3 3.4-2.9 5.6-6.5 5.8Z" />
      <path d="M12 12.5V20M12 17c-1.6-1.4-3.4-1.8-5-1.4M12 17c1.6-1.4 3.4-1.8 5-1.4" />
    </svg>
  );
}
