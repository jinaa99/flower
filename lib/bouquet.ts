import {
  greenery as greeneryOptions,
  papers,
  ribbons,
  RIBBON_PRICE,
  type GreeneryId,
  type PaperId,
  type RibbonId,
} from "@/data/bouquet";
import type { Flower, FlowerCategory, FlowerColor, FlowerSlug } from "@/data/flowers";
import { formatPrice } from "@/lib/utils";

/** Нэг цэцгийн нэг өнгөний иш: color = flower.colors-ийн индекс */
export type StemLine = { slug: FlowerSlug; color: number; count: number };

export type BouquetConfig = {
  stems: StemLine[];
  greenery: Partial<Record<GreeneryId, number>>;
  paper: PaperId;
  ribbon: RibbonId;
  message: string;
};

/** Server → client: builder-т хэрэгтэй нимгэн өгөгдөл */
export type BuilderFlower = {
  slug: FlowerSlug;
  nameMn: string;
  nameEn: string;
  category: FlowerCategory;
  colors: FlowerColor[];
  stemPrice: number;
  stock: number;
  /** Баглааны хэмжээ бүрийн иш — сагсанд байгаа энгийн баглааны нөөцийг тооцоход */
  sizeStems: Record<string, number>;
  pairsWithSlugs: FlowerSlug[];
  popularity: number;
  thumb: { src: string; color?: string } | null;
};

/**
 * Нэг ишний үнэ: хамгийн том баглааны иш тутмын үнэ (хамгийн хямд нь — боодол тусдаа
 * тооцогдоно), 100₮ хүртэл дээш бөөрөнхийлнө.
 */
export function getStemPrice(flower: Flower): number {
  const largest = flower.pricing.sizes.reduce((a, b) => (b.stems > a.stems ? b : a));
  return Math.ceil(largest.price / largest.stems / 100) * 100;
}

export function toBuilderFlower(flower: Flower, thumb: BuilderFlower["thumb"]): BuilderFlower {
  return {
    slug: flower.slug,
    nameMn: flower.nameMn,
    nameEn: flower.nameEn,
    category: flower.category,
    colors: flower.colors,
    stemPrice: getStemPrice(flower),
    stock: flower.pricing.stock,
    sizeStems: Object.fromEntries(flower.pricing.sizes.map((s) => [s.size, s.stems])),
    pairsWithSlugs: flower.pairsWithSlugs,
    popularity: flower.popularity,
    thumb,
  };
}

export type PriceLine = { key: string; label: string; detail?: string; amount: number };

export function priceBouquet(config: BouquetConfig, flowers: ReadonlyMap<string, BuilderFlower>) {
  const lines: PriceLine[] = [];
  let stemCount = 0;
  for (const line of config.stems) {
    const flower = flowers.get(line.slug);
    if (!flower || line.count <= 0) continue;
    stemCount += line.count;
    lines.push({
      key: `${line.slug}:${line.color}`,
      label: `${flower.nameMn} · ${flower.colors[line.color]?.name ?? ""}`,
      detail: `${line.count} × ${formatPrice(flower.stemPrice)}`,
      amount: line.count * flower.stemPrice,
    });
  }
  for (const g of greeneryOptions) {
    const count = config.greenery[g.id] ?? 0;
    if (count > 0) lines.push({ key: g.id, label: g.nameMn, detail: `${count} × ${formatPrice(g.price)}`, amount: count * g.price });
  }
  const paper = papers.find((p) => p.id === config.paper)!;
  const ribbon = ribbons.find((r) => r.id === config.ribbon)!;
  lines.push({
    key: "wrap",
    label: "Боодол",
    detail: `${paper.name} цаас, ${ribbon.name.toLowerCase()} тууз`,
    amount: paper.price + RIBBON_PRICE,
  });
  if (config.message.trim()) lines.push({ key: "card", label: "Мэндчилгээний карт", amount: 0 });
  return { lines, stemCount, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

/** Цэцэг тус бүрээр баглаанд сонгосон нийт иш */
export function stemsBySlug(stems: readonly StemLine[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of stems) map.set(s.slug, (map.get(s.slug) ?? 0) + s.count);
  return map;
}

/**
 * «Хамт тохирох»: сонгосон цэцгүүдийн pairsWithSlugs-д олон удаа нэрлэгдсэнээс нь эхэлнэ,
 * аль хэдийн сонгосон болон нөөцгүйг алгасна.
 */
export function suggestPairings(selected: readonly string[], flowers: readonly BuilderFlower[], limit = 4): BuilderFlower[] {
  const votes = new Map<string, number>();
  for (const f of flowers) {
    if (!selected.includes(f.slug)) continue;
    for (const p of f.pairsWithSlugs) votes.set(p, (votes.get(p) ?? 0) + 1);
  }
  return flowers
    .filter((f) => votes.has(f.slug) && !selected.includes(f.slug) && f.stock > 0)
    .sort((a, b) => votes.get(b.slug)! - votes.get(a.slug)! || b.popularity - a.popularity)
    .slice(0, limit);
}
