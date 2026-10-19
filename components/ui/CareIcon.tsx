import type { ReactNode } from "react";
import type { CareIcon as CareIconName } from "@/data/flowers";
import { cn } from "@/lib/utils";

/** Арчилгааны зөвлөмжийн нарийн шугаман icon-ууд (24×24, stroke = currentColor) */
const paths: Record<CareIconName, ReactNode> = {
  cut: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </>
  ),
  water: <path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />,
  mist: (
    <>
      <path d="M9 21a4 4 0 0 1-4-4c0-3 4-7 4-7s4 4 4 7a4 4 0 0 1-4 4Z" />
      <path d="M16 4h.01M19 6.5h.01M15.5 8.5h.01M20 10.5h.01M17 12.5h.01" strokeWidth="2.2" />
    </>
  ),
  temp: (
    <>
      <path d="M14 14.8V4.5a2 2 0 0 0-4 0v10.3a4 4 0 1 0 4 0Z" />
      <path d="M12 9v7" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  bloom: (
    <>
      <path d="M12 14c-3.2 0-5-2.8-5-6.5 2 0 3.6.9 5 2.6 1.4-1.7 3-2.6 5-2.6 0 3.7-1.8 6.5-5 6.5Z" />
      <path d="M12 10.1C11 7.6 11.2 5 12 3c.8 2 1 4.6 0 7.1M12 14v7M12 18c-1.6-1.5-3.4-1.9-5-1.3" />
    </>
  ),
  hand: (
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0V12m0-2.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-5-2.7L5.2 15.4a1.6 1.6 0 0 1 2.6-1.8L8 14" />
  ),
  leaf: (
    <>
      <path d="M5 19C5 10.5 10 5 19 5c0 9-5.5 14-14 14Z" />
      <path d="m5 19 8-8" />
    </>
  ),
  vase: (
    <>
      <path d="M9 3h6M10 3v3.5C10 8 6 9.8 6 14.5 6 18.5 8.5 21 12 21s6-2.5 6-6.5C18 9.8 14 8 14 6.5V3" />
      <path d="M7 13h10" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4 21.5 20h-19L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
};

export function CareIcon({ name, className }: { name: CareIconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
    >
      {paths[name]}
    </svg>
  );
}
