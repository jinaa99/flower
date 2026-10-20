import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** [хаалттай өнцөг, нээлттэй өнцөг] (градус), ар талаас урагш зурагдана */
const PETALS = [
  { closed: -16, open: -64, tone: "back" },
  { closed: 16, open: 64, tone: "back" },
  { closed: -9, open: -34, tone: "mid" },
  { closed: 9, open: 34, tone: "mid" },
  { closed: 0, open: 0, tone: "front" },
] as const;

type Props = {
  /** false үед зөөлөн уусаж алга болно */
  visible: boolean;
  className?: string;
};

/**
 * 3D ертөнц ачаалагдах хооронд цэцгийн байрлалд харагдах нахиа: дэлбээнүүд ёроолоосоо
 * дэлгэрч, буцаж хумигдана (CSS keyframes, `globals.css` → `.bloom-petal`). JS-гүйгээр
 * server HTML-д шууд зурагдана. Inline SVG тул LCP-д тооцогдохгүй, absolute тул CLS үүсгэхгүй.
 */
export function BloomLoader({ visible, className }: Props) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none flex flex-col items-center gap-5 transition-opacity duration-1000 ease-bloom",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <svg viewBox="0 0 100 110" className="h-24 w-24 overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="bloom-petal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#B86E86" />
            <stop offset="0.55" stopColor="#E8B4BC" />
            <stop offset="1" stopColor="#F8F3EC" />
          </linearGradient>
          <radialGradient id="bloom-glow">
            <stop offset="0" stopColor="#E8B4BC" stopOpacity="0.35" />
            <stop offset="1" stopColor="#E8B4BC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="52" r="46" fill="url(#bloom-glow)" className="bloom-glow" />
        {/* Иш */}
        <path d="M50 66 C 49 80, 52 92, 50 108" stroke="#56733F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g transform="translate(50 66)">
          {PETALS.map((p, i) => (
            <path
              key={i}
              className="bloom-petal"
              data-tone={p.tone}
              d="M0 0 C -15 -10, -14 -36, 0 -46 C 14 -36, 15 -10, 0 0 Z"
              fill="url(#bloom-petal)"
              style={{ "--closed": `${p.closed}deg`, "--open": `${p.open}deg` } as CSSProperties}
            />
          ))}
          <circle cy="-6" r="3.2" fill="#C9A87C" className="bloom-heart" />
        </g>
      </svg>
      <span className="text-[0.6rem] tracking-[0.16em] text-ivory/45 uppercase">Дэлбээлж байна</span>
    </div>
  );
}
