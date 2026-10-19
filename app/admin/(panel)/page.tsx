import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { requireAdmin } from "@/lib/adminSession";
import { formatPhone, paymentMethods } from "@/lib/checkout";
import { formatDeliveryDate } from "@/lib/delivery";
import { countOrdersByStatus, listOrders, type Order } from "@/lib/orders";
import { isOrderStatus, orderStatuses, type OrderStatus } from "@/lib/orderStatus";
import { cn, formatPrice } from "@/lib/utils";
import { changeOrderStatus } from "../actions";

export const metadata: Metadata = { title: "Захиалга" };

export default function OrdersPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-ivory/[0.03]" />}>
      <Orders searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = isOrderStatus(status) ? status : undefined;
  const [orders, counts] = await Promise.all([listOrders(filter), countOrdersByStatus()]);
  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <nav aria-label="Төлвөөр шүүх" className="mb-10 flex flex-wrap gap-2">
        <FilterLink href="/admin" active={!filter} label="Бүгд" count={all} />
        {orderStatuses.map((s) => (
          <FilterLink key={s.id} href={`/admin?status=${s.id}`} active={filter === s.id} label={s.label} count={counts[s.id]} />
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="py-24 text-center text-ivory/50">Захиалга алга.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </>
  );
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border px-4 py-2 text-sm transition-colors duration-300",
        active ? "border-blush-300 bg-blush-300/5 text-ivory" : "border-ivory/15 text-ivory/60 hover:border-gold-soft/50",
      )}
    >
      {label} <span className="ml-1 text-ivory/40 tabular-nums">{count}</span>
    </Link>
  );
}

const created = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ulaanbaatar",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function OrderCard({ order: o }: { order: Order }) {
  return (
    <li className="border border-ivory/10 bg-plum-800/20">
      <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.2fr_1fr_auto] lg:items-start">
        <div>
          <p className="font-display text-2xl font-light tabular-nums">{o.number}</p>
          <p className="mt-1 text-xs text-ivory/45 tabular-nums">{created.format(new Date(o.createdAt))}</p>
        </div>
        <Field label="Хүргэлт">
          {formatDeliveryDate(o.delivery.date)} · <span className="tabular-nums">{o.delivery.slotLabel}</span>
          <br />
          <span className="text-ivory/55">
            {o.delivery.district}, {o.delivery.khoroo}-р хороо
          </span>
        </Field>
        <Field label="Хүлээн авагч">
          {o.recipient.name}
          <br />
          <span className="text-ivory/55 tabular-nums">{formatPhone(o.recipient.phone)}</span>
        </Field>
        <div className="text-left lg:text-right">
          <p className="font-display text-2xl text-gold-soft tabular-nums">{formatPrice(o.total)}</p>
          <p className={cn("mt-1 text-xs", o.paid ? "text-blush-100" : "text-ivory/45")}>
            {paymentMethods.find((m) => m.id === o.payment)?.label} · {o.paid ? "Төлөгдсөн ✓" : "Төлөгдөөгүй"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 px-5 py-4">
        <StatusControl id={o.id} current={o.status} />
        <details className="group w-full">
          <summary className="cursor-pointer text-xs tracking-[0.2em] text-ivory/50 uppercase transition-colors hover:text-blush-100">
            Дэлгэрэнгүй
          </summary>
          <div className="mt-5 grid gap-8 text-sm md:grid-cols-2">
            <ul className="divide-y divide-ivory/10">
              {o.lines.map((line, i) => (
                <li key={i} className="flex justify-between gap-4 py-3">
                  <span>
                    {line.title}
                    {line.quantity > 1 && <span className="ml-2 text-ivory/50 tabular-nums">× {line.quantity}</span>}
                    <span className="mt-1 block text-xs text-ivory/50">{line.detail}</span>
                  </span>
                  <span className="shrink-0 text-gold-soft tabular-nums">{formatPrice(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 text-ivory/60">
                <span>Хүргэлт</span>
                <span className="tabular-nums">{o.deliveryFee ? formatPrice(o.deliveryFee) : "Үнэгүй"}</span>
              </li>
            </ul>
            <div className="space-y-4">
              <Field label="Хаяг">{o.delivery.address}</Field>
              <Field label="Захиалагч">
                {o.sender.name} · <span className="tabular-nums">{formatPhone(o.sender.phone)}</span>
                {o.sender.anonymous && <span className="text-ivory/50"> (нэрээ нууцалсан)</span>}
              </Field>
              {o.cardMessage && (
                <Field label="Бэлгийн карт">
                  <span className="font-display text-lg italic">«{o.cardMessage}»</span>
                </Field>
              )}
              <Field label="Захиалгын хуудас">
                <Link href={`/order/${o.id}`} className="text-ivory/60 underline-offset-4 hover:text-blush-100 hover:underline">
                  Харилцагчийн харагдац →
                </Link>
              </Field>
            </div>
          </div>
        </details>
      </div>
    </li>
  );
}

/** Шинэ → бэлтгэж байна → хүргэлтэд → хүргэгдсэн. Алдаа засахад өмнөх төлөв рүү буцааж болно */
function StatusControl({ id, current }: { id: string; current: OrderStatus }) {
  const index = orderStatuses.findIndex((s) => s.id === current);
  return (
    <form action={changeOrderStatus} className="flex flex-wrap items-center gap-1">
      <input type="hidden" name="id" value={id} />
      {orderStatuses.map((s, i) => (
        <button
          key={s.id}
          type="submit"
          name="status"
          value={s.id}
          disabled={s.id === current}
          aria-pressed={s.id === current}
          className={cn(
            "border px-3 py-1.5 text-xs transition-colors duration-300",
            s.id === current
              ? "border-blush-300 bg-blush-300/10 text-ivory"
              : i === index + 1
                ? "border-gold-soft/50 text-gold-soft hover:bg-gold-soft hover:text-plum-950"
                : i < index
                  ? "border-ivory/10 text-ivory/40 hover:border-ivory/30"
                  : "border-ivory/10 text-ivory/55 hover:border-gold-soft/50",
          )}
        >
          {i === index + 1 ? `→ ${s.label}` : s.label}
        </button>
      ))}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[0.65rem] tracking-[0.2em] text-ivory/45 uppercase">{label}</p>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
