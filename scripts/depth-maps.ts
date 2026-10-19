/**
 * Цэцгийн зургаас depth map гаргана (Depth Anything V2 small, transformers.js — local CPU).
 * 2.5D parallax (`components/ui/DepthPhoto.tsx`) эдгээрийг ашиглана.
 *
 *   npm run images:depth                 # бүх зураг (байгааг алгасна)
 *   npm run images:depth -- --only=rose  # зөвхөн нэг цэцэг
 *   npm run images:depth -- --force      # дахин үүсгэнэ
 *
 * Оролт: `images:fetch`-ийн татсан local хуулбар (public/images/flowers/{slug}-{n}.jpg).
 * Гаралт: public/images/depth/{slug}-{n}.webp (саарал: цагаан = ойр) + data/flowerDepth.ts.
 * Depth нь Unsplash-ийн зурагтай ижил харьцаатай (hotlink нь `fit=max` — тайрахгүй).
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline, RawImage } from "@huggingface/transformers";
import sharp from "sharp";
import { flowerImages } from "../data/flowerImages.ts";
import type { FlowerSlug } from "../data/flowers.ts";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/images/depth");
const MANIFEST = path.join(ROOT, "data/flowerDepth.ts");
/** Depth texture-ийн өргөн — parallax-д нарийн дэлгэрэнгүй хэрэггүй, зөөлөн нь ирмэг урахаас сэргийлнэ */
const WIDTH = 640;

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const force = args.includes("--force");

const estimator = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });

const manifest: Partial<Record<FlowerSlug, (string | null)[]>> = {};

for (const [slug, images] of Object.entries(flowerImages) as [FlowerSlug, (typeof flowerImages)[FlowerSlug]][]) {
  manifest[slug] = [];
  for (const [i, image] of (images ?? []).entries()) {
    const name = `${slug}-${i + 1}.webp`;
    const out = path.join(OUT_DIR, name);
    const publicPath = `/images/depth/${name}`;
    const skip = (only && !only.includes(slug)) || (!force && existsSync(out));
    const input = path.join(ROOT, "public", image.local);

    if (skip || !existsSync(input)) {
      manifest[slug]!.push(existsSync(out) ? publicPath : null);
      if (!skip) console.warn(`[depth] ${image.local} байхгүй — эхлээд npm run images:fetch`);
      continue;
    }

    const started = Date.now();
    const { depth } = (await estimator(await RawImage.read(input))) as { depth: RawImage };
    await mkdir(OUT_DIR, { recursive: true });
    await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: 1 } })
      .resize({ width: WIDTH })
      // Бага зэрэг бүдгэрүүлснээр объектын ирмэгт parallax «урагдахгүй»
      .blur(2.2)
      .normalise()
      .webp({ quality: 82 })
      .toFile(out);
    manifest[slug]!.push(publicPath);
    console.log(`[depth] ${name} (${Date.now() - started} ms)`);
  }
}

const body = `/**
 * Script-ийн үүсгэдэг (npm run images:depth) — гараар бүү засаарай.
 * Цэцгийн зураг (flowerImages-ийн индексээр) бүрийн depth map; null = үүсгээгүй.
 */
import type { FlowerSlug } from "./flowers.ts";

export const flowerDepth: Partial<Record<FlowerSlug, (string | null)[]>> = ${JSON.stringify(manifest, null, 2)};
`;
await writeFile(MANIFEST, body);
console.log(`[depth] ${path.relative(ROOT, MANIFEST)} шинэчлэгдлээ`);
