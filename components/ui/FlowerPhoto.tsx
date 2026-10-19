"use client";

import Image, { type ImageProps } from "next/image";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";

/**
 * next/image — Unsplash-ийн зургийг Unsplash CDN-ээр (hotlink, imgix хэмжээ), бусдыг Next optimizer-ээр.
 * `loader` нь функц тул Server Component-оос дамжуулах боломжгүй — энэ client wrapper үүнийг шийднэ.
 */
export function FlowerPhoto({ src, alt, ...props }: ImageProps & { src: string }) {
  return <Image src={src} alt={alt} loader={isUnsplash(src) ? unsplashLoader : undefined} {...props} />;
}
