"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { brand } from "@/lib/brand";
import type { PaymentMethod } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Mock төлбөр. QPay: жишээ QR (уншигдахгүй), банкны шилжүүлэг: жишээ данс.
 * «Төлбөр шалгах» нь `/api/orders/[id]/pay`-аар төлөгдсөн гэж тэмдэглэнэ —
 * жинхэнэ интеграцид QPay invoice / callback, банкны хуулга шалгалтаар солигдоно.
 */
const BANK = { name: "Жишээ банк", account: "0000 0000 00", holder: brand.company };

export function PaymentPanel({
  orderId,
  number,
  total,
  method,
}: {
  orderId: string;
  number: string;
  total: number;
  method: PaymentMethod;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const check = () =>
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" }).catch(() => null);
      if (!res?.ok) {
        setError("Төлбөр шалгаж чадсангүй. Дахин оролдоно уу.");
        return;
      }
      router.refresh();
    });

  return (
    <section className="border border-gold-soft/30 bg-plum-800/20 p-6 sm:p-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl font-light">{method === "qpay" ? "QPay-ээр төлөх" : "Дансаар шилжүүлэх"}</h2>
        <span className="text-xs tracking-[0.2em] text-ivory/40 uppercase">Туршилт</span>
      </div>

      {method === "qpay" ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <MockQr seed={number} />
          <div className="space-y-3 text-sm text-ivory/70">
            <p>Банкны аппаараа QR кодыг уншуулж төлнө үү.</p>
            <p>
              Төлөх дүн: <span className="text-gold-soft tabular-nums">{formatPrice(total)}</span>
            </p>
            <p className="text-xs text-ivory/40">Энэ QR нь жишээ — бодит гүйлгээ хийгдэхгүй.</p>
          </div>
        </div>
      ) : (
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <Row label="Банк" value={BANK.name} />
          <Row label="Хүлээн авагч" value={BANK.holder} />
          <Row label="Дансны дугаар" value={BANK.account} copy />
          <Row label="Дүн" value={formatPrice(total)} copy={String(total)} />
          <Row label="Гүйлгээний утга" value={number} copy wide />
        </dl>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={check}
          disabled={pending}
          className="btn-primary disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Шалгаж байна…" : "Төлбөр шалгах"}
        </button>
        <p role="status" className="text-xs text-blush-300">
          {error}
        </p>
      </div>
    </section>
  );
}

function Row({ label, value, copy, wide }: { label: string; value: string; copy?: boolean | string; wide?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="mb-1 text-xs tracking-[0.2em] text-ivory/50 uppercase">{label}</dt>
      <dd className="flex items-center gap-3 tabular-nums">
        {value}
        {copy && (
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                ?.writeText(typeof copy === "string" ? copy : value.replace(/\s/g, ""))
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                })
                .catch(() => {})
            }
            className="text-[0.7rem] tracking-[0.15em] text-ivory/45 uppercase transition-colors hover:text-blush-100"
          >
            {copied ? "Хуулсан ✓" : "Хуулах"}
          </button>
        )}
      </dd>
    </div>
  );
}

const SIZE = 25;

/** Захиалгын дугаараас тогтмол хэв гаргасан жишээ QR (finder хэлбэртэй, уншигдахгүй) */
function MockQr({ seed }: { seed: string }) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296;

  const finder = (x: number, y: number) =>
    [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (!finder(x, y) && rand() > 0.52) cells.push([x, y]);

  return (
    <svg viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`} role="img" aria-label="Жишээ QR код" className="size-44 shrink-0 bg-ivory">
      {[[0, 0], [SIZE - 7, 0], [0, SIZE - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="none" stroke="var(--color-plum-950)">
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="var(--color-plum-950)" stroke="none" />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="var(--color-plum-950)" />
      ))}
    </svg>
  );
}
