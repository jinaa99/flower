import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BouquetSize } from "@/data/flowers";
import type { BouquetConfig } from "@/lib/bouquet";

export type CartItem = {
  slug: string;
  size: BouquetSize;
  quantity: number;
};

/** Баглаа бүрдүүлэгчээс ирсэн нэг custom баглаа — үнэ нь нэмэх үеийн тооцоо (snapshot) */
export type CustomBouquet = BouquetConfig & {
  id: string;
  /** Нэг баглааны үнэ */
  price: number;
  quantity: number;
};

/** Захиалгын хүргэлт (Улаанбаатар дотор): огноо YYYY-MM-DD (Улаанбаатарын цагаар), цагийн завсар id */
export type Delivery = { date: string; slot: string };

type CartState = {
  items: CartItem[];
  bouquets: CustomBouquet[];
  delivery: Delivery | null;
  setDelivery: (delivery: Delivery | null) => void;
  add: (slug: string, size: BouquetSize, quantity?: number) => void;
  remove: (slug: string, size: BouquetSize) => void;
  setQuantity: (slug: string, size: BouquetSize, quantity: number) => void;
  addBouquet: (config: BouquetConfig, price: number) => void;
  removeBouquet: (id: string) => void;
  setBouquetQuantity: (id: string, quantity: number) => void;
  /** Сервер үнэ шинэчлэгдсэнийг мэдэгдвэл custom баглааны snapshot-ийг солино */
  setBouquetPrice: (id: string, price: number) => void;
  clear: () => void;
};

// crypto.randomUUID нь зөвхөн secure context-д (http LAN хаягаар утсан дээр туршихад байхгүй)
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const same = (i: CartItem, slug: string, size: BouquetSize) => i.slug === slug && i.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      bouquets: [],
      delivery: null,
      setDelivery: (delivery) => set({ delivery }),
      add: (slug, size, quantity = 1) =>
        set((s) => {
          if (s.items.some((i) => same(i, slug, size))) {
            return {
              items: s.items.map((i) => (same(i, slug, size) ? { ...i, quantity: i.quantity + quantity } : i)),
            };
          }
          return { items: [...s.items, { slug, size, quantity }] };
        }),
      remove: (slug, size) => set((s) => ({ items: s.items.filter((i) => !same(i, slug, size)) })),
      setQuantity: (slug, size, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => !same(i, slug, size))
              : s.items.map((i) => (same(i, slug, size) ? { ...i, quantity } : i)),
        })),
      addBouquet: (config, price) =>
        set((s) => ({ bouquets: [...s.bouquets, { ...config, id: newId(), price, quantity: 1 }] })),
      removeBouquet: (id) => set((s) => ({ bouquets: s.bouquets.filter((b) => b.id !== id) })),
      setBouquetQuantity: (id, quantity) =>
        set((s) => ({
          bouquets:
            quantity <= 0
              ? s.bouquets.filter((b) => b.id !== id)
              : s.bouquets.map((b) => (b.id === id ? { ...b, quantity } : b)),
        })),
      setBouquetPrice: (id, price) =>
        set((s) => ({ bouquets: s.bouquets.map((b) => (b.id === id ? { ...b, price } : b)) })),
      clear: () => set({ items: [], bouquets: [], delivery: null }),
    }),
    {
      name: "flower-cart",
      version: 1,
      // v0: хэмжээгүй ширхэгээр — хамгийн жижиг баглаа гэж үзнэ
      migrate: (persisted, version) => {
        const state = persisted as { items?: Partial<CartItem>[] };
        if (version === 0 && state.items) {
          state.items = state.items.map((i) => ({ ...i, size: i.size ?? "Жижиг" }));
        }
        return state as CartState;
      },
    },
  ),
);

export const selectCartCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0) + s.bouquets.reduce((sum, b) => sum + b.quantity, 0);

type UIState = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  /** Баруунаас гарах mini-cart */
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

export const useUI = create<UIState>()((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
