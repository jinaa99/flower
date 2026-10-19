"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DepthPhoto } from "@/components/ui/DepthPhoto";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { BouquetSize } from "@/data/flowers";
import type { CoverImage } from "@/lib/data";
import { useCart } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

export type SpotlightImage = CoverImage & { depth: string | null };

export type SpotlightData = {
  slug: string;
  nameMn: string;
  nameEn: string;
  meaning: string;
  facts: { label: string; value: string }[];
  smallest: { size: BouquetSize; stems: number; price: number };
  images: SpotlightImage[];
};

/**
 * Онцлох цэцэг: зүүн талд жижиг зургууд, төвд 2.5D (depth parallax) том зураг, баруун талд
 * утга, баримт, «Сагсанд нэмэх». Жижиг зураг дарахад гол зураг солигдоно.
 */
export function Spotlight({ data }: { data: SpotlightData }) {
  const [index, setIndex] = useState(0);
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const image = data.images[index];

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <section aria-labelledby="spotlight-title" className="relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_45%_50%,rgb(158_27_50/0.22),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[5.5rem_1.25fr_1fr] lg:items-center lg:gap-14">
        {/* Жижиг зургууд */}
        <ul className="order-2 flex gap-3 lg:order-none lg:flex-col" aria-label="Зургууд">
          {data.images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Зураг ${i + 1}`}
                aria-pressed={i === index}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-2xl border transition-all duration-500",
                  i === index ? "border-blush-300 shadow-glow" : "border-ivory/10 opacity-60 hover:opacity-100",
                )}
                style={{ backgroundColor: img.color }}
              >
                <FlowerPhoto src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>

        <figure className="relative">
          <div aria-hidden className="absolute -inset-6 rounded-[3rem] bg-blush-500/15 blur-3xl" />
          {image.depth ? (
            <DepthPhoto
              key={image.src}
              src={image.src}
              depth={image.depth}
              alt={image.alt}
              width={image.width}
              height={image.height}
              color={image.color}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="relative aspect-[4/5] rounded-[2.5rem] border border-ivory/10"
            />
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-ivory/10" style={{ backgroundColor: image.color }}>
              <FlowerPhoto src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
          <figcaption className="mt-4 flex items-center justify-between gap-4">
            <PhotoCredit image={image} />
            {image.depth && (
              <span className="text-[0.6rem] tracking-[0.3em] text-ivory/35 uppercase">2.5D · хулганаа хөдөлгө</span>
            )}
          </figcaption>
        </figure>

        <div className="order-3 lg:order-none">
          <p className="eyebrow mb-7">Онцлох цэцэг</p>
          <h2 id="spotlight-title" className="font-display text-6xl leading-none font-light sm:text-7xl">
            {data.nameMn}
          </h2>
          <p className="mt-3 text-xs tracking-[0.35em] text-ivory/50 uppercase">{data.nameEn}</p>
          <p className="mt-7 max-w-sm text-lg leading-relaxed text-ivory/65">{data.meaning}</p>

          <dl className="mt-10 divide-y divide-ivory/10 border-y border-ivory/10 text-sm">
            {data.facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-6 py-3.5">
                <dt className="text-ivory/50">{f.label}</dt>
                <dd className="text-right text-ivory/85">{f.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 font-display text-4xl text-gold-soft">
            {formatPrice(data.smallest.price)}
            <span className="ml-3 font-sans text-xs tracking-[0.2em] text-ivory/45 uppercase">
              {data.smallest.size} · {data.smallest.stems} иш
            </span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                add(data.slug, data.smallest.size);
                setAdded(true);
              }}
            >
              {added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"} {!added && <span aria-hidden>→</span>}
            </button>
            <Link href={`/flowers/${data.slug}`} className="btn-ghost">
              Дэлгэрэнгүй
            </Link>
          </div>
          <p aria-live="polite" className="sr-only">
            {added ? `${data.nameMn} сагсанд нэмэгдлээ` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
