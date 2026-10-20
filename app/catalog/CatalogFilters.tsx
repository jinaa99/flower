"use client";

import type { ReactNode } from "react";
import { colorFamilies, type CatalogFilters } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";

export type FilterOptions = {
  types: { id: string; label: string }[];
  occasions: { id: string; label: string }[];
  price: { min: number; max: number; step: number };
};

type PanelProps = {
  filters: CatalogFilters;
  options: FilterOptions;
  update: (patch: Partial<CatalogFilters>) => void;
};

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** Desktop-ийн хажуугийн самбар болон mobile-ийн sheet хоёулаа ашиглана */
export function FilterPanel({ filters, options, update }: PanelProps) {
  return (
    <div className="space-y-10">
      <label className="group flex cursor-pointer items-center justify-between gap-4">
        <span className="text-sm text-ivory/80">Зөвхөн нөөцтэй</span>
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => update({ inStock: e.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-6 w-11 shrink-0 rounded-full border border-ivory/20 transition-colors duration-300 peer-checked:border-blush-300 peer-checked:bg-blush-300/20 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blush-300 after:absolute after:top-1/2 after:left-1 after:size-4 after:-translate-y-1/2 after:rounded-full after:bg-ivory/50 after:transition-[translate,background-color] after:duration-300 after:ease-bloom peer-checked:after:translate-x-[1.125rem] peer-checked:after:bg-blush-300"
        />
      </label>

      <Section title="Өнгө">
        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {colorFamilies.map((c) => {
            const checked = filters.colors.includes(c.id);
            return (
              <label key={c.id} className="group flex cursor-pointer flex-col items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => update({ colors: toggle(filters.colors, c.id) })}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    "size-8 rounded-full ring-offset-[3px] ring-offset-plum-950 transition-[box-shadow,scale] duration-300 ease-bloom peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blush-100",
                    checked ? "scale-105 ring-2 ring-blush-300" : "ring-1 ring-ivory/15 group-hover:ring-gold-soft/60",
                  )}
                />
                <span className={cn("text-[0.65rem] tracking-wide", checked ? "text-blush-100" : "text-ivory/55")}>
                  {c.label}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Төрөл">
        <ChipGroup
          options={options.types}
          selected={filters.types}
          onToggle={(id) => update({ types: toggle(filters.types, id) })}
        />
      </Section>

      <Section title="Тохиолдол">
        <ChipGroup
          options={options.occasions}
          selected={filters.occasions}
          onToggle={(id) => update({ occasions: toggle(filters.occasions, id) })}
        />
      </Section>

      <Section title="Эхлэх үнэ">
        <PriceRange
          bounds={options.price}
          min={filters.min}
          max={filters.max}
          onChange={(min, max) => update({ min, max })}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 text-xs tracking-[0.16em] text-gold-soft uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const checked = selected.includes(o.id);
        return (
          <label
            key={o.id}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.78rem] transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blush-300",
              checked
                ? "border-ivory bg-ivory text-plum-950"
                : "border-ivory/15 text-ivory/70 hover:border-ivory/45 hover:text-ivory",
            )}
          >
            <input type="checkbox" checked={checked} onChange={() => onToggle(o.id)} className="sr-only" />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/** Хоёр бариултай үнийн хязгаар. Хязгаар дээр очсон утга нь null (хязгааргүй) — URL цэвэрхэн үлдэнэ. */
function PriceRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: FilterOptions["price"];
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  const lo = clamp(min ?? bounds.min, bounds.min, bounds.max);
  const hi = clamp(max ?? bounds.max, lo, bounds.max);
  const pct = (v: number) => (v - bounds.min) / (bounds.max - bounds.min);
  const commit = (nextLo: number, nextHi: number) =>
    onChange(nextLo <= bounds.min ? null : nextLo, nextHi >= bounds.max ? null : nextHi);

  return (
    <div>
      <div className="price-range relative h-6">
        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-ivory/15" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-gold-soft"
          style={{
            left: `calc(0.5rem + (100% - 1rem) * ${pct(lo)})`,
            right: `calc(0.5rem + (100% - 1rem) * ${1 - pct(hi)})`,
          }}
        />
        <input
          type="range"
          aria-label="Доод үнэ"
          aria-valuetext={formatPrice(lo)}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={lo}
          onChange={(e) => commit(Math.min(Number(e.target.value), hi - bounds.step), hi)}
          // Хоёр бариул давхцахад доод нь дээр гарч, баруун тийш чирэгдэх боломжтой үлдэнэ
          className={cn(pct(lo) > 0.9 && "z-10")}
        />
        <input
          type="range"
          aria-label="Дээд үнэ"
          aria-valuetext={formatPrice(hi)}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={hi}
          onChange={(e) => commit(lo, Math.max(Number(e.target.value), lo + bounds.step))}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-ivory/60 tabular-nums">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Идэвхтэй шүүлтүүрүүд — нэг бүрчлэн «×»-ээр арилгана */
export function ActiveFilters({ filters, options, update, clear }: PanelProps & { clear: () => void }) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  const q = filters.q.trim();
  if (q) chips.push({ key: "q", label: `«${q}»`, remove: () => update({ q: "" }) });
  if (filters.inStock) chips.push({ key: "stock", label: "Нөөцтэй", remove: () => update({ inStock: false }) });
  for (const id of filters.colors) {
    const c = colorFamilies.find((f) => f.id === id);
    if (c) chips.push({ key: `c-${id}`, label: c.label, remove: () => update({ colors: toggle(filters.colors, id) }) });
  }
  for (const id of filters.types) {
    const t = options.types.find((o) => o.id === id);
    if (t) chips.push({ key: `t-${id}`, label: t.label, remove: () => update({ types: toggle(filters.types, id) }) });
  }
  for (const id of filters.occasions) {
    const o = options.occasions.find((x) => x.id === id);
    if (o)
      chips.push({ key: `o-${id}`, label: o.label, remove: () => update({ occasions: toggle(filters.occasions, id) }) });
  }
  if (filters.min !== null || filters.max !== null) {
    const label = `${formatPrice(filters.min ?? options.price.min)} – ${formatPrice(filters.max ?? options.price.max)}`;
    chips.push({ key: "price", label, remove: () => update({ min: null, max: null }) });
  }
  if (!chips.length) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.remove}
            aria-label={`${chip.label} шүүлтүүрийг арилгах`}
            className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/[0.04] py-1 pr-2.5 pl-3.5 text-[0.78rem] text-ivory transition-colors duration-300 hover:border-ivory/50"
          >
            {chip.label}
            <span aria-hidden className="text-ivory/50">
              ×
            </span>
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={clear}
          className="px-2 text-xs tracking-[0.15em] text-ivory/50 uppercase underline-offset-4 transition-colors hover:text-blush-100 hover:underline"
        >
          Бүгдийг арилгах
        </button>
      </li>
    </ul>
  );
}
