/**
 * Баглаа бүрдүүлэгчийн нэмэлт материал: ногоон навч, боодлын цаас, тууз.
 * Цэцгийн ишний үнэ `flowers.ts`-ийн баглааны үнээс бодогдоно (lib/bouquet.ts).
 *
 * Энэ файлыг script Node-оор шууд импортолж болохуйц: зөвхөн relative `.ts` импорт, төрөл `import type`.
 */

export type GreeneryId = "eucalyptus" | "ruscus" | "pistache" | "fern";

export type Greenery = {
  id: GreeneryId;
  nameMn: string;
  nameEn: string;
  /** Нэг ишний үнэ */
  price: number;
  /** Preview-ийн навчны өнгө */
  hex: string;
  /** Preview-ийн хэлбэр: coin — дугуй навчтай мөчир, blade — урт нарийн, frond — ойм, cluster — бөөн навч */
  shape: "coin" | "blade" | "frond" | "cluster";
};

export const greenery: Greenery[] = [
  { id: "eucalyptus", nameMn: "Эвкалипт", nameEn: "Eucalyptus", price: 3500, hex: "#8FA89B", shape: "coin" },
  { id: "ruscus", nameMn: "Рускус", nameEn: "Ruscus", price: 2500, hex: "#4F7A45", shape: "blade" },
  { id: "pistache", nameMn: "Фисташ навч", nameEn: "Pistache", price: 3000, hex: "#5E7F4A", shape: "cluster" },
  { id: "fern", nameMn: "Ойм", nameEn: "Fern", price: 2000, hex: "#6D9A52", shape: "frond" },
];

export type PaperId = "kraft" | "ivory" | "blush" | "sage" | "plum";

export type Paper = { id: PaperId; name: string; price: number; hex: string };

export const papers: Paper[] = [
  { id: "kraft", name: "Крафт", price: 6000, hex: "#C49A6C" },
  { id: "ivory", name: "Цөцгий", price: 9000, hex: "#F1E7D6" },
  { id: "blush", name: "Ягаан", price: 9000, hex: "#E8B4BC" },
  { id: "sage", name: "Ногоон саарал", price: 9000, hex: "#A7B59A" },
  { id: "plum", name: "Гүн нил", price: 12000, hex: "#5A2A48" },
];

export type RibbonId = "gold" | "ivory" | "blush" | "burgundy" | "sage";

export type Ribbon = { id: RibbonId; name: string; hex: string };

export const ribbons: Ribbon[] = [
  { id: "gold", name: "Алтлаг", hex: "#C9A87C" },
  { id: "ivory", name: "Цагаан", hex: "#F8F3EC" },
  { id: "blush", name: "Ягаан", hex: "#E8B4BC" },
  { id: "burgundy", name: "Бордо", hex: "#7A1F3D" },
  { id: "sage", name: "Ногоон", hex: "#8FA89B" },
];

/** Тууз + хийцийн үнэ (өнгөнөөс үл хамаарна) */
export const RIBBON_PRICE = 3000;
/** Картын бичвэрийн дээд урт */
export const CARD_MAX_LENGTH = 160;
/** Баглаанд байх цэцгийн ишний доод/дээд хэмжээ */
export const MIN_STEMS = 3;
export const MAX_STEMS = 60;
/** Нэг төрлийн ногоон навчны дээд тоо */
export const MAX_GREENERY = 10;
