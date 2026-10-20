"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DepthPhoto } from "@/components/ui/DepthPhoto";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { CatalogItem } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  item: CatalogItem & { depth: string | null };
  index: number;
  aspect: string;
  sizes: string;
  className?: string;
  /** Том, 2.5D (depth parallax) зурагтай */
  lead?: boolean;
};

/** Онцлох цуглуулгын нэг баглаа: зураг → дэлгэрэнгүй, доор нэр/үнэ, хамгийн жижиг баглааг шууд сагсанд */
export function FeaturedItem({ item, index, aspect, sizes, className, lead = false }: Props) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const { cover } = item;
  const href = `/flowers/${item.slug}`;

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <article className={cn("reveal group/item", className)}>
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect, backgroundColor: cover?.color }}>
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 block">
          {cover &&
            (lead && item.depth ? (
              <DepthPhoto
                src={cover.src}
                depth={item.depth}
                alt=""
                width={cover.width}
                height={cover.height}
                color={cover.color}
                sizes={sizes}
                strength={0.025}
                className="size-full"
              />
            ) : (
              <FlowerPhoto
                src={cover.src}
                alt=""
                fill
                sizes={sizes}
                className="object-cover transition-transform duration-[1.6s] ease-bloom group-hover/item:scale-[1.04]"
              />
            ))}
        </Link>
        {/* Hover-тэй төхөөрөмжид зураг дээр hover хийхэд л — touch-д үргэлж */}
        <button
          type="button"
          onClick={() => {
            add(item.slug, item.smallest.size);
            setAdded(true);
          }}
          aria-label={`${item.nameMn}, ${item.smallest.size} баглаа сагсанд нэмэх`}
          className={cn(
            "absolute right-4 bottom-4 rounded-full bg-ivory/95 px-5 py-2.5 text-[0.78rem] text-plum-950 transition-[opacity,translate,background-color] duration-500 ease-bloom hover:bg-blush-100 focus-visible:translate-y-0 focus-visible:opacity-100",
            "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:translate-y-0 [@media(hover:hover)]:group-hover/item:opacity-100",
            added && "translate-y-0! opacity-100!",
          )}
        >
          {added ? "Нэмэгдлээ ✓" : "+ Сагсанд"}
        </button>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="text-[0.7rem] text-ivory/35 tabular-nums">{String(index + 1).padStart(2, "0")}</p>
          <h3 className={cn("mt-2 font-display leading-none font-extralight", lead ? "text-5xl sm:text-6xl" : "text-3xl")}>
            <Link href={href} className="transition-colors duration-500 hover:text-blush-100">
              {item.nameMn}
            </Link>
          </h3>
          <p className="mt-2 font-display text-sm text-ivory/45 italic">{item.nameEn}</p>
        </div>
        <p className="shrink-0 pt-6 text-sm text-gold-soft tabular-nums">{formatPrice(item.startingPrice)}-аас</p>
      </div>
      {cover && <PhotoCredit image={cover} className="mt-3 text-[0.62rem]" />}
      <p aria-live="polite" className="sr-only">
        {added ? `${item.nameMn} (${item.smallest.size}) сагсанд нэмэгдлээ` : ""}
      </p>
    </article>
  );
}
