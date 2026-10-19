import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { flowerDepth } from "@/data/flowerDepth";
import { flowerImages } from "@/data/flowerImages";
import type { BouquetSize, Flower, FlowerImage, FlowerSlug } from "@/data/flowers";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { journeyStops, type StoryBeat } from "@/data/journey";
import { toCartFlower, type CartFlower } from "@/lib/cart";
import { db } from "@/lib/db";
import type { SlotInfo } from "@/lib/delivery";

/*
 * Каталог DB-ээс (Prisma). Бүх уншилт нэг cache entry-гээр — 19 цэцэг жижиг тул шүүлт,
 * хайлтыг санах ойд хийнэ. Admin засахад `updateTag`, захиалга нөөц хасахад `revalidateTag`.
 * Зураг (`flowerImages.ts`), 3D spec, journey нь кодонд үлдэж slug-аар нэгдэнэ.
 */
export const FLOWERS_TAG = "flowers";
export const SLOTS_TAG = "delivery-slots";

/** Cache-гүй уншилт — захиалгын үнэ, нөөцийг (instance бүрийн cache-ээс биш) DB-ээс шууд шалгахад */
export async function getFlowersFresh(): Promise<Flower[]> {
  const rows = await db.flower.findMany({
    include: { variants: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    slug: r.slug as FlowerSlug,
    nameMn: r.nameMn,
    nameEn: r.nameEn,
    latinName: r.latinName,
    category: r.category as Flower["category"],
    colors: r.colors as Flower["colors"],
    origin: r.origin,
    meaning: r.meaning,
    occasions: r.occasions as Flower["occasions"],
    care: r.care as Flower["care"],
    pricing: {
      sizes: r.variants.map((v) => ({ size: v.size as BouquetSize, stems: v.stems, price: v.price })),
      stock: r.stock,
      deliveryNote: r.deliveryNote,
    },
    popularity: r.popularity,
    addedAt: r.addedAt.toISOString().slice(0, 10),
    images: flowerImages[r.slug as FlowerSlug] ?? [],
    relatedSlugs: r.relatedSlugs as FlowerSlug[],
    pairsWithSlugs: r.pairsWithSlugs as FlowerSlug[],
  }));
}

async function loadFlowers(): Promise<Flower[]> {
  "use cache";
  cacheTag(FLOWERS_TAG);
  cacheLife("hours");
  return getFlowersFresh();
}

export async function getFlowers(): Promise<Flower[]> {
  return loadFlowers();
}

export async function getFlower(slug: string): Promise<Flower | undefined> {
  return (await loadFlowers()).find((f) => f.slug === slug);
}

const pick = (flowers: Flower[], slugs: readonly FlowerSlug[]) =>
  slugs.map((s) => flowers.find((f) => f.slug === s)).filter((f): f is Flower => !!f);

/** Идэвхтэй хүргэлтийн завсрууд — client-ийн өдөр/цаг сонголт, серверийн шалгалт хоёулаа */
export async function getDeliverySlots(): Promise<SlotInfo[]> {
  "use cache";
  cacheTag(SLOTS_TAG);
  cacheLife("hours");
  return getDeliverySlotsFresh();
}

export async function getDeliverySlotsFresh(): Promise<SlotInfo[]> {
  const rows = await db.deliverySlot.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((s) => ({ id: s.id, label: s.label, end: s.endHour }));
}

/** Хамгийн бага баглааны үнэ — «…₮-аас» */
export function getStartingPrice(flower: Flower): number {
  return Math.min(...flower.pricing.sizes.map((s) => s.price));
}

/** Харуулах зураг: Unsplash-ийн эхний зураг, эсвэл (script ажиллаагүй үед) аяллын placeholder */
export type CoverImage = Pick<FlowerImage, "src" | "alt" | "width" | "height"> &
  Partial<Pick<FlowerImage, "color" | "photographer" | "unsplashUrl">>;

