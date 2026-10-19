"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { BloomLoader } from "@/components/ui/BloomLoader";
import { CartLineRow } from "@/components/ui/CartLineRow";
import { CartSummary } from "@/components/ui/CartSummary";
import { CARD_MAX_LENGTH } from "@/data/bouquet";
import type { CartFlower } from "@/lib/cart";
import {
  checkoutSchema,
  paymentMethods,
  type CheckoutInput,
  type CheckoutValues,
  type OrderResponse,
} from "@/lib/checkout";
import { districts, getDeliveryDays, type SlotInfo } from "@/lib/delivery";
import { useCart } from "@/lib/store";
import { useCartView } from "@/lib/useCartView";
import { useMinuteClock } from "@/lib/useMinuteClock";
import { cn } from "@/lib/utils";

const FORM_ID = "checkout-form";
const CARD_IDEAS = ["Төрсөн өдрийн мэнд хүргэе!", "Хайртай шүү ♡", "Баярлалаа", "Эрүүл энх байгаарай"];

const inputClass =
  "w-full border-b border-ivory/20 bg-transparent py-3 text-base text-ivory placeholder:text-ivory/30 transition-colors duration-300 outline-none focus:border-blush-300 aria-invalid:border-blush-300/80";

/**
 * Checkout: хүлээн авагч, хүргэлт (дүүрэг/хороо/хаяг, өдөр + цагийн завсар), бэлгийн карт,
 * захиалагч (нэрээ нууцлах), төлбөрийн хэлбэр. Validation нь `checkoutSchema` (сервертэй нэг).
 * Илгээсний дараа сагсыг цэвэрлэж захиалгын баталгаажсан хуудас руу шилжинэ.
 */
