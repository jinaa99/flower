/**
 * Баглаа бүрдүүлэгчийн бодит зурган «толгой»: цэцгийн зураг бүрээс нэг цэцгийн толгойг дугуйгаар
 * тайрах байрлал (төв, радиус) ба тэр хэсгийн дундаж өнгийг олно → data/flowerHeads.ts.
 *
 *   npm run images:heads
 *
 * Оролт: images:fetch-ийн local хуулбар + images:depth-ийн depth map. Оноо = ойр (depth өндөр) ×
 * дэлбээ шиг (ханасан, ногоон биш, бараан биш) пикселүүд. Тохирохгүй гарвал OVERRIDES-д гараар заана.
 */
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { flowerImages } from "../data/flowerImages.ts";
import type { FlowerSlug } from "../data/flowers.ts";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/flowerHeads.ts");
const SIZE = 160;

/** «slug-индекс» → [cx, cy, r] (0–1; r нь өргөний хувь) — автомат сонголт буруу үед */
const OVERRIDES: Record<string, [number, number, number]> = {
  "tulip-0": [0.5, 0.36, 0.13], // бүтэн толгой (автомат нь дэлбээний ойрын зураг)
  "tulip-2": [0.42, 0.6, 0.24],
  "calla-0": [0.58, 0.45, 0.1],
  "calla-2": [0.5, 0.22, 0.33],
  "lisianthus-1": [0.45, 0.35, 0.3],
  "freesia-2": [0.5, 0.4, 0.28],
};

type Head = { image: number; cx: number; cy: number; r: number; color: string };

async function analyze(slug: string, index: number): Promise<Head | null> {
  const jpg = path.join(ROOT, `public/images/flowers/${slug}-${index + 1}.jpg`);
  const depthFile = path.join(ROOT, `public/images/depth/${slug}-${index + 1}.webp`);
  if (!existsSync(jpg) || !existsSync(depthFile)) return null;

  const meta = await sharp(jpg).metadata();
  const aspect = (meta.width ?? 1) / (meta.height ?? 1);
  const W = aspect >= 1 ? SIZE : Math.round(SIZE * aspect);
  const H = aspect >= 1 ? Math.round(SIZE / aspect) : SIZE;
  const rgb = await sharp(jpg).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const depth = await sharp(depthFile).resize(W, H, { fit: "fill" }).grayscale().raw().toBuffer();

  const petal = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = rgb[i * 3] / 255;
    const g = rgb[i * 3 + 1] / 255;
    const b = rgb[i * 3 + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const green = g > r * 1.05 && g > b;
    // Цагаан цэцэг (гипсофила, калла) — гэгээтэй пиксел ч дэлбээ
    const p = max < 0.18 ? 0 : green ? 0.15 : (max - min) * 0.8 + max * 0.5;
    petal[i] = p * (0.35 + 0.65 * (depth[i] / 255));
  }

  const key = `${slug}-${index}`;
  if (OVERRIDES[key]) {
    const [cx, cy, r] = OVERRIDES[key];
    return { image: index, cx, cy, r, color: avgColor(rgb, petal, W, H, cx * W, cy * H, r * W) };
  }

  let best = { score: -1, x: 0, y: 0, r: 0 };
  for (const rf of [0.14, 0.2, 0.28]) {
    const r = rf * Math.min(W, H);
    for (let y = r; y <= H - r; y += 4) {
      for (let x = r; x <= W - r; x += 4) {
        // Тойрог доторх 9×9 цэгийн дундаж — том, жигд дэлбээтэй хэсэг ялна
        let sum = 0;
        let n = 0;
        for (let j = -4; j <= 4; j++) {
          for (let i = -4; i <= 4; i++) {
            if (i * i + j * j > 16) continue;
            sum += petal[Math.round(y + (j / 4) * r) * W + Math.round(x + (i / 4) * r)];
            n++;
          }
        }
        const score = (sum / n) * Math.pow(rf, 0.2);
        if (score > best.score) best = { score, x, y, r };
      }
    }
  }
  return {
    image: index,
    cx: round(best.x / W),
    cy: round(best.y / H),
    r: round(best.r / W),
    color: avgColor(rgb, petal, W, H, best.x, best.y, best.r),
  };
}

function avgColor(rgb: Buffer, weight: Float32Array, W: number, H: number, cx: number, cy: number, r: number) {
  let R = 0;
  let G = 0;
  let B = 0;
  let total = 0;
  for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(H, cy + r); y++) {
    for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(W, cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
      const i = y * W + x;
      const w = weight[i] + 0.01;
      R += rgb[i * 3] * w;
      G += rgb[i * 3 + 1] * w;
      B += rgb[i * 3 + 2] * w;
      total += w;
    }
  }
  const hex = (v: number) => Math.round(v / total).toString(16).padStart(2, "0");
  return `#${hex(R)}${hex(G)}${hex(B)}`;
}

const round = (v: number) => Math.round(v * 1000) / 1000;

const result: Partial<Record<FlowerSlug, Head[]>> = {};
for (const [slug, images] of Object.entries(flowerImages) as [FlowerSlug, (typeof flowerImages)[FlowerSlug]][]) {
  const heads: Head[] = [];
  for (const [i] of (images ?? []).entries()) {
    const h = await analyze(slug, i);
    if (h) heads.push(h);
  }
  result[slug] = heads;
  console.log(`[heads] ${slug}: ${heads.map((h) => `${h.image}@${h.cx},${h.cy} r${h.r} ${h.color}`).join(" | ")}`);
}

await writeFile(
  OUT,
  `// Энэ файлыг \`npm run images:heads\` (scripts/flower-heads.ts) үүсгэнэ — гараар бүү засаарай.
import type { FlowerSlug } from "./flowers.ts";

/** Зураг бүрээс нэг цэцгийн толгойн дугуй тайралт: cx, cy (0–1), r (өргөний хувь), тэр хэсгийн өнгө */
export type FlowerHead = { image: number; cx: number; cy: number; r: number; color: string };

export const flowerHeads: Partial<Record<FlowerSlug, FlowerHead[]>> = ${JSON.stringify(result, null, 2)};
`,
);
console.log(`[heads] ${OUT}`);