const placeholders: Partial<Record<FlowerSlug, CoverImage>> = Object.fromEntries(
  journeyStops.map((s) => [
    s.slug,
    { src: `/images/${s.slug}.webp`, alt: "", width: 2400, height: 1600 } satisfies CoverImage,
  ]),
);

export function getCoverImage(flower: Flower): CoverImage | null {
  const image = flower.images[0];
  if (image) return image;
  const placeholder = placeholders[flower.slug];
  return placeholder ? { ...placeholder, alt: `${flower.nameMn} цэцэг` } : null;
}

/** Зургийн depth map (2.5D parallax) — `npm run images:depth`; үүсгээгүй бол null */
export function getDepthMap(slug: string, index: number): string | null {
  return flowerDepth[slug as FlowerSlug]?.[index] ?? null;
}

/** 3D загвартай бол (одоогоор нүүрний аяллын цэцгүүд) FlowerSpec, үгүй бол null */
export function getFlowerSpec(flower: Flower): FlowerSpec | null {
  const stop = journeyStops.find((s) => s.slug === flower.slug);
  const cover = getCoverImage(flower);
  return stop && cover ? { ...stop.spec, image: cover.src } : null;
}

const CAROUSEL_SIZE = 6;

/** Гараар сонгосныг эхэнд, дараа нь онооны дагуу бусдаар `CAROUSEL_SIZE` хүртэл дүүргэнэ */
async function fill(
  flower: Flower,
  curated: readonly FlowerSlug[],
  score: (other: Flower) => number,
): Promise<Flower[]> {
  const flowers = await loadFlowers();
  const picked = pick(flowers, curated).filter((f) => f.slug !== flower.slug);
  const rest = flowers
    .filter((f) => f.slug !== flower.slug && !picked.includes(f))
    .map((f) => ({ f, s: score(f) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.f.popularity - a.f.popularity)
    .map(({ f }) => f);
  return [...picked, ...rest].slice(0, CAROUSEL_SIZE);
}

const overlap = <T,>(a: readonly T[], b: readonly T[]) => a.filter((x) => b.includes(x)).length;

/** «Ойролцоо цэцэг»: relatedSlugs → ижил төрөл, тохиолдол, өнгө давхцсан */
export function getNearbyFlowers(flower: Flower): Promise<Flower[]> {
  const colors = flower.colors.map((c) => c.name);
  return fill(
    flower,
    flower.relatedSlugs,
    (f) =>
      (f.category === flower.category ? 3 : 0) +
      overlap(f.occasions, flower.occasions) +
      overlap(
        f.colors.map((c) => c.name),
        colors,
      ),
  );
}

/** «Хамт тохирох»: pairsWithSlugs → энэ цэцгийг өөрийн хослолд нэрлэсэн цэцгүүд */
export function getPairingFlowers(flower: Flower): Promise<Flower[]> {
  return fill(flower, flower.pairsWithSlugs, (f) => (f.pairsWithSlugs.includes(flower.slug) ? 1 : 0));
}

export type JourneyFlower = {
  flower: Flower;
  story: readonly StoryBeat[];
  spec: FlowerSpec;
  cover: CoverImage;
};

/** Нүүрний 3D аялал: каталогийн мэдээлэл + 3D spec + dissolve-ийн зураг */
export async function getJourney(): Promise<JourneyFlower[]> {
  const flowers = await loadFlowers();
  return journeyStops.map((stop) => {
    const flower = flowers.find((f) => f.slug === stop.slug)!;
    const cover = getCoverImage(flower)!;
    return { flower, story: stop.story, spec: { ...stop.spec, image: cover.src }, cover };
  });
}

/** Сагс (drawer, /cart, /checkout)-д дамжуулах нимгэн каталог */
export async function getCartCatalog(): Promise<CartFlower[]> {
  return toCartCatalog(await loadFlowers());
}

export const toCartCatalog = (flowers: Flower[]): CartFlower[] => flowers.map((f) => toCartFlower(f, getCoverImage(f)));
