"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStockStatus, stockLabels, type CatalogItem, type StockStatus } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { FlowerPhoto } from "./FlowerPhoto";
import { PhotoCredit } from "./PhotoCredit";

const SIZES = "(min-width: 1280px) 26vw, (min-width: 640px) 45vw, 100vw";

const dotStyles: Record<StockStatus, string> = { in: "bg-moss", low: "bg-blush-300", out: "bg-ivory/30" };
const availability: Record<StockStatus, string> = { in: "Бэлэн", low: "Цөөн үлдсэн", out: "Дууссан" };

/** «3 хэмжээ · 5–25 иш» эсвэл ганц хэмжээтэй бол «5 иш» */
function variants(sizes: CatalogItem["sizes"]) {
  const stems = sizes.map((s) => s.stems);
  const min = Math.min(...stems);
  const max = Math.max(...stems);
  return sizes.length > 1 ? `${sizes.length} хэмжээ · ${min}–${max} иш` : `${min} иш`;
}

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
    // relative: sr-only (absolute) мэдэгдэл carousel-ийн scroll хүрээнээс гарч хуудсыг өргөсгөхгүй
    <article className="group/card relative">
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
          {/* Зөвхөн мэдээлэлтэй үед (цөөн үлдсэн / дууссан) — «бэлэн» гэх badge нь чимэглэл л */}
          {status !== "in" && (
            <span
              className={cn(
                "absolute top-4 left-4 flex items-center gap-2 rounded-full bg-plum-950/80 px-3 py-1 text-[0.68rem] before:size-1.5 before:rounded-full",
                badgeStyles[status],
              )}
            >
              {stockLabels[status]}
            </span>
          )}
        </div>
      </Link>

      {/* Нэр; доор нь англи нэр ба үнэ — харьцуулахад хялбар; бэлэн байдал, хувилбар (hover-гүйгээр) */}
      <Heading className="mt-4 font-display text-xl leading-tight font-extralight sm:mt-5 sm:text-3xl">
        <Link href={href} className="transition-colors duration-300 group-hover/card:text-blush-100">
          {item.nameMn}
        </Link>
      </Heading>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="font-display text-sm text-ivory/45 italic">{item.nameEn}</p>
        <p className="shrink-0 text-[0.8rem] text-gold-soft tabular-nums sm:text-sm">{formatPrice(item.startingPrice)}-аас</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ivory/[0.08] pt-4">
        <p className="flex min-w-0 items-center gap-2 text-[0.78rem] whitespace-nowrap text-ivory/55" title={variants(item.sizes)}>
          <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotStyles[status])} />
          {availability[status]}
          <span className="text-ivory/25">·</span>
          <span className="truncate">{item.sizes.length > 1 ? `${item.sizes.length} хэмжээ` : variants(item.sizes)}</span>
        </p>
        <button
          type="button"
          disabled={status === "out"}
          onClick={() => {
            add(item.slug, item.smallest.size);
            setAdded(true);
          }}
          aria-label={`${item.nameMn}, ${item.smallest.size} баглаа сагсанд нэмэх`}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-[0.75rem] transition-colors duration-500 disabled:cursor-not-allowed disabled:border-ivory/10 disabled:text-ivory/35",
            added
              ? "border-blush-300 bg-blush-300/10 text-blush-100"
              : "border-ivory/20 text-ivory/85 enabled:hover:border-ivory enabled:hover:bg-ivory enabled:hover:text-plum-950",
          )}
        >
          {added ? "Нэмэгдлээ ✓" : status === "out" ? "Дууссан" : `+ ${item.smallest.size}`}
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
