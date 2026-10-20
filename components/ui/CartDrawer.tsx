"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { CartLineRow } from "@/components/ui/CartLineRow";
import { CartSummary } from "@/components/ui/CartSummary";
import { CloseOnNavigate, useScrollLock } from "@/components/ui/CloseOnNavigate";
import type { CartFlower } from "@/lib/cart";
import { useUI } from "@/lib/store";
import { useCartView } from "@/lib/useCartView";

/**
 * Header-ийн «Сагс»-аас баруунаас гулсаж гарах mini-cart: native <dialog> (focus trap, Esc),
 * transition нь @starting-style + allow-discrete (FilterSheet-тэй ижил). Хуудас солигдоход хаагдана.
 */
export function CartDrawer({ catalog }: { catalog: CartFlower[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const close = () => setOpen(false);
  const { ready, lines, totals, setLineQuantity, removeLine } = useCartView(catalog);

  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useScrollLock(open);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-drawer-title"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="top-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md translate-x-full border-l border-ivory/10 bg-plum-900 p-0 text-ivory shadow-[-24px_0_60px_-20px_rgb(0_0_0/0.6)] transition-[translate,display,overlay] transition-discrete duration-500 ease-bloom open:translate-x-0 starting:open:translate-x-full backdrop:bg-plum-950/70 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-500 open:backdrop:opacity-100 starting:open:backdrop:opacity-0"
    >
      <Suspense>
        <CloseOnNavigate onNavigate={close} />
      </Suspense>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-ivory/10 px-6 py-5">
          <h2 id="cart-drawer-title" className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-light">Сагс</span>
            {count > 0 && <span className="text-xs text-ivory/45 tabular-nums">{count} бараа</span>}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Хаах"
            className="flex size-10 items-center justify-center text-2xl text-ivory/60 transition-colors hover:text-blush-100"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        {!ready ? (
          <div aria-hidden className="m-6 h-40 animate-pulse bg-ivory/[0.03]" />
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-display text-3xl font-light text-ivory/80">Сагс хоосон байна</p>
            <p className="text-sm text-ivory/50">Улирлын шинэхэн цэцгээс сонгоод эхлээрэй.</p>
            <Link
              href="/catalog"
              onClick={close}
              className="mt-2 btn-ghost"
            >
              Каталог үзэх
            </Link>
          </div>
        ) : (
          <>
            <ul data-lenis-prevent className="flex-1 divide-y divide-ivory/10 overflow-y-auto overscroll-contain px-6">
              {lines.map((line) => (
                <CartLineRow
                  key={line.key}
                  line={line}
                  compact
                  onQuantity={(q) => setLineQuantity(line, q)}
                  onRemove={() => removeLine(line)}
                  onNavigate={close}
                />
              ))}
            </ul>
            <div className="space-y-5 border-t border-ivory/10 px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <CartSummary totals={totals} />
              <div className="flex gap-3">
                <Link
                  href="/cart"
                  onClick={close}
                  className="btn-ghost flex-1 px-4"
                >
                  Сагс харах
                </Link>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="btn-primary flex-[1.4] px-4"
                >
                  Захиалах
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
