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
        "glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-8 shadow-glow-lg sm:p-10",
        // Дээд ирмэгийн нарийн гэрэл
        "before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-blush-100/50 before:to-transparent",
        className,
      )}
    >
      <p className="eyebrow mb-6 tabular-nums">
        {pad(stage + 1)} / {pad(count)}
      </p>
      <h2 className="font-display text-5xl leading-none font-light sm:text-6xl">{flower.nameMn}</h2>
      <p className="mt-3 text-xs tracking-[0.3em] text-ivory/50 uppercase">{flower.nameEn}</p>
      <p className="mt-6 text-ivory/60">{flower.meaning}</p>
      <p className="mt-8 font-display text-3xl text-gold-soft">
        {formatPrice(smallest.price)}
        <span className="ml-2 font-sans text-xs tracking-[0.2em] text-ivory/45 uppercase">
          {smallest.size} · {smallest.stems} ш
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
          className="group mt-10 flex items-center justify-between border-t border-ivory/10 pt-6 text-xs tracking-[0.25em] text-ivory/75 uppercase transition-colors duration-500 hover:text-blush-100"
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
