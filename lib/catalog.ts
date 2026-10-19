import type { BouquetSize, Flower, FlowerCategory, FlowerSlug, Occasion } from "@/data/flowers";
import type { CoverImage } from "@/lib/data";

/* ───────────── Нөөц ───────────── */

export type StockStatus = "in" | "low" | "out";

export const LOW_STOCK = 50;

/** Хамгийн жижиг баглаа хийх иш үлдээгүй бол «дууссан» */
export function getStockStatus(stock: number, minStems: number): StockStatus {
  if (stock < minStems) return "out";
  return stock < LOW_STOCK ? "low" : "in";
}

export const stockLabels: Record<StockStatus, string> = {
  in: "Бэлэн",
  low: "Цөөн үлдсэн",
  out: "Дууссан",
};

/* ───────────── Өнгөний бүлэг ───────────── */

/** Цэцгийн өнгөний нэрсийг шүүлтүүрийн бүлэгт нэгтгэнэ — chip-ийн өнгө нь бүлгийн төлөөлөл */
export const colorFamilies = [
  { id: "white", label: "Цагаан", hex: "#F6F1E7", names: ["Цагаан", "Цөцгий"] },
  { id: "pink", label: "Ягаан", hex: "#EBA3B6", names: ["Цайвар ягаан", "Ягаан", "Тод ягаан", "Ягаан толботой", "Гүн ягаан"] },
  { id: "red", label: "Улаан", hex: "#A8233A", names: ["Улаан", "Гүн улаан", "Хар хүрэн ягаан"] },
  { id: "peach", label: "Тоорын", hex: "#F2A27E", names: ["Тоорын", "Шаргал ягаан", "Улбар шар"] },
  { id: "yellow", label: "Шар", hex: "#F2C94C", names: ["Шар", "Алтан шар", "Шаргал"] },
  { id: "purple", label: "Голт бор", hex: "#A98BCB", names: ["Голт бор", "Лаванда"] },
  { id: "blue", label: "Цэнхэр", hex: "#7184C4", names: ["Цэнхэр", "Хөх ягаан"] },
  { id: "green", label: "Ногоон", hex: "#C9DBB0", names: ["Цайвар ногоон"] },
] as const;

export type ColorFamilyId = (typeof colorFamilies)[number]["id"];

const familyByName = new Map<string, ColorFamilyId>(
  colorFamilies.flatMap((f) => f.names.map((n) => [n, f.id] as const)),
);

/* ───────────── Хайлт: кирилл ↔ латин ───────────── */

const cyrillicToLatin: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e",
  ю: "yu", я: "ya",
};

const transliterate = (text: string) =>
  [...text.toLowerCase()].map((ch) => cyrillicToLatin[ch] ?? ch).join("");

/**
 * Хайлтын түлхүүр: кириллийг латин болгож, монголчуудын латин бичлэгийн хувилбаруудыг нэгтгэнэ
 * (kh/x → h, ts → c, y → i, давхар үсэг → нэг). Ингэснээр «Цээнэ», «цээнэ», «tseene», «tsene»
 * бүгд нэг түлхүүрт хүрнэ; «Peony», «PEONY», «пеони» мөн адил.
 */
export function searchKey(text: string): string {
  return transliterate(text)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, "")
    .replace(/kh|x/g, "h")
    .replace(/ts/g, "c")
    .replace(/y/g, "i")
    .replace(/w/g, "v")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** URL-д ээлтэй латин id: «хурган цэцэг» → «hurgan-tsetseg» */
