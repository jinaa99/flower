"use client";

import { useEffect, type RefObject } from "react";

/**
 * `root` доторх `.reveal` элементүүд дэлгэцэнд орохдоо `data-shown` авна — CSS (`globals.css`)
 * зөөлөн тодруулна (reduced motion-д зөвхөн opacity). Нэг удаа л: харагдсаны дараа ажиглахаа болино.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    el.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [root]);
}
