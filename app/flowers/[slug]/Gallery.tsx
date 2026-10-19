"use client";

import { useState } from "react";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import type { CoverImage } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Үндсэн зураг + жижиг зургууд; сонгоход зөөлөн уусаж солигдоно. Attribution хуудасны доод хэсэгт. */
export function Gallery({ images, swatch }: { images: CoverImage[]; swatch: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div aria-hidden className="aspect-[4/5]" style={{ background: `linear-gradient(160deg, ${swatch}, #1e0f1a 80%)` }} />
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: images[0].color }}>
        {images.map((img, i) => (
          <FlowerPhoto
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            preload={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            aria-hidden={i !== index}
            className={cn(
              "object-cover transition-[opacity,scale] duration-1000 ease-bloom",
              i === index ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
            )}
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Зургууд">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={`Зураг ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden outline-offset-2 transition-opacity duration-500 focus-visible:outline-2 focus-visible:outline-blush-300",
                i === index ? "opacity-100 ring-1 ring-blush-300" : "opacity-55 hover:opacity-90",
              )}
              style={{ backgroundColor: img.color }}
            >
              <FlowerPhoto src={img.src} alt="" fill sizes="(min-width: 1024px) 13vw, 25vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
