/**
 * Unsplash-аас цэцэг бүрд 2–3 зураг хайж, local хуулбар татаж, attribution-ийг
 * `data/flowerImages.ts` руу бичнэ (flowers.ts үүнийг `images` болгон импортолдог).
 *
 *   npm run images:fetch                     # зураггүй цэцгүүд
 *   npm run images:fetch -- --only=rose,iris # заасан цэцгүүд
 *   npm run images:fetch -- --force          # бүгдийг дахин
 *   npm run images:fetch -- --count=2        # цэцэг бүрд 2 зураг
 *
 * `.env.local`: UNSPLASH_ACCESS_KEY=… (заавал), UNSPLASH_APP_NAME=… (utm_source, анхдагч "flower").
 *
 * Unsplash API Guidelines:
 * - Сайт зургийг `images.unsplash.com`-оос hotlink хийнэ (`src` = photo.urls.raw, ixid-тэй).
 *   Local хуулбар (`local`) нь зөвхөн хөгжүүлэлт / offline-д.
 * - Зураг бүрийг ашиглахаар сонгоход download endpoint-ийг (links.download_location) trigger хийнэ.
 * - Attribution: гэрэл зурагчин + Unsplash, хоёулаа utm_source / utm_medium=referral-тэй холбоос.
 *
 * Demo түлхүүр цагт 50 API хүсэлттэй: цэцэг бүр 1 хайлт + зураг бүрд 1 download trigger.
 * Хязгаарт хүрвэл хадгалаад зогсоно — дахин ажиллуулахад зураггүй цэцгүүдээс үргэлжилнэ.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { flowers, type Flower, type FlowerImage, type FlowerSlug } from "../data/flowers.ts";
import { flowerImages } from "../data/flowerImages.ts";

const API = "https://api.unsplash.com";
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public/images/flowers");
const DATA_FILE = path.join(ROOT, "data/flowerImages.ts");
/** Local хуулбарын хэмжээ — 3D texture, бүтэн дэлгэцэнд хангалттай */
const LOCAL_WIDTH = 2400;
const MIN_WIDTH = 1600;

/** Англи нэр давхар утгатай (iris = нүдний солонгон бүрхэвч гэх мэт) цэцгүүдийн хайлт */
const QUERIES: Partial<Record<FlowerSlug, string>> = {
  peony: "pink peony flowers",
  rose: "red roses bouquet",
  "spray-rose": "spray roses bouquet",
  lily: "lilium martagon",
  "oriental-lily": "oriental lily stargazer",
  orchid: "phalaenopsis orchid",
  iris: "purple iris flower",
  lilac: "lilac blossom",
  calla: "calla lily flower",
  lisianthus: "lisianthus flowers",
  gypsophila: "baby's breath flowers",
};

/**
 * Хайлтад гарсан ч тохирохгүй зургууд (Unsplash photo ID — URL-ийн сүүлийн 11 тэмдэгт).
 * Нэмээд `--only=slug`-аар дахин татна.
 */
const EXCLUDE = new Set([
  "VWyEyTdyoaM", // lily: бар сараана (L. lancifolium), martagon биш
  "8IA-1osFGWQ", // lily: шар толботой сараана, martagon биш
  "vPH_TRbZdTU", // lily: ботаникийн зураг, гэрэл зураг биш
  "iMdsjoiftZo", // chrysanthemum: будсан солонгон өнгөтэй
  "K3x_AkLVTAo", // peony: гвоздик шиг — цээнэ биш
  "sycOtFg3SBc", // spray-rose: холимог том сарнай
  "UMH92TvHEz0", // spray-rose: ганц ишт энгийн сарнай
]);

type Photo = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  premium?: boolean;
  plus?: boolean;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
};

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const value = (name: string) => flag(name)?.split("=")[1];

const KEY = process.env.UNSPLASH_ACCESS_KEY;
const APP = process.env.UNSPLASH_APP_NAME || "flower";
const COUNT = Math.min(Math.max(Number(value("count") ?? 3), 1), 3);
const FORCE = !!flag("force");
const ONLY = value("only")?.split(",") as FlowerSlug[] | undefined;

if (!KEY) {
  console.error("UNSPLASH_ACCESS_KEY олдсонгүй. .env.local-д нэмнэ үү: UNSPLASH_ACCESS_KEY=…");
  console.error("Түлхүүр: https://unsplash.com/oauth/applications");
  process.exit(1);
}

