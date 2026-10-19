"use client";

import Link from "next/link";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import type { CartLine } from "@/lib/cart";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  line: CartLine;
  /** Drawer-т жижиг зураг, нягт зай */
  compact?: boolean;
  /** Байхгүй бол тоо өөрчлөх/хасах удирдлага харагдахгүй (checkout-ийн хураангуй) */
  onQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  onNavigate?: () => void;
};

export function CartLineRow({ line, compact, onQuantity, onRemove, onNavigate }: Props) {
  const title = line.href ? (
    <Link href={line.href} onClick={onNavigate} className="transition-colors hover:text-blush-100">
      {line.title}
    </Link>
  ) : (
    line.title
  );

  return (
    <li className={cn("flex gap-4 py-5", !compact && "sm:gap-6 sm:py-7")}>
      <Thumb line={line} className={compact ? "w-16" : "w-20 sm:w-28"} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <p className={cn("font-display font-light text-ivory", compact ? "text-xl" : "text-2xl")}>{title}</p>
          <p className="shrink-0 pt-1 text-sm text-gold-soft tabular-nums">{formatPrice(line.unitPrice * line.quantity)}</p>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-ivory/50">{line.detail}</p>
        {line.quantity > 1 && (
          <p className="text-xs text-ivory/40 tabular-nums">
            {formatPrice(line.unitPrice)} × {line.quantity}
          </p>
        )}

        {onQuantity && (
          <div className="mt-auto flex items-center justify-between gap-4 pt-3">
            <QuantityStepper
              value={line.quantity}
              max={line.maxQuantity}
              label={line.title}
              onChange={onQuantity}
              size={compact ? "sm" : "md"}
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                aria-label={`${line.title} хасах`}
                className="text-[0.7rem] tracking-[0.2em] text-ivory/45 uppercase underline-offset-4 transition-colors hover:text-blush-100 hover:underline"
              >
                Хасах
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function Thumb({ line, className }: { line: CartLine; className: string }) {
  return (
    <div
      className={cn("relative aspect-[4/5] shrink-0 overflow-hidden border border-ivory/10 bg-plum-800/40", className)}
      style={line.thumb?.color ? { backgroundColor: line.thumb.color } : undefined}
    >
      {line.thumb ? (
        <FlowerPhoto src={line.thumb.src} alt="" fill sizes="112px" className="object-cover" />
      ) : (
        // Custom баглаа: сонгосон өнгөнүүдийн зөөлөн бөөгнөрөл
        <div aria-hidden className="absolute inset-0 flex flex-wrap content-center justify-center gap-1 p-3">
          {line.swatches.slice(0, 6).map((hex) => (
            <span key={hex} className="size-4 rounded-full ring-1 ring-plum-950/40" style={{ backgroundColor: hex }} />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuantityStepper({
  value,
  max,
  label,
  onChange,
  size = "md",
}: {
  value: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}) {
  const button = cn(
    "flex items-center justify-center text-ivory/70 transition-colors enabled:hover:text-blush-100 disabled:text-ivory/20",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div role="group" aria-label={`${label} — тоо ширхэг`} className="flex items-center border border-ivory/15">
      <button type="button" aria-label="Хасах" disabled={value <= 1} onClick={() => onChange(value - 1)} className={button}>
        −
      </button>
      <output aria-live="polite" className={cn("text-center text-sm tabular-nums", size === "sm" ? "w-6" : "w-8")}>
        {value}
      </output>
      <button type="button" aria-label="Нэмэх" disabled={value >= max} onClick={() => onChange(value + 1)} className={button}>
        +
      </button>
    </div>
  );
}
