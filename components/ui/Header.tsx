"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { selectCartCount, useCart, useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/bouquet-builder", label: "Баглаа бүрдүүлэх" },
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

  const linkClass = (href: string) =>
    cn(
      "transition-colors duration-300 hover:text-blush-100",
      pathname.startsWith(href) ? "text-blush-300" : "text-ivory/70",
    );

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-(--header-height) border-b border-ivory/5 bg-plum-950/60 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-wide text-ivory sm:text-3xl"
          aria-label="Нүүр хуудас"
        >
          Flower<span className="text-gold-soft">.</span>
        </Link>

        <nav className="flex items-center gap-4 text-xs tracking-[0.12em] uppercase sm:gap-10 sm:text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={cn(linkClass(item.href), "hidden sm:inline")}>
              {item.label}
            </Link>
          ))}
          <Link href="/catalog" className={cn(linkClass("/catalog"), "sm:hidden")}>
            Каталог
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
            className={cn(linkClass("/cart"), "flex items-center gap-2")}
          >
            Сагс
            <span
              key={mounted ? count : 0}
              className="inline-flex min-w-6 items-center justify-center rounded-full border border-gold-soft/40 px-1.5 py-0.5 text-[0.7rem] text-gold-soft tabular-nums motion-safe:animate-card-in"
              aria-label={`Сагсанд ${mounted ? count : 0} бараа`}
            >
              {mounted ? count : 0}
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
