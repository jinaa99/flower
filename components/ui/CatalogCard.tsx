"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStockStatus, stockLabels, type CatalogItem, type StockStatus } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { FlowerPhoto } from "./FlowerPhoto";
import { PhotoCredit } from "./PhotoCredit";

const SIZES = "(min-width: 1280px) 26vw, (min-width: 640px) 45vw, 100vw";

const badgeStyles: Record<StockStatus, string> = {
  in: "text-ivory/80 before:bg-gold-soft",
  low: "text-blush-100 before:bg-blush-300",
  out: "text-ivory/55 before:bg-ivory/30",
};

/**
 * Каталогийн карт: hover дээр 2 дахь зураг руу зөөлөн шилжинэ (зөвхөн hover-тэй төхөөрөмжид ачаална),
 * нэр Мн/En, эхлэх үнэ, нөөцийн badge, хамгийн жижиг баглааг шууд сагсанд нэмэх товч.
 */
export function CatalogCard({
  item,
  eager = false,
  heading: Heading = "h2",
}: {
  item: CatalogItem;
  eager?: boolean;
  /** Хэсгийн гарчиг дор (carousel) h3 */
  heading?: "h2" | "h3";
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const status = getStockStatus(item.stock, item.smallest.stems);
  const href = `/flowers/${item.slug}`;
  const { cover, alt } = item;

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <article className="group/card">
      {/* Нэрний холбоос нь гол tab stop — зургийнх давхардахгүй */}
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <div
          className="relative aspect-[4/5] overflow-hidden"
          // Зураггүй үед (script ажиллаагүй) цэцгийн өнгөөр gradient
          style={{ background: `linear-gradient(160deg, ${item.swatch[0]}, ${item.swatch[1]} 70%, #1e0f1a)` }}
        >
          {cover && (
            <FlowerPhoto
              src={cover.src}
              alt=""
              fill
              sizes={SIZES}
              loading={eager ? "eager" : "lazy"}
              className={cn(
                "object-cover transition-[scale,filter] duration-1000 ease-bloom group-hover/card:scale-[1.03]",
                status === "out" && "saturate-[0.35]",
              )}
              style={{ backgroundColor: cover.color }}
            />
          )}
          {alt && (
            <FlowerPhoto
              src={alt.src}
              alt=""
              fill
              sizes={SIZES}
              loading="lazy"
              // display:none үед lazy зураг татагдахгүй — touch төхөөрөмжид илүү ачаалал үүсгэхгүй
              className={cn(
                "hidden object-cover opacity-0 transition-[opacity,scale] duration-1000 ease-bloom group-hover/card:scale-[1.03] group-hover/card:opacity-100 [@media(hover:hover)]:block",
                status === "out" && "saturate-[0.35]",
              )}
              style={{ backgroundColor: alt.color }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-plum-950/50 via-transparent to-transparent" />
          <span
            className={cn(
              "absolute top-4 left-4 flex items-center gap-2 border border-ivory/15 bg-plum-950/55 px-2.5 py-1 text-[0.62rem] tracking-[0.22em] uppercase backdrop-blur-md before:size-1.5 before:rounded-full",
              badgeStyles[status],
            )}
          >
            {stockLabels[status]}
          </span>
        </div>
      </Link>

      <div className="mt-5">
        <Heading className="font-display text-3xl leading-tight font-light">
          <Link href={href} className="transition-colors duration-300 group-hover/card:text-blush-100">
            {item.nameMn}
          </Link>
        </Heading>
        <p className="mt-1 text-xs tracking-[0.2em] text-ivory/50 uppercase">{item.nameEn}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gold-soft tabular-nums">{formatPrice(item.startingPrice)}-аас</p>
        <button
          type="button"
          disabled={status === "out"}
          onClick={() => {
            add(item.slug, item.smallest.size);
            setAdded(true);
          }}
          aria-label={`${item.nameMn}, ${item.smallest.size} баглаа сагсанд нэмэх`}
          className={cn(
            "shrink-0 border px-4 py-2.5 text-[0.65rem] tracking-[0.2em] uppercase transition-colors duration-500 disabled:cursor-not-allowed disabled:border-ivory/10 disabled:text-ivory/35",
            added
              ? "border-blush-300 bg-blush-300/10 text-blush-100"
              : "border-gold-soft/50 text-gold-soft hover:bg-gold-soft hover:text-plum-950",
          )}
        >
          {added ? "Нэмэгдлээ ✓" : status === "out" ? "Дууссан" : "+ Сагсанд"}
        </button>
      </div>

      {cover && (
        // Харагдаж буй зурагтай нь attribution солигдоно
        <div className="mt-3 grid *:col-start-1 *:row-start-1">
          <PhotoCredit
            image={cover}
            className={cn(alt && "transition-[opacity,visibility] duration-700 group-hover/card:invisible group-hover/card:opacity-0")}
          />
          {alt && (
            <PhotoCredit
              image={alt}
              className="invisible opacity-0 transition-[opacity,visibility] duration-700 group-hover/card:visible group-hover/card:opacity-100"
            />
          )}
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {added ? `${item.nameMn} (${item.smallest.size}) сагсанд нэмэгдлээ` : ""}
      </p>
    </article>
  );
}
