import type { OrderStatus } from "@/lib/generated/prisma/enums";

export type { OrderStatus };

/** Захиалгын явц — admin-д энэ дарааллаар шилжүүлнэ */
export const orderStatuses = [
  { id: "NEW", label: "Шинэ" },
  { id: "PREPARING", label: "Бэлтгэж байна" },
  { id: "OUT_FOR_DELIVERY", label: "Хүргэлтэд" },
  { id: "DELIVERED", label: "Хүргэгдсэн" },
] as const satisfies readonly { id: OrderStatus; label: string }[];

export const orderStatusLabel = (status: OrderStatus) => orderStatuses.find((s) => s.id === status)!.label;

export const isOrderStatus = (value: unknown): value is OrderStatus => orderStatuses.some((s) => s.id === value);
