/** Хүргэлт зөвхөн Улаанбаатар хот дотор — бүх цагийг тэндхийн цагаар тооцно */
const TIME_ZONE = "Asia/Ulaanbaatar";

/**
 * Хүргэлтийн завсрын анхны утга — `prisma/seed.ts` DB-ийн `DeliverySlot`-д оруулна.
 * Сайт DB-ээс уншина (`getDeliverySlots`); `capacity` — нэг өдөрт хүлээн авах захиалга.
 */
export const deliverySlots = [
  { id: "10-13", label: "10:00–13:00", start: 10, end: 13, capacity: 12 },
  { id: "13-16", label: "13:00–16:00", start: 13, end: 16, capacity: 12 },
  { id: "16-19", label: "16:00–19:00", start: 16, end: 19, capacity: 12 },
  { id: "19-22", label: "19:00–22:00", start: 19, end: 22, capacity: 12 },
] as const;

/** Server → client: идэвхтэй завсрууд (DB-ийн дарааллаар) */
export type SlotInfo = { id: string; label: string; end: number };

/** Баглаа бэлтгэж хүргэхэд завсар дуусахаас өмнө хэрэгтэй хугацаа (цаг) */
const PREP_HOURS = 2;
const DAYS_AHEAD = 7;

const weekdays = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type DeliveryDay = {
  /** YYYY-MM-DD */
  date: string;
  label: string;
  sublabel: string;
  slots: { id: string; label: string; available: boolean }[];
};

/** Өнөөдрөөс хойш 7 хоног; өнөөдрийн хоцорсон завсрууд идэвхгүй, бүгд хоцорсон бол өнөөдөр орохгүй */
export function getDeliveryDays(now: number, slotList: readonly SlotInfo[]): DeliveryDay[] {
  const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
  const hour = Number(p.hour) + Number(p.minute) / 60;
  const today = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));

  const days: DeliveryDay[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today + i * 86_400_000);
    const slots = slotList.map((s) => ({
      id: s.id,
      label: s.label,
      available: i > 0 || hour + PREP_HOURS <= s.end,
    }));
    if (!slots.some((s) => s.available)) continue;
    days.push({
      date: d.toISOString().slice(0, 10),
      label: i === 0 ? "Өнөөдөр" : i === 1 ? "Маргааш" : weekdays[d.getUTCDay()],
      sublabel: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      slots,
    });
  }
  return days;
}

/** Хүргэлтийн төлбөр — `FREE_DELIVERY_FROM`-оос дээш захиалгад үнэгүй */
export const DELIVERY_FEE = 8000;
export const FREE_DELIVERY_FROM = 150_000;

export const deliveryFee = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE);

/**
 * Хүргэлт хийх дүүрэг, хорооны тоо. «3 цагийн дотор» амлалт барихын тулд алслагдсан
 * дүүргүүд (Налайх, Багануур, Багахангай) ороогүй. Хорооны тоо засаг захиргааны
 * өөрчлөлтөөр солигддог тул шинэчилж байх хэрэгтэй.
 */
export const districts = [
  { name: "Баянгол", khoroo: 34 },
  { name: "Баянзүрх", khoroo: 43 },
  { name: "Сонгинохайрхан", khoroo: 43 },
  { name: "Сүхбаатар", khoroo: 20 },
  { name: "Хан-Уул", khoroo: 25 },
  { name: "Чингэлтэй", khoroo: 24 },
] as const;

export type District = (typeof districts)[number]["name"];

/** «2026-10-21» → «10-р сарын 21, Мягмар» */
export function formatDeliveryDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}-р сарын ${d.getUTCDate()}, ${weekdays[d.getUTCDay()]}`;
}
