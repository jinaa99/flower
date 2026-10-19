import { greenery as greeneryOptions, papers } from "@/data/bouquet";
import type { BouquetSize, Flower, FlowerColor, FlowerSlug } from "@/data/flowers";
import type { CoverImage } from "@/lib/data";
import { deliveryFee, FREE_DELIVERY_FROM } from "@/lib/delivery";
import type { CartItem, CustomBouquet } from "@/lib/store";

/** Нэг мөрийн дээд тоо (дэлгэрэнгүй хуудасны «Тоо ширхэг»-тэй ижил) */
export const MAX_QUANTITY = 10;

/** Server → client: сагсыг харуулж, үнэлэхэд хэрэгтэй нимгэн каталог */
export type CartFlower = {
  slug: FlowerSlug;
  nameMn: string;
  nameEn: string;
  colors: FlowerColor[];
  sizes: { size: BouquetSize; stems: number; price: number }[];
  stock: number;
  thumb: { src: string; color?: string } | null;
};

export function toCartFlower(flower: Flower, cover: CoverImage | null): CartFlower {
  return {
    slug: flower.slug,
    nameMn: flower.nameMn,
    nameEn: flower.nameEn,
    colors: flower.colors,
    sizes: flower.pricing.sizes,
    stock: flower.pricing.stock,
    thumb: cover ? { src: cover.src, color: cover.color } : null,
  };
}

export type CartLine = {
  key: string;
  kind: "flower" | "bouquet";
  /** Энгийн баглаа: slug + хэмжээ; custom баглаа: id */
  ref: { slug: FlowerSlug; size: BouquetSize } | { id: string };
  href: string | null;
  title: string;
  detail: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  thumb: CartFlower["thumb"];
  /** Custom баглааны зураггүй дүрслэл — сонгосон цэцгүүдийн өнгө */
  swatches: string[];
};

/**
 * Store-ийн мөрүүдийг каталогтой холбож харуулах мөр болгоно. Каталогоос алга болсон
 * цэцэг/хэмжээ алгасагдана. Custom баглааны үнэ нь store-д хадгалсан snapshot.
 */
export function cartLines(
  items: readonly CartItem[],
  bouquets: readonly CustomBouquet[],
  catalog: ReadonlyMap<string, CartFlower>,
): CartLine[] {
  const lines: CartLine[] = [];

  for (const item of items) {
    const flower = catalog.get(item.slug);
    const size = flower?.sizes.find((s) => s.size === item.size);
    if (!flower || !size) continue;
    lines.push({
      key: `${item.slug}:${item.size}`,
      kind: "flower",
      ref: { slug: item.slug as FlowerSlug, size: item.size },
      href: `/flowers/${item.slug}`,
      title: `${flower.nameMn} · ${flower.nameEn}`,
      detail: `${item.size} баглаа · ${size.stems} иш`,
      unitPrice: size.price,
      quantity: item.quantity,
      maxQuantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(flower.stock / size.stems))),
      thumb: flower.thumb,
      swatches: [],
    });
  }

  for (const b of bouquets) {
    const stems = b.stems.filter((s) => catalog.has(s.slug) && s.count > 0);
    if (!stems.length) continue;
    const bySlug = new Map<string, number>();
    for (const s of stems) bySlug.set(s.slug, (bySlug.get(s.slug) ?? 0) + s.count);
    const stemCount = stems.reduce((sum, s) => sum + s.count, 0);
    const paper = papers.find((p) => p.id === b.paper);
    const greens = greeneryOptions.filter((g) => (b.greenery[g.id] ?? 0) > 0).map((g) => g.nameMn.toLowerCase());
    const flowersText = [...bySlug].map(([slug, n]) => `${catalog.get(slug)!.nameMn} ${n}`).join(", ");
    const maxBySlug = Math.min(...[...bySlug].map(([slug, n]) => Math.floor(catalog.get(slug)!.stock / n)));
    lines.push({
      key: b.id,
      kind: "bouquet",
      ref: { id: b.id },
      href: null,
      title: "Өөрийн баглаа",
      detail: [`${stemCount} иш: ${flowersText}`, greens.join(", "), paper && `${paper.name} цаас`]
        .filter(Boolean)
        .join(" · "),
      unitPrice: b.price,
      quantity: b.quantity,
      maxQuantity: Math.max(1, Math.min(MAX_QUANTITY, maxBySlug)),
      thumb: null,
      swatches: [...new Set(stems.map((s) => catalog.get(s.slug)!.colors[s.color]?.hex).filter((h) => h !== undefined))],
    });
  }

  return lines;
}

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Үнэгүй хүргэлт хүртэл дутуу дүн (0 бол үнэгүй) */
  freeDeliveryGap: number;
};

export function cartTotals(lines: readonly Pick<CartLine, "unitPrice" | "quantity">[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const fee = deliveryFee(subtotal);
  return {
    subtotal,
    deliveryFee: fee,
    total: subtotal + fee,
    freeDeliveryGap: fee > 0 ? FREE_DELIVERY_FROM - subtotal : 0,
  };
}

/** Сагсанд цэцэг тус бүрээр нөөцлөгдсөн иш (энгийн баглаа + custom баглаа) */
export function stemsInCart(
  items: readonly CartItem[],
  bouquets: readonly Pick<CustomBouquet, "stems" | "quantity">[],
  catalog: ReadonlyMap<string, CartFlower>,
): Map<string, number> {
  const map = new Map<string, number>();
  const put = (slug: string, n: number) => map.set(slug, (map.get(slug) ?? 0) + n);
  for (const i of items) {
    put(i.slug, (catalog.get(i.slug)?.sizes.find((s) => s.size === i.size)?.stems ?? 0) * i.quantity);
  }
  for (const b of bouquets) for (const s of b.stems) put(s.slug, s.count * b.quantity);
  return map;
}
