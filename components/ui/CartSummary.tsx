import type { CartTotals } from "@/lib/cart";
import { FREE_DELIVERY_FROM } from "@/lib/delivery";
import { cn, formatPrice } from "@/lib/utils";

/** Дүн, хүргэлтийн төлбөр, нийт — үнэгүй хүргэлт хүртэлх явцтай */
export function CartSummary({ totals, className }: { totals: CartTotals; className?: string }) {
  const progress = Math.min(1, totals.subtotal / FREE_DELIVERY_FROM);
  return (
    <div className={cn("space-y-5", className)}>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-ivory/70">
          <dt>Барааны дүн</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-ivory/70">
          <dt>Хүргэлт</dt>
          <dd className="tabular-nums">{totals.deliveryFee ? formatPrice(totals.deliveryFee) : <span className="text-blush-100">Үнэгүй</span>}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-ivory/10 pt-4">
          <dt className="text-xs tracking-[0.3em] text-ivory/60 uppercase">Нийт</dt>
          <dd className="font-display text-3xl text-gold-soft tabular-nums">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {totals.subtotal > 0 && (
        <div>
          <p className="mb-2 text-xs text-ivory/50">
            {totals.freeDeliveryGap > 0
              ? `Үнэгүй хүргэлт хүртэл ${formatPrice(totals.freeDeliveryGap)} дутуу`
              : "Таны захиалгад хүргэлт үнэгүй ✓"}
          </p>
          <div aria-hidden className="h-px bg-ivory/10">
            <div className="h-px origin-left bg-gold-soft transition-transform duration-700 ease-bloom" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      )}
    </div>
  );
}
