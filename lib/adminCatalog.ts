import "server-only";

import { flowerImages } from "@/data/flowerImages";
import type { FlowerSlug } from "@/data/flowers";
import { db } from "@/lib/db";

/** Admin: cache-гүй, DB-ийн одоогийн утга (засварын формын defaultValue) */
export type AdminVariant = { id: string; size: string; stems: number; price: number };

export type AdminFlower = {
  slug: string;
  nameMn: string;
  nameEn: string;
  latinName: string;
  origin: string;
  meaning: string;
  deliveryNote: string;
  popularity: number;
  stock: number;
  updatedAt: string;
  variants: AdminVariant[];
  thumb: string | null;
};

const select = {
  slug: true,
  nameMn: true,
  nameEn: true,
  latinName: true,
  origin: true,
  meaning: true,
  deliveryNote: true,
  popularity: true,
  stock: true,
  updatedAt: true,
  variants: { select: { id: true, size: true, stems: true, price: true }, orderBy: { sortOrder: "asc" } },
} as const;

const thumb = (slug: string) => flowerImages[slug as FlowerSlug]?.[0]?.src ?? null;

export async function getAdminFlowers(): Promise<AdminFlower[]> {
  const rows = await db.flower.findMany({ select, orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString(), thumb: thumb(r.slug) }));
}

export async function getAdminFlower(slug: string): Promise<AdminFlower | null> {
  const r = await db.flower.findUnique({ where: { slug }, select });
  return r ? { ...r, updatedAt: r.updatedAt.toISOString(), thumb: thumb(r.slug) } : null;
}
