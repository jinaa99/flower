"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import {
  CARD_MAX_LENGTH,
  greenery as greeneryOptions,
  MAX_GREENERY,
  MAX_STEMS,
  MIN_STEMS,
  papers,
  ribbons,
} from "@/data/bouquet";
import type { FlowerSlug } from "@/data/flowers";
import {
  priceBouquet,
  stemsBySlug,
  suggestPairings,
  type BouquetConfig,
  type BuilderFlower,
  type StemLine,
} from "@/lib/bouquet";
import { useCart, type CartItem, type CustomBouquet } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { BouquetPreview } from "./BouquetPreview";

/** «Хамт тохирох»-оос нэг товшилтоор нэмэх иш */
const SUGGEST_STEMS = 3;
const MESSAGE_IDEAS = ["Төрсөн өдрийн мэнд хүргэе!", "Хайртай шүү ♡", "Баярлалаа", "Эрүүл энх байгаарай"];

const noopSubscribe = () => () => {};

const emptyConfig = (stems: StemLine[] = []): BouquetConfig => ({
  stems,
  greenery: { eucalyptus: 3 },
  paper: "ivory",
  ribbon: "gold",
  message: "",
});

/**
 * Баглаа бүрдүүлэгч: цэцэг (өнгө, иш тоогоор), ногоон навч, боодол, карт → live preview,
 * бодит цагийн үнэ. Нөөц = агуулахын иш − сагсанд аль хэдийн байгаа иш (энгийн баглаа ба
 * custom баглаа). Дууссан баглаа сагсанд нэг custom item болж орно.
 */