const utm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${encodeURIComponent(APP)}&utm_medium=referral`;

class RateLimitError extends Error {}

let remaining = Infinity;

async function api<T>(url: string): Promise<T> {
  const res = await fetch(url.startsWith("http") ? url : `${API}${url}`, {
    headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" },
  });
  const left = res.headers.get("x-ratelimit-remaining");
  if (left !== null) remaining = Number(left);
  if (res.status === 401) throw new Error("Unsplash: түлхүүр буруу (401).");
  if (res.status === 403 && remaining === 0) throw new RateLimitError("Цагийн хязгаарт хүрлээ.");
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Эхний зураг хэвтээ (нүүрний бүтэн дэлгэц, 3D dissolve), бусад нь ямар ч чиглэлтэй */
function pick(results: Photo[]): Photo[] {
  const usable = results.filter((p) => !p.premium && !p.plus && !EXCLUDE.has(p.id) && p.width >= MIN_WIDTH);
  const first = usable.find((p) => p.width >= p.height * 1.2) ?? usable[0];
  if (!first) return [];
  return [first, ...usable.filter((p) => p.id !== first.id)].slice(0, COUNT);
}

async function download(photo: Photo, file: string) {
  const url = new URL(photo.urls.raw);
  url.searchParams.set("w", String(LOCAL_WIDTH));
  url.searchParams.set("q", "80");
  url.searchParams.set("fm", "jpg");
  url.searchParams.set("fit", "max");
  // images.unsplash.com (CDN) — API-ийн хязгаарт тооцогдохгүй
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Зураг татаж чадсангүй (${res.status}): ${photo.id}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function fetchFlower(flower: Flower): Promise<FlowerImage[]> {
  const query = QUERIES[flower.slug] ?? `${flower.nameEn} flower`;
  const params = new URLSearchParams({ query, per_page: "20", content_filter: "high", order_by: "relevant" });
  const { results } = await api<{ results: Photo[] }>(`/search/photos?${params}`);
  const photos = pick(results);
  if (photos.length === 0) {
    console.warn(`  ! «${query}» — тохирох зураг олдсонгүй`);
    return [];
  }

  const images: FlowerImage[] = [];
  for (const [i, photo] of photos.entries()) {
    if (remaining < 1) throw new RateLimitError("Цагийн хязгаарт хүрлээ.");
    // Guideline: зургийг ашиглахаар сонгоход download-ийг бүртгүүлнэ
    await api(photo.links.download_location);

    const n = i + 1;
    const name = `${flower.slug}-${n}.jpg`;
    await download(photo, path.join(OUT_DIR, name));
    images.push({
      src: photo.urls.raw,
      local: `/images/flowers/${name}`,
      alt: n === 1 ? `${flower.nameMn} цэцэг` : `${flower.nameMn} цэцэг, ${n}-р зураг`,
      width: photo.width,
      height: photo.height,
      color: photo.color ?? flower.colors[0].hex,
      photographer: { name: photo.user.name, url: utm(photo.user.links.html) },
      unsplashUrl: utm(photo.links.html),
    });
    console.log(`  ✓ ${name} — ${photo.user.name}`);
  }
  return images;
}

async function save(images: Partial<Record<FlowerSlug, FlowerImage[]>>) {
  // flowers.ts-ийн дарааллаар — git diff тогтвортой
  const ordered = Object.fromEntries(flowers.filter((f) => images[f.slug]).map((f) => [f.slug, images[f.slug]]));
  const body = `// Энэ файлыг \`npm run images:fetch\` (scripts/fetch-unsplash.ts) үүсгэнэ — гараар бүү засаарай.
import type { FlowerImage, FlowerSlug } from "./flowers.ts";

export const flowerImages: Partial<Record<FlowerSlug, FlowerImage[]>> = ${JSON.stringify(ordered, null, 2)};
`;
  await writeFile(DATA_FILE, body);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const images = { ...flowerImages };
  const queue = flowers.filter((f) => (ONLY ? ONLY.includes(f.slug) : FORCE || !images[f.slug]?.length));
  if (queue.length === 0) {
    console.log("Бүх цэцэг зурагтай. Дахин татах бол --force эсвэл --only=slug.");
    return;
  }

  let done = 0;
  for (const flower of queue) {
    // 1 хайлт + COUNT download trigger
    if (remaining < 1 + COUNT) {
      console.warn(`\nAPI-ийн хязгаар (${remaining} үлдсэн). Нэг цагийн дараа дахин ажиллуулна уу — үргэлжилнэ.`);
      break;
    }
    console.log(`${flower.nameMn} (${flower.slug})`);
    try {
      const result = await fetchFlower(flower);
      if (result.length > 0) {
        images[flower.slug] = result;
        await save(images);
        done++;
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`\n${error.message} Нэг цагийн дараа дахин ажиллуулна уу — үргэлжилнэ.`);
        break;
      }
      throw error;
    }
  }
  console.log(`\n${done}/${queue.length} цэцэг шинэчлэгдлээ → data/flowerImages.ts`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
