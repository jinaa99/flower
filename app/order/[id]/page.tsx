import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { formatPhone, paymentMethods } from "@/lib/checkout";
import { formatDeliveryDate } from "@/lib/delivery";
import { getOrder, type Order } from "@/lib/orders";
import { orderStatusLabel } from "@/lib/orderStatus";
import { formatPrice } from "@/lib/utils";
import { PaymentPanel } from "./PaymentPanel";

export const metadata: Metadata = { title: "Захиалга баталгаажлаа", robots: { index: false } };

/** Захиалгын id нь таамаглах боломжгүй UUID — линк мэдэх хүн л хуудсыг харна */
export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-[calc(var(--header-height)+5rem)] pb-32 sm:px-8">
      <Suspense fallback={<div aria-hidden className="h-[32rem] animate-pulse bg-ivory/[0.03]" />}>
        <OrderDetails params={props.params} />
      </Suspense>
    </section>
  );
}

async function OrderDetails({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const { paid } = order;
  const method = paymentMethods.find((m) => m.id === order.payment)!;

  return (
    <>
      <header className="mb-16 text-center">
        <p className="mb-6 text-xs tracking-[0.16em] text-gold-soft uppercase">
          {paid ? "Төлбөр төлөгдсөн" : "Захиалга хүлээн авлаа"}
        </p>
        <h1 className="font-display text-5xl leading-[1.05] font-light sm:text-7xl">
          Баярлалаа{order.sender.anonymous ? "" : `, ${order.sender.name}`}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-ivory/60">
          {paid
            ? "Таны баглааг цэцэгчин маань бэлтгэж эхэллээ. Хүргэлтийн өмнө хүлээн авагчтай холбогдоно."
            : "Төлбөр баталгаажмагц баглааг бэлтгэж эхэлнэ."}
        </p>
        <p className="mt-8 inline-flex items-center gap-3 border border-gold-soft/30 px-5 py-2.5 text-sm tracking-[0.15em] tabular-nums">
          <span className="text-xs tracking-[0.16em] text-ivory/50 uppercase">Дугаар</span>
          {order.number}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="space-y-12">
          {!paid && <PaymentPanel orderId={order.id} number={order.number} total={order.total} method={order.payment} />}

          <Block title="Хүргэлт">
            <dl className="grid gap-6 sm:grid-cols-2">
              <Item label="Хүлээн авагч">
                {order.recipient.name}
                <br />
                <span className="tabular-nums text-ivory/60">{formatPhone(order.recipient.phone)}</span>
              </Item>
              <Item label="Хэзээ">
                {formatDeliveryDate(order.delivery.date)}
                <br />
                <span className="tabular-nums text-ivory/60">{order.delivery.slotLabel}</span>
              </Item>
              <Item label="Хаяг" wide>
                {order.delivery.district} дүүрэг, {order.delivery.khoroo}-р хороо
                <br />
                <span className="text-ivory/60">{order.delivery.address}</span>
              </Item>
            </dl>
          </Block>

          {order.cardMessage && (
            <Block title="Бэлгийн карт">
              <figure className="border border-ivory/10 bg-ivory/[0.03] px-8 py-10 text-center">
                <blockquote className="font-display text-2xl font-light italic">«{order.cardMessage}»</blockquote>
                <figcaption className="mt-4 text-xs tracking-[0.2em] text-ivory/50 uppercase">
                  — {order.sender.anonymous ? "Нууц хүнээс" : order.sender.name}
                </figcaption>
              </figure>
            </Block>
          )}
        </div>

        <aside className="lg:self-start">
          <Summary order={order} methodLabel={method.label} />
          <Link
            href="/catalog"
            className="mt-8 block border border-ivory/20 px-8 py-4 text-center text-xs tracking-[0.2em] text-ivory/80 uppercase transition-colors hover:border-blush-100 hover:text-blush-100"
          >
            Дэлгүүр рүү буцах
          </Link>
        </aside>
      </div>
    </>
  );
}

function Summary({ order, methodLabel }: { order: Order; methodLabel: string }) {
  return (
    <div className="border border-ivory/10 bg-plum-800/20 p-6 sm:p-8">
      <p className="mb-2 text-xs tracking-[0.16em] text-gold-soft uppercase">Хураангуй</p>
      <ul className="divide-y divide-ivory/10">
        {order.lines.map((line, i) => (
          <li key={i} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-display text-xl font-light">
                {line.title}
                {line.quantity > 1 && <span className="ml-2 font-sans text-xs text-ivory/50 tabular-nums">× {line.quantity}</span>}
              </p>
              <p className="shrink-0 text-sm text-gold-soft tabular-nums">{formatPrice(line.unitPrice * line.quantity)}</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ivory/50">{line.detail}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-3 border-t border-ivory/10 pt-5 text-sm">
        <div className="flex justify-between text-ivory/70">
          <dt>Барааны дүн</dt>
          <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-ivory/70">
          <dt>Хүргэлт</dt>
          <dd className="tabular-nums">{order.deliveryFee ? formatPrice(order.deliveryFee) : "Үнэгүй"}</dd>
        </div>
        <div className="flex justify-between text-ivory/70">
          <dt>Төлбөр</dt>
          <dd>
            {methodLabel} · {order.paid ? <span className="text-blush-100">Төлөгдсөн ✓</span> : "Хүлээгдэж байна"}
          </dd>
        </div>
        <div className="flex justify-between text-ivory/70">
          <dt>Төлөв</dt>
          <dd>{orderStatusLabel(order.status)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-ivory/10 pt-4">
          <dt className="text-xs tracking-[0.16em] text-ivory/60 uppercase">Нийт</dt>
          <dd className="font-display text-3xl text-gold-soft tabular-nums">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-6 border-b border-ivory/10 pb-4 font-display text-3xl font-light">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="mb-2 text-xs tracking-[0.2em] text-ivory/50 uppercase">{label}</dt>
      <dd className="leading-relaxed">{children}</dd>
    </div>
  );
}
