"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/** Server Component-ийн хэсгийг ороож, доторх `.reveal` элементүүдийг дэлгэцэнд орохдоо тодруулна */
export function RevealGroup({ children, className, id, label }: { children: ReactNode; className?: string; id?: string; label?: string }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} id={id} aria-label={label} className={className}>
      {children}
    </section>
  );
}

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Хүрээний хэмжээ (aspect-ratio, дэвсгэр өнгө) */
  style?: CSSProperties;
  /** Хүрээ дотор зураг босоо чиглэлд шилжих хувь (±) */
  shift?: number;
  /** Хэсэгт орж ирэхэд томруулалт [эхэнд, төгсгөлд] — кино мэт «тогтох» */
  zoom?: readonly [number, number];
};

/**
 * Хүрээ (overflow hidden) дотор зураг scroll-оор удаан шилжинэ — гүн мэдрэмж. Scrub тул
 * буцаахад урвуу явна. Reduced motion-д хөдөлгөөнгүй (gsap.matchMedia).
 */
export function Parallax({ children, className, style, shift = 6, zoom = [1.12, 1.12] }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [zoomFrom, zoomTo] = zoom;

  useEffect(() => {
    const el = frame.current;
    const target = inner.current;
    if (!el || !target) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        target,
        { yPercent: -shift, scale: zoomFrom },
        {
          yPercent: shift,
          scale: zoomTo,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, [shift, zoomFrom, zoomTo]);

  return (
    <div ref={frame} className={cn("relative overflow-hidden", className)} style={style}>
      <div ref={inner} className="absolute inset-0 will-change-transform">
        {children}
      </div>
    </div>
  );
}
