/**
 * Script-ийн үүсгэдэг (npm run images:depth) — гараар бүү засаарай.
 * Цэцгийн зураг (flowerImages-ийн индексээр) бүрийн depth map; null = үүсгээгүй.
 */
import type { FlowerSlug } from "./flowers.ts";

export const flowerDepth: Partial<Record<FlowerSlug, (string | null)[]>> = {
  "peony": [
    "/images/depth/peony-1.webp",
    "/images/depth/peony-2.webp",
    "/images/depth/peony-3.webp"
  ],
  "rose": [
    "/images/depth/rose-1.webp",
    "/images/depth/rose-2.webp",
    "/images/depth/rose-3.webp"
  ],
  "spray-rose": [
    "/images/depth/spray-rose-1.webp",
    "/images/depth/spray-rose-2.webp",
    "/images/depth/spray-rose-3.webp"
  ],
  "tulip": [
    "/images/depth/tulip-1.webp",
    "/images/depth/tulip-2.webp",
    "/images/depth/tulip-3.webp"
  ],
  "lily": [
    "/images/depth/lily-1.webp",
    "/images/depth/lily-2.webp",
    "/images/depth/lily-3.webp"
  ],
  "oriental-lily": [
    "/images/depth/oriental-lily-1.webp",
    "/images/depth/oriental-lily-2.webp",
    "/images/depth/oriental-lily-3.webp"
  ],
  "chrysanthemum": [
    "/images/depth/chrysanthemum-1.webp",
    "/images/depth/chrysanthemum-2.webp",
    "/images/depth/chrysanthemum-3.webp"
  ],
  "sunflower": [
    "/images/depth/sunflower-1.webp",
    "/images/depth/sunflower-2.webp",
    "/images/depth/sunflower-3.webp"
  ],
  "orchid": [
    "/images/depth/orchid-1.webp",
    "/images/depth/orchid-2.webp",
    "/images/depth/orchid-3.webp"
  ],
  "hydrangea": [
    "/images/depth/hydrangea-1.webp",
    "/images/depth/hydrangea-2.webp",
    "/images/depth/hydrangea-3.webp"
  ],
  "ranunculus": [
    "/images/depth/ranunculus-1.webp",
    "/images/depth/ranunculus-2.webp",
    "/images/depth/ranunculus-3.webp"
  ],
  "iris": [
    "/images/depth/iris-1.webp",
    "/images/depth/iris-2.webp",
    "/images/depth/iris-3.webp"
  ]
};
