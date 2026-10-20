import type { SVGProps } from "react";

/**
 * Нэгдсэн icon-ууд: 24px сүлжээ, 1.3 зузаан шугам, бөөрөнхий төгсгөл — header, хайлт, цэс бүгд ижил.
 * Хэмжээг className-аар (анхдагч 1.25rem).
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ className = "size-5", children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.6-4.6" />
  </Icon>
);

export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 8.5h13l-1 11.5h-11z" />
    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
  </Icon>
);

/** Хоёр зураас — тэгш бус урттай (тансаг брэндүүдийн «цэс» тэмдэг) */
export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 9h17M3.5 15h11" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);

export const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7 10 5 5 5-5" />
  </Icon>
);

export const ArrowIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Icon>
);
