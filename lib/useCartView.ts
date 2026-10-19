"use client";

import { useMemo } from "react";
import { cartLines, cartTotals, type CartFlower, type CartLine } from "@/lib/cart";
import { useCart } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Сагсны харагдах мөрүүд, нийт дүн, мөр өөрчлөх үйлдэл. Persist store нь localStorage-аас
 * уншдаг тул hydration-ий өмнө `ready: false` — тэр үед skeleton харуулна.
 */
export function useCartView(catalog: readonly CartFlower[]) {
  const ready = useHydrated();
  const items = useCart((s) => s.items);
  const bouquets = useCart((s) => s.bouquets);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setBouquetQuantity = useCart((s) => s.setBouquetQuantity);
  const removeBouquet = useCart((s) => s.removeBouquet);

  const bySlug = useMemo(() => new Map(catalog.map((f) => [f.slug, f])), [catalog]);
  const lines = useMemo(() => (ready ? cartLines(items, bouquets, bySlug) : []), [ready, items, bouquets, bySlug]);
  const totals = useMemo(() => cartTotals(lines), [lines]);

  return {
    ready,
    lines,
    totals,
    items,
    bouquets,
    setLineQuantity: (line: CartLine, quantity: number) =>
      "id" in line.ref ? setBouquetQuantity(line.ref.id, quantity) : setQuantity(line.ref.slug, line.ref.size, quantity),
    removeLine: (line: CartLine) =>
      "id" in line.ref ? removeBouquet(line.ref.id) : remove(line.ref.slug, line.ref.size),
  };
}
