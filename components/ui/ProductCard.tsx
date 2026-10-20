"use client";

import Link from "next/link";
import { useEffect, useState, type HTMLAttributes } from "react";
import type { Flower } from "@/data/flowers";
import type { CoverImage } from "@/lib/data";
import { useCart } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { PhotoCredit } from "./PhotoCredit";

type Props = HTMLAttributes<HTMLElement> & {
  flower: Flower;
  /** Аялал дахь дугаар (0-ээс) */
  stage: number;
  count: number;
  /** Ард харагдах зураг — Unsplash-ийнх бол attribution харуулна */
  cover?: CoverImage;
};

/**
 * Нүүрний бүтээгдэхүүний карт: нэр, утга бэлгэдэл, хамгийн жижиг баглааны үнэ, «Дэлгэрэнгүй», «Сагсанд нэмэх».
 * Сүүлийн цэцгийн картанд «Бүх цэцгийг үзэх» → /catalog.
 * 3D аялал болон 3D-гүй хувилбар хоёулаа ашиглана (className, data-* дамжина).
 */
export function ProductCard({ flower, stage, count, cover, className, ...rest }: Props) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const last = stage === count - 1;
  // Карт хамгийн жижиг баглааг санал болгоно — хэмжээг дэлгэрэнгүй хуудсанд сонгоно
  const smallest = flower.pricing.sizes.reduce((a, b) => (b.price < a.price ? b : a));

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <article
      {...rest}
      className={cn(
        // Зургийн дээрх редакцын тайлбар: бараан, нарийн хүрээ — шилэн биш
        "relative w-full max-w-md border border-ivory/10 bg-plum-950/85 p-8 backdrop-blur-sm sm:p-10",
        className,
      )}
    >
      <p className="mb-6 text-[0.72rem] tracking-[0.12em] text-ivory/45 tabular-nums">
        {pad(stage + 1)} <span className="text-ivory/25">/ {pad(count)}</span>
      </p>
      <h2 className="font-display text-5xl leading-none font-extralight sm:text-6xl">{flower.nameMn}</h2>
      <p className="mt-3 font-display text-lg text-ivory/50 italic">
        {flower.nameEn} · {flower.latinName}
      </p>
      <p className="mt-6 leading-relaxed text-ivory/65">{flower.meaning}</p>
      <p className="mt-8 flex items-baseline gap-3 border-t border-ivory/10 pt-6">
        <span className="font-display text-3xl font-light text-gold-soft tabular-nums">{formatPrice(smallest.price)}</span>
        <span className="text-xs text-ivory/45">
          {smallest.size} баглаа · {smallest.stems} иш
        </span>
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            add(flower.slug, smallest.size);
            setAdded(true);
          }}
          className="btn-primary"
        >
          {added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
        </button>
        <Link href={`/flowers/${flower.slug}`} className="btn-ghost">
          Дэлгэрэнгүй <span aria-hidden>→</span>
        </Link>
      </div>
      {cover && <PhotoCredit image={cover} className="mt-6" />}
      <p aria-live="polite" className="sr-only">
        {added ? `${flower.nameMn} (${smallest.size}) сагсанд нэмэгдлээ` : ""}
      </p>

      {last && (
        <Link
          href="/catalog"
          className="group mt-10 flex items-center justify-between border-t border-ivory/10 pt-6 text-sm text-ivory/75 transition-colors duration-500 hover:text-ivory"
        >
          Бүх цэцгийг үзэх
          <span aria-hidden className="transition-transform duration-500 ease-bloom group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </article>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
