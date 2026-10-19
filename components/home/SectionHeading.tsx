import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  /** [өмнөх, онцолсон (italic blush), дараах] */
  title: readonly [string, string, string];
  body?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
};

/** Нүүрний хэсгийн гарчиг: eyebrow + том serif гарчиг (нэг үг italic) + тайлбар */
export function SectionHeading({ eyebrow, title: [before, em, after], body, children, className, align = "left" }: Props) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow mb-7", align === "center" && "justify-center before:h-px before:w-14 before:bg-gold-soft/40")}>
        {eyebrow}
      </p>
      <h2 className="font-display text-5xl leading-[0.98] font-light text-balance sm:text-6xl lg:text-7xl">
        {before}
        <em className="text-blush-300">{em}</em>
        {after}
      </h2>
      {body && (
        <p className={cn("mt-7 max-w-md text-lg leading-relaxed text-ivory/60", align === "center" && "mx-auto")}>{body}</p>
      )}
      {children}
    </div>
  );
}
