const mnt = new Intl.NumberFormat("mn-MN");

export function formatPrice(value: number): string {
  return `${mnt.format(value)}₮`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** «хурган цэцэг» → «Хурган цэцэг» */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
