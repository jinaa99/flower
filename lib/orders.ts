import "server-only";

import { randomInt } from "node:crypto";
import { MAX_STEMS, MIN_STEMS } from "@/data/bouquet";
import { priceBouquet, toBuilderFlower } from "@/lib/bouquet";
import { cartLines, cartTotals, stemsInCart, type CartFlower } from "@/lib/cart";
import type { OrderRequest, OrderResponse, PaymentMethod } from "@/lib/checkout";
import { getDeliverySlotsFresh, getFlowersFresh, toCartCatalog } from "@/lib/data";
import { db } from "@/lib/db";
import { getDeliveryDays } from "@/lib/delivery";
import { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/orderStatus";
import type { CustomBouquet } from "@/lib/store";

/*
 * Захиалга PostgreSQL-д (Prisma). Үнэ, нөөц, хүргэлтийн завсрыг cache-ээс биш DB-ээс шууд
 * уншиж шалгана; нөөц хасах, завсрын багтаамж нэг transaction дотор — давхар захиалгад
 * нөөц сөрөг болохгүй.
 */

export type OrderLine = {
  kind: "flower" | "bouquet";
  title: string;
  detail: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  /** Хүнд харагдах дугаар: FL-261019-4821 */
  number: string;
  createdAt: string;
  status: OrderStatus;
  paid: boolean;
  payment: PaymentMethod;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: { date: string; slot: string; slotLabel: string; district: string; khoroo: number; address: string };
  recipient: { name: string; phone: string };
  sender: { name: string; phone: string; anonymous: boolean };
  cardMessage: string;
};

const orderInclude = {
  items: { orderBy: { position: "asc" } },
  slot: { select: { label: true } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    number: row.number,
    createdAt: row.createdAt.toISOString(),
    status: row.status,
    paid: row.paidAt !== null,
    payment: row.payment,
    lines: row.items.map((i) => ({
      kind: i.kind === "FLOWER" ? "flower" : "bouquet",
      title: i.title,
      detail: i.detail,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    subtotal: row.subtotal,
    deliveryFee: row.deliveryFee,
    total: row.total,
    delivery: {
      date: row.deliveryDate.toISOString().slice(0, 10),
      slot: row.slotId,
      slotLabel: row.slot.label,
      district: row.district,
      khoroo: row.khoroo,
      address: row.address,
    },
    recipient: { name: row.recipientName, phone: row.recipientPhone },
    sender: { name: row.senderName, phone: row.senderPhone, anonymous: row.anonymous },
    cardMessage: row.cardMessage,
  };
}

const ubDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar", year: "2-digit", month: "2-digit", day: "2-digit" });

const newNumber = (now: Date) => `FL-${ubDate.format(now).replaceAll("-", "")}-${randomInt(1000, 10000)}`;

type Failure = Extract<OrderResponse, { ok: false }>;

/** Transaction-ийг буцаах (rollback) алдаа — хариуд нь хэрэглэгчид харуулах мессеж */
class OrderRejected extends Error {
  constructor(readonly failure: Failure) {
    super(failure.message);
  }
}

const isUniqueViolation = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

/** Сагсыг DB-ийн каталогоор дахин үнэлж, нөөц, хүргэлтийн цагийг шалгаад хадгална; нөөцөөс иш хасна */
export async function createOrder(request: OrderRequest): Promise<{ ok: true; order: Order } | Failure> {
  const [flowers, slots] = await Promise.all([getFlowersFresh(), getDeliverySlotsFresh()]);
  const catalog = new Map<string, CartFlower>(toCartCatalog(flowers).map((f) => [f.slug, f]));
  const builder = new Map(flowers.map((f) => [f.slug, toBuilderFlower(f, null)]));
  const { customer: c, items, bouquets } = request;

  for (const item of items) {
    if (!catalog.get(item.slug)?.sizes.some((s) => s.size === item.size)) {
      return { ok: false, code: "unavailable", message: "Сагсан дахь баглаа одоогоор боломжгүй байна." };
    }
  }

  // Custom баглааны үнийг client-ийн snapshot-оор биш, одоогийн үнээр
  const priced: CustomBouquet[] = [];
  for (const [i, b] of bouquets.entries()) {
    const stemCount = b.stems.reduce((sum, s) => sum + s.count, 0);
    const badColor = b.stems.some((s) => s.color >= catalog.get(s.slug)!.colors.length);
    if (badColor || stemCount < MIN_STEMS || stemCount > MAX_STEMS) {
      return { ok: false, code: "invalid", message: "Өөрийн баглааны бүрдэл буруу байна." };
    }
    priced.push({ ...b, id: `b${i}`, price: priceBouquet(b, builder).total });
  }

  const reserved = stemsInCart(items, priced, catalog);
  const shortage = (slug: string, stock: number): Failure => ({
    ok: false,
    code: "unavailable",
    message: `${catalog.get(slug)!.nameMn} одоогоор хүрэлцэхгүй байна — ${stock} иш үлдсэн.`,
  });
  for (const [slug, stems] of reserved) {
    const stock = catalog.get(slug)!.stock;
    if (stems > stock) return shortage(slug, stock);
  }

  const slot = slots.find((s) => s.id === c.deliverySlot);
  const day = getDeliveryDays(Date.now(), slots).find((d) => d.date === c.deliveryDate);
  if (!slot || !day?.slots.some((s) => s.id === c.deliverySlot && s.available)) {
    return { ok: false, code: "delivery", message: "Сонгосон хүргэлтийн цаг өнгөрсөн байна. Өөр цаг сонгоно уу." };
  }

  const lines = cartLines(items, priced, catalog);
  const totals = cartTotals(lines);
  if (totals.total !== request.expectedTotal) {
    return {
      ok: false,
      code: "price_changed",
      message: "Үнэ шинэчлэгдсэн байна. Шинэ дүнг шалгаад дахин баталгаажуулна уу.",
      bouquetPrices: priced.map((b) => b.price),
    };
  }

  const deliveryDate = new Date(`${c.deliveryDate}T00:00:00Z`);

  const place = () =>
    db.$transaction(async (tx) => {
      // Нэг завсрын захиалгуудыг дараалуулна — багтаамжаас хэтрэхгүй
      const [locked] = await tx.$queryRaw<{ capacity: number }[]>`
        SELECT capacity FROM "DeliverySlot" WHERE id = ${slot.id} AND active FOR UPDATE`;
      const booked = await tx.order.count({ where: { deliveryDate, slotId: slot.id } });
      if (!locked || booked >= locked.capacity) {
        throw new OrderRejected({
          ok: false,
          code: "delivery",
          message: "Энэ цагийн хүргэлт дүүрсэн байна. Өөр цаг сонгоно уу.",
        });
      }

      // Нөхцөлтэй хасалт: нөөц хүрэлцэхгүй бол мөр шинэчлэгдэхгүй → rollback
      for (const [slug, stems] of reserved) {
        const { count } = await tx.flower.updateMany({
          where: { slug, stock: { gte: stems } },
          data: { stock: { decrement: stems } },
        });
        if (count === 0) {
          const now = await tx.flower.findUnique({ where: { slug }, select: { stock: true } });
          throw new OrderRejected(shortage(slug, now?.stock ?? 0));
        }
      }

      const variants = await tx.variant.findMany({
        where: { OR: items.map((i) => ({ flowerSlug: i.slug, size: i.size })) },
        select: { id: true, flowerSlug: true, size: true },
      });
      const variantId = (slug: string, size: string) =>
        variants.find((v) => v.flowerSlug === slug && v.size === size)?.id ?? null;

      // cartLines нь эхлээд энгийн баглаа, дараа нь custom баглааг хүсэлтийн дарааллаар гаргана
      return tx.order.create({
        data: {
          number: newNumber(new Date()),
          payment: c.payment,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          deliveryDate,
          slotId: slot.id,
          district: c.district,
          khoroo: c.khoroo,
          address: c.address,
          recipientName: c.recipientName,
          recipientPhone: c.recipientPhone,
          senderName: c.senderName,
          senderPhone: c.senderPhone,
          anonymous: c.anonymous,
          cardMessage: c.cardMessage,
          items: {
            create: lines.map((line, position) => {
              const bouquet = position >= items.length ? bouquets[position - items.length] : null;
              const item = position < items.length ? items[position] : null;
              return {
                position,
                kind: line.kind === "flower" ? "FLOWER" : "BOUQUET",
                variantId: item ? variantId(item.slug, item.size) : null,
                bouquet: bouquet
                  ? { stems: bouquet.stems, greenery: bouquet.greenery, paper: bouquet.paper, ribbon: bouquet.ribbon, message: bouquet.message }
                  : Prisma.DbNull,
                title: line.title,
                detail: line.detail,
                unitPrice: line.unitPrice,
                quantity: line.quantity,
              };
            }),
          },
        },
        include: orderInclude,
      });
    });

  // Захиалгын дугаар (өдөр + 4 оронтой санамсаргүй тоо) давхцвал дахин оролдоно
  for (let attempt = 0; ; attempt++) {
    try {
      return { ok: true, order: toOrder(await place()) };
    } catch (err) {
      if (err instanceof OrderRejected) return err.failure;
      if (isUniqueViolation(err) && attempt < 4) continue;
      throw err;
    }
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await db.order.findUnique({ where: { id }, include: orderInclude });
  return row ? toOrder(row) : null;
}

/** Mock төлбөр — жинхэнэ QPay/банкны интеграцид callback-аас дуудагдана */
export async function markOrderPaid(id: string): Promise<Order | null> {
  await db.order.updateMany({ where: { id, paidAt: null }, data: { paidAt: new Date() } });
  return getOrder(id);
}

/** Admin: захиалгын жагсаалт (шинэ нь эхэнд) */
export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const rows = await db.order.findMany({
    where: status ? { status } : undefined,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toOrder);
}

export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  const groups = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<OrderStatus, number> = { NEW: 0, PREPARING: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0 };
  for (const g of groups) counts[g.status] = g._count._all;
  return counts;
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const { count } = await db.order.updateMany({ where: { id }, data: { status } });
  return count > 0;
}
