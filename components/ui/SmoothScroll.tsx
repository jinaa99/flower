"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollMotion, smoothScroll } from "@/lib/scrollMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll-г GSAP ticker-тэй нэг цагт ажиллуулна, ингэснээр
 * ScrollTrigger бүр Lenis-ийн байрлалыг дагана.
 * prefers-reduced-motion идэвхтэй үед Lenis асахгүй — native scroll үлдэнэ.
 */
export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      scrollMotion.velocity = lenis?.velocity ?? 0;
    };

    const start = () => {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const instance = lenis;
      smoothScroll.to = (y) => instance.scrollTo(y, { duration: 2.4, easing: (t) => 1 - (1 - t) ** 4 });
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    const stop = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      smoothScroll.to = (y) => window.scrollTo({ top: y, behavior: "smooth" });
      scrollMotion.velocity = 0;
    };

    const sync = () => {
      stop();
      if (!media.matches) start();
      ScrollTrigger.refresh();
    };

    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
