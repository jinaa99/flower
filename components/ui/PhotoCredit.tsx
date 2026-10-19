import type { CoverImage } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Unsplash attribution (API guideline): «Зураг: {гэрэл зурагчин} · Unsplash» — хоёулаа
 * utm_source-той холбоос. Unsplash-ийн бус (placeholder) зурагт юу ч харуулахгүй.
 */
export function PhotoCredit({ image, className }: { image: CoverImage; className?: string }) {
  if (!image.photographer || !image.unsplashUrl) return null;
  return (
    <p className={cn("text-[0.7rem] tracking-wide text-ivory/45", className)}>
      Зураг:{" "}
      <a
        href={image.photographer.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ivory/70 underline-offset-4 transition-colors hover:text-blush-100 hover:underline"
      >
        {image.photographer.name}
      </a>{" "}
      ·{" "}
      <a
        href={image.unsplashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ivory/70 underline-offset-4 transition-colors hover:text-blush-100 hover:underline"
      >
        Unsplash
      </a>
    </p>
  );
}
