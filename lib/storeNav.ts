import { colorFamilies, inSeason, slugify, type CatalogItem, type ColorFamilyId } from "./catalog";
import type { CoverImage } from "./data";
import { capitalize } from "./utils";

/**
 * Дэлгүүрийн навигацын өгөгдөл (Header-ийн «Дэлгүүр» цэс, mobile цэс, каталогийн ангилал, хайлт)
 * — бүгд каталогийн мөрөөс тооцогдоно, тусдаа жагсаалт хадгалахгүй. Холбоосууд нь каталогийн
 * URL шүүлтүүр (`?type=`, `?occasion=`, `?color=`).
 */

export type NavCategory = {
  id: string;
  label: string;
  count: number;
  /** Тухайн төрлийн хамгийн эрэлттэй цэцгийн өөрийн зураг — сарнай ангилалд сарнай */
  image: CoverImage | null;
  /** Ижил цэцгийн 2 дахь зураг — каталогийн сүлжээнд гарах нүүр зурагтай давхардахгүй */
  altImage: CoverImage | null;
  href: string;
};

export type NavOccasion = { id: string; label: string; count: number; href: string };
export type NavColor = { id: ColorFamilyId; label: string; hex: string; count: number; href: string };

export type StoreNav = {
  categories: NavCategory[];
  occasions: NavOccasion[];
  colors: NavColor[];
  /** Энэ сард улиралдаа байгаа цэцэг (байхгүй бол эрэлттэй, жилийн турш байдаг) */
  seasonal: { title: string; items: CatalogItem[] };
};

const byPopularity = (a: CatalogItem, b: CatalogItem) => b.popularity - a.popularity;

export function buildStoreNav(items: CatalogItem[], month: number): StoreNav {
  const sorted = [...items].sort(byPopularity);

  const categoryMap = new Map<string, CatalogItem[]>();
  for (const item of sorted) categoryMap.set(item.category, [...(categoryMap.get(item.category) ?? []), item]);
  // Олон сонголттой, дараа нь эрэлттэй төрөл эхэнд (жагсаалт бүр popularity-аар эрэмбэлэгдсэн)
  const categories = [...categoryMap.entries()]
    .sort(([, a], [, b]) => b.length - a.length || b[0].popularity - a[0].popularity)
    .map(([category, list]) => {
      const id = slugify(category);
      return {
        id,
        label: capitalize(category),
        count: list.length,
        image: list.find((i) => i.cover)?.cover ?? null,
        altImage: list[0].alt ?? list[0].cover,
        href: `/catalog?type=${id}`,
      };
    });

  const occasionCount = new Map<string, number>();
  for (const o of items.flatMap((i) => i.occasions)) occasionCount.set(o, (occasionCount.get(o) ?? 0) + 1);
  const occasions = [...occasionCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([o, count]) => ({ id: slugify(o), label: capitalize(o), count, href: `/catalog?occasion=${slugify(o)}` }));

  const colors = colorFamilies
    .map((f) => ({
      id: f.id,
      label: f.label,
      hex: f.hex,
      count: items.filter((i) => i.colorFamilies.includes(f.id)).length,
      href: `/catalog?color=${f.id}`,
    }))
    .filter((c) => c.count > 0);

  const inSeasonNow = sorted.filter((i) => inSeason(i.season, month));
  const seasonal =
    inSeasonNow.length > 0
      ? { title: "Улиралдаа", items: inSeasonNow.slice(0, 3) }
      : { title: "Энэ сарын сонголт", items: sorted.filter((i) => i.season === null).slice(0, 3) };

  return { categories, occasions, colors, seasonal };
}