export function CheckoutForm({ catalog, slots }: { catalog: CartFlower[]; slots: SlotInfo[] }) {
  const router = useRouter();
  const { ready, lines, totals, items, bouquets } = useCartView(catalog);
  const storedDelivery = useCart((s) => s.delivery);
  const setBouquetPrice = useCart((s) => s.setBouquetPrice);
  const clear = useCart((s) => s.clear);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      recipientName: "",
      recipientPhone: "",
      district: undefined,
      khoroo: "",
      address: "",
      deliveryDate: "",
      deliverySlot: undefined,
      cardMessage: "",
      senderName: "",
      senderPhone: "",
      anonymous: false,
      payment: "qpay",
    },
  });

  const [district, deliveryDate, deliverySlot, cardMessage, anonymous, payment] = useWatch({
    control,
    name: ["district", "deliveryDate", "deliverySlot", "cardMessage", "anonymous", "payment"],
  });

  const now = useMinuteClock();
  const days = useMemo(() => (now === null ? [] : getDeliveryDays(now, slots)), [now, slots]);
  const day = days.find((d) => d.date === deliveryDate);

  // Анх (эсвэл цаг өнгөрч сонголт хүчингүй болоход): сагсанд хадгалсан сонголт → эхний боломжтой завсар
  useEffect(() => {
    if (!days.length) return;
    const valid = (date?: string, slot?: string) =>
      days.find((d) => d.date === date)?.slots.some((s) => s.id === slot && s.available);
    if (valid(deliveryDate, deliverySlot)) return;
    const start = valid(storedDelivery?.date, storedDelivery?.slot)
      ? storedDelivery!
      : { date: days[0].date, slot: days[0].slots.find((s) => s.available)!.id };
    setValue("deliveryDate", start.date);
    setValue("deliverySlot", start.slot as CheckoutInput["deliverySlot"]);
  }, [days, deliveryDate, deliverySlot, storedDelivery, setValue]);

  const chooseDay = (date: string) => {
    const next = days.find((d) => d.date === date)!;
    const keep = next.slots.find((s) => s.id === deliverySlot && s.available);
    setValue("deliveryDate", date, { shouldValidate: true });
    setValue("deliverySlot", (keep ?? next.slots.find((s) => s.available)!).id as CheckoutInput["deliverySlot"], {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: CheckoutValues) => {
    setServerError(null);
    let result: OrderResponse;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: values,
          items,
          // id, price-ийг сервер өөрөө (дахин үнэлж) тогтооно
          bouquets: bouquets.map((b) => ({
            stems: b.stems,
            greenery: b.greenery,
            paper: b.paper,
            ribbon: b.ribbon,
            message: b.message,
            quantity: b.quantity,
          })),
          expectedTotal: totals.total,
        }),
      });
      result = await res.json();
    } catch {
      setServerError("Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.");
      return;
    }

    if (!result.ok) {
      setServerError(result.message);
      if (result.code === "delivery") setError("deliverySlot", { message: result.message });
      // Шинэ үнийг сагсанд тусгана — хэрэглэгч шинэ дүнг хараад дахин илгээнэ
      result.bouquetPrices?.forEach((price, i) => bouquets[i] && setBouquetPrice(bouquets[i].id, price));
      return;
    }

    setPlaced(true);
    router.push(`/order/${result.id}`);
    clear();
  };

  if (placed) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <BloomLoader visible />
        <p className="text-sm text-ivory/60">Захиалгыг баталгаажуулж байна…</p>
      </div>
    );
  }

  if (!ready) return <div aria-hidden className="h-96 animate-pulse bg-ivory/[0.03]" />;

  if (lines.length === 0) {
    return (
      <div className="max-w-xl space-y-8">
        <p className="text-lg text-ivory/60">Сагс хоосон байна — захиалахын өмнө цэцгээ сонгоорой.</p>
        <Link
          href="/catalog"
          className="inline-block bg-gold-soft px-8 py-4 text-xs tracking-[0.2em] text-plum-950 uppercase transition-colors duration-500 hover:bg-blush-100"
        >
          Каталог үзэх
        </Link>
      </div>
    );
  }

  const khorooCount = districts.find((d) => d.name === district)?.khoroo ?? 0;

  return (
    <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20">
      <form id={FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-16">
        <Section index={1} title="Хүлээн авагч">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Нэр" error={errors.recipientName}>
              {(a) => <input {...a} {...register("recipientName")} autoComplete="shipping name" className={inputClass} />}
            </Field>
            <Field label="Утас" error={errors.recipientPhone} hint="8 оронтой Монгол дугаар">
              {(a) => (
                <input
                  {...a}
                  {...register("recipientPhone")}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="shipping tel-national"
                  placeholder="9911 2233"
                  className={cn(inputClass, "tabular-nums")}
                />
              )}
            </Field>
          </div>
        </Section>

        <Section index={2} title="Хүргэлт" aside="Улаанбаатар хот дотор">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Дүүрэг" error={errors.district}>
              {(a) => (
                <select
                  {...a}
                  {...register("district", { onChange: () => setValue("khoroo", "") })}
                  className={cn(inputClass, "appearance-none bg-plum-950")}
                >
                  <option value="">Сонгох</option>
                  {districts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Хороо" error={errors.khoroo}>
              {(a) => (
                <select
                  {...a}
                  {...register("khoroo")}
                  disabled={!khorooCount}
                  className={cn(inputClass, "appearance-none bg-plum-950 tabular-nums disabled:text-ivory/30")}
                >
                  <option value="">{khorooCount ? "Сонгох" : "Эхлээд дүүргээ сонгоно уу"}</option>
                  {Array.from({ length: khorooCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}-р хороо
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Дэлгэрэнгүй хаяг" error={errors.address} className="sm:col-span-2">
              {(a) => (
                <textarea
                  {...a}
                  {...register("address")}
                  rows={2}
                  autoComplete="shipping street-address"
                  placeholder="Хотхон, байр, орц, давхар, тоот, орцны код"
                  className={cn(inputClass, "resize-none")}
                />
              )}
            </Field>
          </div>

          <fieldset className="mt-10 min-w-0">
            <legend className="mb-4 text-xs tracking-[0.3em] text-ivory/50 uppercase">Хүргэх өдөр, цаг</legend>
            {days.length ? (
              <div className="space-y-4">
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Хүргэх өдөр">
                  {days.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      aria-pressed={d.date === deliveryDate}
                      onClick={() => chooseDay(d.date)}
                      className={cn(
                        "flex shrink-0 flex-col items-start border px-3.5 py-2 text-left transition-colors duration-300",
                        d.date === deliveryDate ? "border-blush-300 bg-blush-300/5" : "border-ivory/15 hover:border-gold-soft/50",
                      )}
                    >
                      <span className="text-sm">{d.label}</span>
                      <span className="text-[0.7rem] text-ivory/50 tabular-nums">{d.sublabel}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Хүргэх цаг">
                  {day?.slots.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.available}
                      aria-pressed={s.id === deliverySlot}
                      onClick={() => setValue("deliverySlot", s.id as CheckoutInput["deliverySlot"], { shouldValidate: true })}
                      className={cn(
                        "border px-3 py-2.5 text-sm tabular-nums transition-colors duration-300 disabled:cursor-not-allowed disabled:text-ivory/30 disabled:line-through",
                        s.id === deliverySlot
                          ? "border-blush-300 bg-blush-300/5 text-blush-100"
                          : "border-ivory/15 text-ivory/80 enabled:hover:border-gold-soft/50",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div aria-hidden className="h-[7.75rem] animate-pulse bg-ivory/[0.03]" />
            )}
            <ErrorText error={errors.deliverySlot ?? errors.deliveryDate} />
          </fieldset>
        </Section>

        <Section index={3} title="Бэлгийн карт" aside="Сонголтоор">
          <Field label="Картын бичвэр" error={errors.cardMessage}>
            {(a) => (
              <textarea
                {...a}
                {...register("cardMessage")}
                rows={3}
                maxLength={CARD_MAX_LENGTH}
                placeholder="Гараар бичсэн мэт зөөлөн картанд хэвлэнэ"
                className={cn(inputClass, "resize-none font-display text-xl font-light italic")}
              />
            )}
          </Field>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {CARD_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setValue("cardMessage", idea, { shouldValidate: true })}
                  className="border border-ivory/10 px-3 py-1.5 text-xs text-ivory/60 transition-colors hover:border-gold-soft/50 hover:text-blush-100"
                >
                  {idea}
                </button>
              ))}
            </div>
            <p className="text-xs text-ivory/40 tabular-nums">
              {cardMessage?.length ?? 0} / {CARD_MAX_LENGTH}
            </p>
          </div>
        </Section>

        <Section index={4} title="Захиалагч">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Таны нэр" error={errors.senderName}>
              {(a) => <input {...a} {...register("senderName")} autoComplete="name" className={inputClass} />}
            </Field>
            <Field label="Таны утас" error={errors.senderPhone} hint="Захиалгын талаар зөвхөн танд холбогдоно">
              {(a) => (
                <input
                  {...a}
                  {...register("senderPhone")}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="8811 2233"
                  className={cn(inputClass, "tabular-nums")}
                />
              )}
            </Field>
          </div>
          <label className="mt-8 flex cursor-pointer items-start gap-4 border border-ivory/10 p-5 transition-colors has-checked:border-blush-300/60 has-checked:bg-blush-300/5 has-focus-visible:outline-2 has-focus-visible:outline-blush-300">
            <input type="checkbox" {...register("anonymous")} className="peer sr-only" />
            <span
              aria-hidden
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-ivory/30 text-xs text-plum-950 peer-checked:border-blush-300 peer-checked:bg-blush-300"
            >
              {anonymous && "✓"}
            </span>
            <span>
              <span className="block text-sm">Нэрээ нууцлах</span>
              <span className="mt-1 block text-xs leading-relaxed text-ivory/50">
                Карт болон хүргэлтийн үед хүлээн авагчид таны нэрийг хэлэхгүй — «Нууц хүнээс» гэж бичнэ.
              </span>
            </span>
          </label>
        </Section>

        <Section index={5} title="Төлбөр">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer flex-col gap-1.5 border p-5 transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-blush-300",
                  payment === m.id ? "border-blush-300 bg-blush-300/5" : "border-ivory/15 hover:border-gold-soft/50",
                )}
              >
                <input type="radio" value={m.id} {...register("payment")} className="sr-only" />
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm">{m.label}</span>
                  {m.id === "qpay" && <QPayMark />}
                </span>
                <span className="text-xs leading-relaxed text-ivory/50">{m.description}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-ivory/40">
            Туршилтын горим: бодит төлбөр авахгүй. Төлбөрийн заавар захиалга баталгаажсаны дараа гарна.
          </p>
        </Section>
      </form>

      <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <div className="border border-ivory/10 bg-plum-800/20 p-6 sm:p-8">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-xs tracking-[0.3em] text-gold-soft uppercase">Таны захиалга</p>
            <Link href="/cart" className="text-xs text-ivory/50 underline-offset-4 transition-colors hover:text-blush-100 hover:underline">
              Засах
            </Link>
          </div>
          <ul className="mb-6 divide-y divide-ivory/10">
            {lines.map((line) => (
              <CartLineRow key={line.key} line={line} compact />
            ))}
          </ul>
          <CartSummary totals={totals} />

          {serverError && (
            <p role="alert" className="mt-6 border border-blush-300/40 bg-blush-300/5 px-4 py-3 text-sm text-blush-100">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="mt-8 w-full bg-gold-soft px-8 py-4 text-xs tracking-[0.2em] text-plum-950 uppercase transition-colors duration-500 hover:bg-blush-100 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Илгээж байна…" : "Захиалга баталгаажуулах"}
          </button>
          {Object.keys(errors).length > 0 && (
            <p className="mt-3 text-center text-xs text-blush-300">Тэмдэглэгдсэн талбаруудыг шалгана уу.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({ index, title, aside, children }: { index: number; title: string; aside?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-ivory/10 pb-4">
        <h2 className="flex items-baseline gap-4">
          <span className="text-xs tracking-[0.3em] text-gold-soft tabular-nums">{String(index).padStart(2, "0")}</span>
          <span className="font-display text-3xl font-light">{title}</span>
        </h2>
        {aside && <p className="text-xs tracking-[0.2em] text-ivory/45 uppercase">{aside}</p>}
      </div>
      {children}
    </section>
  );
}

type FieldError = { message?: string };
type FieldA11y = { id: string; "aria-invalid": boolean; "aria-describedby"?: string };

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: FieldError;
  hint?: string;
  className?: string;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs tracking-[0.2em] text-ivory/50 uppercase">
        {label}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {error ? (
        <ErrorText id={`${id}-error`} error={error} />
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 text-xs text-ivory/40">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function ErrorText({ id, error }: { id?: string; error?: FieldError }) {
  if (!error?.message) return null;
  return (
    <p id={id} className="mt-2 text-xs text-blush-300">
      {error.message}
    </p>
  );
}

/** QPay-ийн лого биш — ерөнхий QR тэмдэг */
function QPayMark() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1.5" y="1.5" width="5" height="5" />
      <rect x="9.5" y="1.5" width="5" height="5" />
      <rect x="1.5" y="9.5" width="5" height="5" />
      <path d="M9.5 9.5h2v2h-2zM12.5 12.5h2v2h-2zM12.5 9.5h2M9.5 13.5h2" />
    </svg>
  );
}