export function BouquetBuilder({ flowers, initialSlug }: { flowers: BuilderFlower[]; initialSlug?: string }) {
  const bySlug = useMemo(() => new Map(flowers.map((f) => [f.slug, f])), [flowers]);
  const [config, setConfig] = useState<BouquetConfig>(() => {
    const start = flowers.find((f) => f.slug === initialSlug && f.stock > 0);
    return emptyConfig(start ? [{ slug: start.slug, color: 0, count: Math.min(5, start.stock) }] : []);
  });
  const [activeColor, setActiveColor] = useState<Partial<Record<FlowerSlug, number>>>({});
  const [addedAt, setAddedAt] = useState<number | null>(null);

  // persist store нь localStorage-аас уншдаг — hydration-ий дараа л сагсны нөөцийг тооцно
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const items = useCart((s) => s.items);
  const bouquets = useCart((s) => s.bouquets);
  const addBouquet = useCart((s) => s.addBouquet);
  const reserved = useMemo(
    () => (mounted ? reservedStems(items, bouquets, bySlug) : new Map<string, number>()),
    [mounted, items, bouquets, bySlug],
  );

  const chosen = stemsBySlug(config.stems);
  const { lines, stemCount, total } = priceBouquet(config, bySlug);
  const available = (f: BuilderFlower) => Math.max(0, f.stock - (reserved.get(f.slug) ?? 0));
  const suggestions = suggestPairings([...chosen.keys()], flowers).filter((f) => available(f) > 0);
  const tooFew = stemCount < MIN_STEMS;
  // Өөр tab-д сагс өөрчлөгдвөл сонголт нөөцөөс хэтэрч болно
  const over = flowers.filter((f) => (chosen.get(f.slug) ?? 0) > available(f));

  const setStems = (slug: FlowerSlug, color: number, count: number) =>
    setConfig((c) => {
      const rest = c.stems.filter((s) => !(s.slug === slug && s.color === color));
      return { ...c, stems: count > 0 ? [...rest, { slug, color, count }] : rest };
    });

  /** Нөөц болон баглааны дээд хэмжээнээс хэтрэхгүй нэмэх боломжтой иш */
  const room = (f: BuilderFlower) =>
    Math.min(available(f) - (chosen.get(f.slug) ?? 0), MAX_STEMS - stemCount);

  const add = () => {
    addBouquet(config, total);
    setAddedAt(Date.now());
    // Нэмсэн баглааны иш одоо сагсанд нөөцлөгдсөн — дараагийн баглааг цэвэрээр эхлүүлнэ
    setConfig(emptyConfig());
  };

  const summary = (
    <Summary
      lines={lines}
      total={total}
      stemCount={stemCount}
      tooFew={tooFew}
      over={over}
      onAdd={add}
      disabled={!mounted || tooFew || over.length > 0}
    />
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_30rem]">
      <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:order-2 lg:self-start">
        {/* Цэцэгчний ширээ: дээрээс champagne гэрлийн тойрог, доор ширээний нарийн шугам */}
        <div className="relative mx-auto aspect-[400/520] max-h-[58svh] bg-[radial-gradient(ellipse_65%_50%_at_50%_32%,rgb(201_174_132/0.13),transparent_72%),linear-gradient(to_bottom,var(--color-plum-900),var(--color-plum-950))] after:absolute after:inset-x-8 after:bottom-[9%] after:h-px after:bg-linear-to-r after:from-transparent after:via-ivory/15 after:to-transparent lg:max-h-[min(34rem,calc(100svh-var(--header-height)-20rem))]">
          <BouquetPreview config={config} flowers={bySlug} />
          {stemCount === 0 && (
            <p className="pointer-events-none absolute inset-x-0 top-[7%] text-center font-display text-lg text-ivory/50 italic">
              Эхний ишээ сонгоорой
            </p>
          )}
        </div>
        <div className="mt-6 hidden lg:block">{summary}</div>
      </aside>

      <div className="min-w-0 space-y-16 pb-24 lg:order-1 lg:pb-0">
        {addedAt !== null && (
          <p role="status" className="flex flex-wrap items-center justify-between gap-4 border border-blush-300/40 bg-blush-300/5 px-5 py-4 text-sm text-blush-100">
            Баглаа сагсанд нэмэгдлээ ✓ Дараагийн баглаагаа бүрдүүлж болно.
            <Link href="/cart" className="text-xs tracking-[0.2em] uppercase underline-offset-4 hover:underline">
              Сагс руу очих →
            </Link>
          </p>
        )}

        <Step index={1} title="Цэцэг" aside={`${stemCount} / ${MAX_STEMS} иш`}>
          {suggestions.length > 0 && (
            <div className="mb-8 border border-gold-soft/20 bg-plum-800/20 p-5">
              <p className="mb-4 text-xs tracking-[0.16em] text-gold-soft uppercase">Хамт тохирох</p>
              <ul className="flex flex-wrap gap-2.5">
                {suggestions.map((f) => (
                  <li key={f.slug}>
                    <button
                      type="button"
                      disabled={room(f) <= 0}
                      onClick={() => setStems(f.slug, 0, Math.min(SUGGEST_STEMS, room(f)))}
                      className="flex items-center gap-2.5 border border-ivory/15 py-1.5 pr-3.5 pl-1.5 text-sm text-ivory/80 transition-colors duration-300 enabled:hover:border-blush-300 enabled:hover:text-blush-100 disabled:opacity-40"
                    >
                      <Thumb flower={f} className="size-8" />+ {f.nameMn}
                      <span className="text-xs text-ivory/45">{Math.min(SUGGEST_STEMS, Math.max(room(f), 0))} иш</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
            {flowers.map((f) => {
              const color = activeColor[f.slug] ?? 0;
              const count = config.stems.find((s) => s.slug === f.slug && s.color === color)?.count ?? 0;
              const totalForFlower = chosen.get(f.slug) ?? 0;
              const left = available(f);
              const soldOut = left === 0;
              return (
                <li key={f.slug} className={cn("flex items-center gap-4 py-4", soldOut && "opacity-45")}>
                  <Thumb flower={f} className="size-14" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-xl">{f.nameMn}</span>
                      <span className="text-[0.65rem] tracking-[0.2em] text-ivory/45 uppercase">{f.nameEn}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-ivory/50 tabular-nums">
                      <span className="text-gold-soft">{formatPrice(f.stemPrice)}</span> / иш
                      {soldOut ? " · Дууссан" : left < 30 ? ` · ${left} иш үлдсэн` : ""}
                      {totalForFlower > count && ` · нийт ${totalForFlower}`}
                    </p>
                    {f.colors.length > 1 && (
                      <div className="mt-2 flex gap-2" role="radiogroup" aria-label={`${f.nameMn} — өнгө`}>
                        {f.colors.map((c, i) => {
                          const n = config.stems.find((s) => s.slug === f.slug && s.color === i)?.count ?? 0;
                          return (
                            <button
                              key={c.hex}
                              type="button"
                              role="radio"
                              aria-checked={i === color}
                              aria-label={`${c.name}${n ? `, ${n} иш` : ""}`}
                              title={c.name}
                              onClick={() => setActiveColor((a) => ({ ...a, [f.slug]: i }))}
                              className={cn(
                                "relative size-5 rounded-full ring-offset-2 ring-offset-plum-950 transition-shadow duration-300",
                                i === color ? "ring-2 ring-blush-300" : "ring-1 ring-ivory/20 hover:ring-gold-soft/60",
                              )}
                              style={{ backgroundColor: c.hex }}
                            >
                              {n > 0 && i !== color && (
                                <span aria-hidden className="absolute -top-1 -right-1 size-2 rounded-full bg-gold-soft" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Stepper
                    label={`${f.nameMn}, ${f.colors[color].name}`}
                    value={count}
                    canDec={count > 0}
                    canInc={room(f) > 0}
                    onChange={(n) => setStems(f.slug, color, n)}
                  />
                </li>
              );
            })}
          </ul>
        </Step>

        <Step index={2} title="Ногоон навч">
          <ul className="grid gap-3 sm:grid-cols-2">
            {greeneryOptions.map((g) => {
              const n = config.greenery[g.id] ?? 0;
              return (
                <li key={g.id} className="flex items-center gap-4 border border-ivory/10 px-4 py-3">
                  <span aria-hidden className="size-8 shrink-0 rounded-full" style={{ backgroundColor: g.hex }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{g.nameMn}</p>
                    <p className="text-xs text-ivory/50 tabular-nums">
                      {g.nameEn} · {formatPrice(g.price)}
                    </p>
                  </div>
                  <Stepper
                    label={g.nameMn}
                    value={n}
                    canDec={n > 0}
                    canInc={n < MAX_GREENERY}
                    onChange={(v) => setConfig((c) => ({ ...c, greenery: { ...c.greenery, [g.id]: v } }))}
                  />
                </li>
              );
            })}
          </ul>
        </Step>

        <Step index={3} title="Боодол">
          <fieldset className="min-w-0">
            <legend className="mb-4 text-xs tracking-[0.16em] text-ivory/50 uppercase">Цаас</legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {papers.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "cursor-pointer border p-2 transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-blush-300",
                    config.paper === p.id ? "border-blush-300 bg-blush-300/5" : "border-ivory/15 hover:border-gold-soft/50",
                  )}
                >
                  <input
                    type="radio"
                    name="paper"
                    checked={config.paper === p.id}
                    onChange={() => setConfig((c) => ({ ...c, paper: p.id }))}
                    className="sr-only"
                  />
                  <span aria-hidden className="block h-12 ring-1 ring-ivory/10" style={{ backgroundColor: p.hex }} />
                  <span className="mt-2 block text-xs">{p.name}</span>
                  <span className="block text-[0.7rem] text-ivory/50 tabular-nums">{formatPrice(p.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-8 min-w-0">
            <legend className="mb-4 text-xs tracking-[0.16em] text-ivory/50 uppercase">Туузны өнгө</legend>
            <div className="flex flex-wrap gap-5">
              {ribbons.map((r) => (
                <label key={r.id} className="group flex cursor-pointer flex-col items-center gap-2">
                  <input
                    type="radio"
                    name="ribbon"
                    checked={config.ribbon === r.id}
                    onChange={() => setConfig((c) => ({ ...c, ribbon: r.id }))}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "size-8 rounded-full ring-offset-[3px] ring-offset-plum-950 transition-shadow duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blush-100",
                      config.ribbon === r.id ? "ring-2 ring-blush-300" : "ring-1 ring-ivory/20 group-hover:ring-gold-soft/60",
                    )}
                    style={{ backgroundColor: r.hex }}
                  />
                  <span className={cn("text-[0.7rem]", config.ribbon === r.id ? "text-blush-100" : "text-ivory/55")}>
                    {r.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Step>

        <Step index={4} title="Карт дээрх бичвэр" aside="Үнэгүй">
          <label htmlFor="card-message" className="sr-only">
            Карт дээрх бичвэр
          </label>
          <textarea
            id="card-message"
            value={config.message}
            maxLength={CARD_MAX_LENGTH}
            onChange={(e) => setConfig((c) => ({ ...c, message: e.target.value }))}
            rows={3}
            placeholder="Хайрт ээждээ…"
            className="w-full resize-none border border-ivory/15 bg-plum-800/25 px-4 py-3 font-display text-lg text-ivory italic transition-colors duration-300 placeholder:text-ivory/30 hover:border-ivory/25 focus:border-blush-300/60 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-2">
              {MESSAGE_IDEAS.map((idea) => (
                <li key={idea}>
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, message: idea }))}
                    className="border border-ivory/10 px-3 py-1.5 text-xs text-ivory/60 transition-colors duration-300 hover:border-gold-soft/50 hover:text-ivory"
                  >
                    {idea}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ivory/40 tabular-nums">
              {config.message.length} / {CARD_MAX_LENGTH}
            </p>
          </div>
        </Step>

        <div className="lg:hidden">{summary}</div>
      </div>

      {/* Mobile: нийт үнэ ба товч үргэлж харагдана */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-ivory/10 bg-plum-950/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] tracking-[0.2em] text-ivory/50 uppercase tabular-nums">{stemCount} иш</p>
          <p className="font-display text-2xl text-gold-soft tabular-nums">{formatPrice(total)}</p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!mounted || tooFew || over.length > 0}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Сагсанд нэмэх
        </button>
      </div>
    </div>
  );
}

/** Сагсанд аль хэдийн байгаа иш: энгийн баглаа (хэмжээний иш × тоо) + custom баглаа */
function reservedStems(
  items: CartItem[],
  bouquets: CustomBouquet[],
  flowers: ReadonlyMap<string, BuilderFlower>,
): Map<string, number> {
  const map = new Map<string, number>();
  const put = (slug: string, n: number) => map.set(slug, (map.get(slug) ?? 0) + n);
  for (const i of items) put(i.slug, (flowers.get(i.slug)?.sizeStems[i.size] ?? 0) * i.quantity);
  for (const b of bouquets) for (const s of b.stems) put(s.slug, s.count * b.quantity);
  return map;
}

function Step({ index, title, aside, children }: { index: number; title: string; aside?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ivory/10 pb-4">
        <h2 className="flex items-baseline gap-4">
          <span className="text-xs tracking-[0.16em] text-gold-soft tabular-nums">{String(index).padStart(2, "0")}</span>
          <span className="font-display text-3xl font-light">{title}</span>
        </h2>
        {aside && <p className="text-xs tracking-[0.2em] text-ivory/45 uppercase tabular-nums">{aside}</p>}
      </div>
      {children}
    </section>
  );
}

function Stepper({
  label,
  value,
  canDec,
  canInc,
  onChange,
}: {
  label: string;
  value: number;
  canDec: boolean;
  canInc: boolean;
  onChange: (value: number) => void;
}) {
  const button =
    "flex size-10 items-center justify-center text-lg text-ivory/70 transition-colors enabled:hover:text-blush-100 disabled:text-ivory/20";
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center border border-ivory/15">
      <button type="button" aria-label="Хасах" disabled={!canDec} onClick={() => onChange(value - 1)} className={button}>
        −
      </button>
      <output aria-live="polite" className={cn("w-7 text-center text-sm tabular-nums", value > 0 && "text-blush-100")}>
        {value}
      </output>
      <button type="button" aria-label="Нэмэх" disabled={!canInc} onClick={() => onChange(value + 1)} className={button}>
        +
      </button>
    </div>
  );
}

function Thumb({ flower, className }: { flower: BuilderFlower; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}
      // Зураггүй үед цэцгийн өнгөөр gradient (каталогийн карттай ижил)
      style={{
        background:
          flower.thumb?.color ??
          `linear-gradient(160deg, ${flower.colors[0].hex}, ${flower.colors.at(-1)!.hex} 70%, #3a1c30)`,
      }}
    >
      {flower.thumb && <FlowerPhoto src={flower.thumb.src} alt="" fill sizes="56px" className="object-cover" />}
    </span>
  );
}

type SummaryProps = {
  lines: ReturnType<typeof priceBouquet>["lines"];
  total: number;
  stemCount: number;
  tooFew: boolean;
  over: BuilderFlower[];
  disabled: boolean;
  onAdd: () => void;
};

function Summary({ lines, total, stemCount, tooFew, over, disabled, onAdd }: SummaryProps) {
  return (
    <div>
      <ul className="max-h-48 space-y-2 overflow-y-auto pr-1 text-sm" data-lenis-prevent>
        {lines.map((l) => (
          <li key={l.key} className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 text-ivory/70">
              {l.label}
              {l.detail && <span className="ml-2 text-xs text-ivory/40 tabular-nums">{l.detail}</span>}
            </span>
            <span className="shrink-0 text-ivory/80 tabular-nums">{l.amount ? formatPrice(l.amount) : "—"}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-ivory/10 pt-4">
        <span className="text-xs tracking-[0.16em] text-ivory/50 uppercase">Нийт</span>
        <span aria-live="polite" className="font-display text-4xl text-gold-soft tabular-nums">
          {formatPrice(total)}
        </span>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="mt-5 w-full btn-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Баглааг сагсанд нэмэх
      </button>
      {over.length > 0 && (
        <p role="alert" className="mt-3 text-center text-xs text-blush-100">
          Нөөц хүрэлцэхгүй: {over.map((f) => f.nameMn).join(", ")} — ишийн тоог багасгана уу
        </p>
      )}
      {tooFew && (
        <p className="mt-3 text-center text-xs text-ivory/50">
          {stemCount === 0 ? `Дор хаяж ${MIN_STEMS} иш цэцэг сонгоно уу` : `Дахиад ${MIN_STEMS - stemCount} иш нэмнэ үү`}
        </p>
      )}
    </div>
  );
}
