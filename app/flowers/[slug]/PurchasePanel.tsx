"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Flower } from "@/data/flowers";
import { MAX_QUANTITY } from "@/lib/cart";
import { getStockStatus } from "@/lib/catalog";
import { getDeliveryDays, type SlotInfo } from "@/lib/delivery";
import { useCart } from "@/lib/store";
import { useMinuteClock } from "@/lib/useMinuteClock";
import { cn, formatPrice } from "@/lib/utils";


/**
 * Худалдан авах: баглааны хэмжээ (иш, үнэ), тоо ширхэг, нөөц, хүргэлтийн өдөр + цагийн завсар
 * (Улаанбаатар дотор), «Сагсанд нэмэх». Хүргэлтийн сонголт сагсны store-д хадгалагдаж checkout-д очно.
 */
export function PurchasePanel({ flower, slots }: { flower: Flower; slots: SlotInfo[] }) {
  const { sizes, stock, deliveryNote } = flower.pricing;
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState(
    () => sizes.find((s) => s.size === "Дунд" && s.stems <= stock) ?? sizes.find((s) => s.stems <= stock) ?? sizes[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const status = getStockStatus(stock, Math.min(...sizes.map((s) => s.stems)));
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(stock / selected.stems)));
  // Хэмжээ томрох үед нөөцөөс хэтрэхгүй
  const qty = Math.min(quantity, maxQuantity);
  const canBuy = selected.stems <= stock;

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  const delivery = useDeliveryChoice(slots);

  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-4 text-xs tracking-[0.16em] text-ivory/50 uppercase">Баглааны хэмжээ</legend>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s) => {
            const disabled = s.stems > stock;
            const active = s.size === selected.size;
            return (
              <label
                key={s.size}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 border px-4 py-3 transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-blush-300",
                  active ? "border-blush-300 bg-blush-300/5" : "border-ivory/15 hover:border-gold-soft/50",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={s.size}
                  checked={active}
                  disabled={disabled}
                  onChange={() => setSelected(s)}
                  className="sr-only"
                />
                <span className="text-sm">{s.size}</span>
                <span className="text-xs text-ivory/50">{s.stems} иш</span>
                <span className="text-sm text-gold-soft tabular-nums">{formatPrice(s.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p id="qty-label" className="mb-3 text-xs tracking-[0.16em] text-ivory/50 uppercase">
            Тоо ширхэг
          </p>
          <div role="group" aria-labelledby="qty-label" className="flex h-12 items-center border border-ivory/15">
            <StepButton label="Хасах" disabled={!canBuy || qty <= 1} onClick={() => setQuantity(qty - 1)}>
              −
            </StepButton>
            <output aria-live="polite" className="w-10 text-center tabular-nums">
              {qty}
            </output>
            <StepButton label="Нэмэх" disabled={!canBuy || qty >= maxQuantity} onClick={() => setQuantity(qty + 1)}>
              +
            </StepButton>
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs text-ivory/60">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              status === "in" ? "bg-gold-soft" : status === "low" ? "bg-blush-300" : "bg-ivory/30",
            )}
          />
          {status === "out" ? "Одоогоор дууссан" : status === "low" ? `Цөөн үлдсэн — ${stock} иш` : "Бэлэн байгаа"}
        </p>
      </div>

      {/* fieldset-ийн анхдагч min-inline-size: min-content — өдрүүдийн scroll мөр хуудсыг өргөсгөхгүй */}
      <fieldset className="min-w-0">
        <legend className="mb-4 flex w-full items-baseline justify-between gap-4 text-xs tracking-[0.16em] text-ivory/50 uppercase">
          Хүргэлт
          <span className="tracking-normal normal-case">Улаанбаатар хот дотор</span>
        </legend>
        {delivery ? (
          <div className="space-y-4">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Хүргэх өдөр">
              {delivery.days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  aria-pressed={d.date === delivery.day.date}
                  onClick={() => delivery.chooseDay(d.date)}
                  className={cn(
                    "flex shrink-0 flex-col items-start border px-3.5 py-2 text-left transition-colors duration-300",
                    d.date === delivery.day.date
                      ? "border-blush-300 bg-blush-300/5"
                      : "border-ivory/15 hover:border-gold-soft/50",
                  )}
                >
                  <span className="text-sm">{d.label}</span>
                  <span className="text-[0.7rem] text-ivory/50 tabular-nums">{d.sublabel}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Хүргэх цаг">
              {delivery.day.slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!s.available}
                  aria-pressed={s.id === delivery.slot.id}
                  onClick={() => delivery.chooseSlot(s.id)}
                  className={cn(
                    "border px-3 py-2.5 text-sm tabular-nums transition-colors duration-300 disabled:cursor-not-allowed disabled:text-ivory/30 disabled:line-through",
                    s.id === delivery.slot.id
                      ? "border-blush-300 bg-blush-300/5 text-blush-100"
                      : "border-ivory/15 text-ivory/80 enabled:hover:border-gold-soft/50",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div aria-hidden className="h-[7.75rem] animate-pulse bg-ivory/[0.03]" />
        )}
        <p className="mt-4 text-xs leading-relaxed text-ivory/50">{deliveryNote}</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          disabled={!canBuy}
          onClick={() => {
            add(flower.slug, selected.size, qty);
            delivery?.confirm();
            setAdded(true);
          }}
          className="flex-1 btn-primary tabular-nums disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          {added ? "Нэмэгдлээ ✓" : canBuy ? `Сагсанд нэмэх · ${formatPrice(selected.price * qty)}` : "Одоогоор дууссан"}
        </button>
        {added && (
          <Link
            href="/cart"
            className="text-xs tracking-[0.2em] text-blush-100 uppercase underline-offset-4 hover:underline"
          >
            Сагс руу очих →
          </Link>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {added ? `${flower.nameMn}, ${selected.size} баглаа × ${qty} сагсанд нэмэгдлээ` : ""}
      </p>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 items-center justify-center text-lg text-ivory/70 transition-colors enabled:hover:text-blush-100 disabled:text-ivory/20"
    >
      {children}
    </button>
  );
}

/**
 * Сонгосон өдөр/завсар (store-д) — хадгалагдсан нь хоцорсон бол эхний боломжтойг санал болгоно.
 * Hydration-ий өмнө null.
 */
function useDeliveryChoice(slots: SlotInfo[]) {
  const now = useMinuteClock();
  const stored = useCart((s) => s.delivery);
  const setDelivery = useCart((s) => s.setDelivery);
  const days = useMemo(() => (now === null ? [] : getDeliveryDays(now, slots)), [now, slots]);
  if (!days.length) return null;

  const day = days.find((d) => d.date === stored?.date) ?? days[0];
  const firstOpen = (d: (typeof days)[number]) => d.slots.find((s) => s.available)!;
  const slot = day.slots.find((s) => s.id === stored?.slot && s.available) ?? firstOpen(day);

  return {
    days,
    day,
    slot,
    chooseDay: (date: string) => {
      const next = days.find((d) => d.date === date)!;
      // Ижил цагийн завсрыг хадгална, тэр өдөр боломжгүй бол эхний боломжтой
      const keep = next.slots.find((s) => s.id === slot.id && s.available);
      setDelivery({ date, slot: (keep ?? firstOpen(next)).id });
    },
    chooseSlot: (id: string) => setDelivery({ date: day.date, slot: id }),
    confirm: () => setDelivery({ date: day.date, slot: slot.id }),
  };
}
