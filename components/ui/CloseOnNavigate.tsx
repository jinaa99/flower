"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Хуудас (эсвэл query) солигдоход overlay-уудыг хаана — drawer, хайлт, цэс. usePathname/useSearchParams
 * suspend болж болох тул дуудагч нь `<Suspense>` дотор байрлуулна.
 */
export function CloseOnNavigate({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const latest = useRef(onNavigate);
  useEffect(() => {
    latest.current = onNavigate;
  });
  useEffect(() => latest.current(), [pathname, query]);
  return null;
}

/** Overlay нээлттэй үед хуудсыг гүйлгэхгүй (Lenis-ийн гүйлгээ нь html overflow-оор зогсоно) */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [locked]);
}
