import { flowers, type Flower } from "@/data/flowers";

export function getFlowers(): Flower[] {
  return flowers;
}

export function getFlower(slug: string): Flower | undefined {
  return flowers.find((f) => f.slug === slug);
}
