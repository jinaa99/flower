import type { ImageLoaderProps } from "next/image";

/** Unsplash-ийн hotlink эсэх (images.unsplash.com) — эдгээрийг Next optimizer-ээр биш, Unsplash-ийн CDN-ээр хэмжээлнэ */
export const isUnsplash = (src: string) => src.startsWith("https://images.unsplash.com/");

/**
 * next/image loader: Unsplash-ийн imgix параметрээр (w, q, auto=format) хэрэгтэй хэмжээг шууд
 * Unsplash CDN-ээс авна. API guideline: зургийг hotlink хийх — өөрийн серверээр дамжуулахгүй.
 */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