export const slugify = (text: string) =>
  transliterate(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ───────────── Каталогийн мөр ───────────── */

/** Server → client дамжуулах нимгэн өгөгдөл (тайлбар, арчилгааны текстгүй) */
export type CatalogItem = {
  slug: FlowerSlug;
  nameMn: string;
  nameEn: string;
  latinName: string;
  category: FlowerCategory;
  occasions: Occasion[];
  colorFamilies: ColorFamilyId[];
  /** Зураггүй үед gradient */
  swatch: [string, string];
  startingPrice: number;
  smallest: { size: BouquetSize; stems: number };
  stock: number;
  popularity: number;
  addedAt: string;
  cover: CoverImage | null;
  /** Hover дээр шилжих 2 дахь зураг */
  alt: CoverImage | null;
  searchKey: string;
};

export function toCatalogItem(flower: Flower, cover: CoverImage | null): CatalogItem {
  const smallest = flower.pricing.sizes.reduce((a, b) => (b.price < a.price ? b : a));
  const families = new Set(flower.colors.map((c) => familyByName.get(c.name)).filter((f) => f !== undefined));
  return {
    slug: flower.slug,
    nameMn: flower.nameMn,
    nameEn: flower.nameEn,
    latinName: flower.latinName,
    category: flower.category,
    occasions: flower.occasions,
    colorFamilies: colorFamilies.map((f) => f.id).filter((id) => families.has(id)),
    swatch: [flower.colors[0].hex, flower.colors.at(-1)!.hex],
    startingPrice: smallest.price,
    smallest: { size: smallest.size, stems: smallest.stems },
    stock: flower.pricing.stock,
    popularity: flower.popularity,
    addedAt: flower.addedAt,
    cover,
    alt: flower.images[1] ?? null,
    searchKey: searchKey([flower.nameMn, flower.nameEn, flower.latinName, flower.category].join(" ")),
  };
}

/* ───────────── Шүүлтүүрийн state ↔ URL ───────────── */

export const sortOptions = [
  { id: "popular", label: "Эрэлттэй" },
  { id: "price-asc", label: "Үнэ ↑" },
  { id: "price-desc", label: "Үнэ ↓" },
  { id: "new", label: "Шинэ" },
] as const;

export type SortId = (typeof sortOptions)[number]["id"];

export type CatalogFilters = {
  q: string;
  types: string[];
  colors: string[];
  occasions: string[];
  /** null = хязгааргүй */
  min: number | null;
  max: number | null;
  inStock: boolean;
  sort: SortId;
};

export const emptyFilters: CatalogFilters = {
  q: "",
  types: [],
  colors: [],
  occasions: [],
  min: null,
  max: null,
  inStock: false,
  sort: "popular",
};

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);
const num = (value: string | null) => {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** URL: ?q=&type=a,b&color=pink&occasion=hurim&min=40000&max=90000&stock=1&sort=price-asc */
export function parseFilters(params: Pick<URLSearchParams, "get">): CatalogFilters {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    types: list(params.get("type")),
    colors: list(params.get("color")),
    occasions: list(params.get("occasion")),
    min: num(params.get("min")),
    max: num(params.get("max")),
    inStock: params.get("stock") === "1",
    sort: sortOptions.some((o) => o.id === sort) ? (sort as SortId) : "popular",
  };
}

export function serializeFilters(f: CatalogFilters): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.types.length) params.set("type", f.types.join(","));
  if (f.colors.length) params.set("color", f.colors.join(","));
  if (f.occasions.length) params.set("occasion", f.occasions.join(","));
  if (f.min !== null) params.set("min", String(f.min));
  if (f.max !== null) params.set("max", String(f.max));
  if (f.inStock) params.set("stock", "1");
  if (f.sort !== "popular") params.set("sort", f.sort);
  // URLSearchParams нь «,»-г %2C болгодог — хуваалцах холбоос цэвэрхэн харагдах
  return params.toString().replace(/%2C/g, ",");
}

/** Эрэмбээс бусад идэвхтэй шүүлтүүрийн тоо (mobile товчны badge) */
export function countActive(f: CatalogFilters): number {
  return (
    f.types.length +
    f.colors.length +
    f.occasions.length +
    (f.min !== null || f.max !== null ? 1 : 0) +
    (f.inStock ? 1 : 0)
  );
}

export const hasAnyFilter = (f: CatalogFilters) => countActive(f) > 0 || f.q.trim() !== "";

export function applyFilters(items: CatalogItem[], f: CatalogFilters): CatalogItem[] {
  const tokens = searchKey(f.q).split(" ").filter(Boolean);
  const result = items.filter(
    (item) =>
      tokens.every((t) => item.searchKey.includes(t)) &&
      (!f.types.length || f.types.includes(slugify(item.category))) &&
      (!f.colors.length || item.colorFamilies.some((c) => f.colors.includes(c))) &&
      (!f.occasions.length || item.occasions.some((o) => f.occasions.includes(slugify(o)))) &&
      (f.min === null || item.startingPrice >= f.min) &&
      (f.max === null || item.startingPrice <= f.max) &&
      (!f.inStock || item.stock >= item.smallest.stems),
  );
  const compare: Record<SortId, (a: CatalogItem, b: CatalogItem) => number> = {
    popular: (a, b) => b.popularity - a.popularity,
    "price-asc": (a, b) => a.startingPrice - b.startingPrice,
    "price-desc": (a, b) => b.startingPrice - a.startingPrice,
    new: (a, b) => b.addedAt.localeCompare(a.addedAt),
  };
  return result.sort(compare[f.sort]);
}
