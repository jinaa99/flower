"use client";

import { getImageProps } from "next/image";
import { useRef } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import type { JourneyFlower } from "@/lib/data";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";
import { useReveal } from "@/lib/useReveal";
import { cn } from "@/lib/utils";

/** 1×1 тунгалаг gif — 3D аялал харагдах үед энэ хувилбарын зургийг огт татахгүй */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Props = {
  stops: JourneyFlower[];
  /**
   * true: WebGL байхгүй (JS-ээр тогтоосон) — зургийг шууд ачаална.
   * false: зөвхөн reduced-motion үед CSS-ээр харагдана; бусад үед `<picture>` хоосон зураг сонгоно.
   */
  forced: boolean;
  className?: string;
};

/**
 * 3D-гүй нүүр (WebGL дэмжихгүй эсвэл prefers-reduced-motion): цэцэг бүрд бүтэн дэлгэцийн
 * бодит зураг, түүх, бүтээгдэхүүний карт. Хэсэг бүр дэлгэцэнд орохдоо зөөлөн тодорно
 * (`.reveal`, reduced motion-д зөвхөн opacity). Эхний зураг LCP тул fade-гүй, fetchPriority high.
 */
export function HomeStatic({ stops, forced, className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div ref={root} data-home="static" className={className}>
      {stops.map(({ flower, story, cover }, i) => {
        const beat = story[0];
        const [before, em, after] = beat.title;
        const Heading = i === 0 ? "h1" : "h2";
        return (
          <section
            key={flower.slug}
            className="relative isolate flex min-h-dvh items-end overflow-hidden pt-(--header-height) landscape:items-center"
            aria-label={`${flower.nameMn} · ${flower.nameEn}`}
          >
            <FlowerPicture cover={cover} first={i === 0} forced={forced} />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 landscape:bg-linear-to-r landscape:from-plum-950/85 landscape:via-plum-950/40 landscape:to-plum-950/10 portrait:bg-linear-to-t portrait:from-plum-950 portrait:via-plum-950/60 portrait:to-plum-950/10"
            />
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className={cn("max-w-2xl", i > 0 && "reveal")}>
                <p className="eyebrow mb-8">{beat.eyebrow}</p>
                <Heading className="font-display text-[2.75rem] leading-[1.02] font-extralight text-balance sm:text-7xl">
                  {before}
                  <em className="font-light text-blush-100">{em}</em>
                  {after}
                </Heading>
                <p className="mt-8 max-w-md text-lg text-ivory/70">{beat.body}</p>
              </div>
              <ProductCard flower={flower} stage={i} count={stops.length} cover={cover} className="reveal" />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FlowerPicture({ cover, first, forced }: { cover: JourneyFlower["cover"]; first: boolean; forced: boolean }) {
  const {
    props: { srcSet, sizes, alt, ...img },
  } = getImageProps({
    src: cover.src,
    alt: cover.alt,
    width: cover.width,
    height: cover.height,
    // Unsplash-ийн зураг: hotlink (Unsplash CDN-ээр хэмжээлнэ)
    loader: isUnsplash(cover.src) ? unsplashLoader : undefined,
    sizes: "100vw",
    quality: 75,
    loading: first ? "eager" : "lazy",
    fetchPriority: first ? "high" : "auto",
  });

  return (
    <picture>
      {/* 3D аялал харагдах үед (reduced motion биш, JS-тэй) энэ зургийг татахгүй */}
      {!forced && <source media="(prefers-reduced-motion: no-preference) and (scripting: enabled)" srcSet={BLANK} />}
      <source srcSet={srcSet} sizes={sizes} />
      <img
        {...img}
        alt={alt}
        className={cn("absolute inset-0 -z-20 h-full w-full object-cover", !first && "reveal")}
        style={{ backgroundColor: cover.color }}
      />
    </picture>
  );
}
