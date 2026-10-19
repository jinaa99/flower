import { useId } from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Logo mark: хэвтээ хавирган сар (өлгий) дээрээс гурван дэлбээ ургана — «сарны гэрэлд дэлбээлэх цэцэг».
 * Gradient: gold-soft → blush-100. `app/icon.svg` ижил хэлбэртэй.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="8" y1="34" x2="32" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-gold-soft)" />
          <stop offset="1" stopColor="var(--color-blush-100)" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id}-g)`}>
        {/* Хавирган сар: гадна нум − дотор нум */}
        <path d="M5 21.5a15 15 0 0 0 30 0 20 20 0 0 1-30 0Z" />
        {/* Төв дэлбээ + хоёр хажуугийн дэлбээ (ёроол нь 20,23 цэгт) */}
        <path d="M20 4.5c3.6 4.2 4.4 11.6 0 17.6-4.4-6-3.6-13.4 0-17.6Z" />
        <path d="M20 22.6c-1.4-5.4-5.3-9.2-10.6-10 0.6 5.6 4.6 9.4 10.6 10Z" opacity="0.8" />
        <path d="M20 22.6c1.4-5.4 5.3-9.2 10.6-10-0.6 5.6-4.6 9.4-10.6 10Z" opacity="0.8" />
      </g>
    </svg>
  );
}

/** Mark + wordmark. `compact` — зөвхөн нэр (descriptor-гүй) */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="size-8 drop-shadow-[0_0_10px_rgba(232,180,188,0.45)] sm:size-9" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.7rem] tracking-[0.04em] text-ivory sm:text-3xl">{brand.name}</span>
        {!compact && (
          <span className="mt-1 hidden text-[0.55rem] tracking-[0.42em] text-gold-soft/80 uppercase sm:block">
            {brand.descriptor}
          </span>
        )}
      </span>
    </span>
  );
}
