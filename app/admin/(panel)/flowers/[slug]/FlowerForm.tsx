"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminFlower } from "@/lib/adminCatalog";
import { cn } from "@/lib/utils";
import { updateFlower } from "../../../actions";
import { buttonClass, inputClass, labelClass, useFormAction } from "../../../ui";

const textareaClass = cn(inputClass, "min-h-28 resize-y leading-relaxed");

export function FlowerForm({ flower: f }: { flower: AdminFlower }) {
  const { state, pending, onSubmit } = useFormAction(updateFlower);

  return (
    <form onSubmit={onSubmit} className="space-y-14">
      <input type="hidden" name="slug" value={f.slug} />

      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl font-light sm:text-6xl">{f.nameMn}</h1>
          <p className="mt-2 text-sm tracking-[0.3em] text-ivory/50 uppercase">{f.slug}</p>
        </div>
        <Link
          href={`/flowers/${f.slug}`}
          className="text-xs tracking-[0.2em] text-ivory/50 uppercase transition-colors hover:text-blush-100"
        >
          Сайтад харах →
        </Link>
      </header>

      <Section title="Нэр">
        <div className="grid gap-8 sm:grid-cols-3">
          <Field label="Монгол нэр" name="nameMn" defaultValue={f.nameMn} required />
          <Field label="Англи нэр" name="nameEn" defaultValue={f.nameEn} required />
          <Field label="Латин нэр" name="latinName" defaultValue={f.latinName} />
        </div>
      </Section>

      <Section title="Нөөц, үнэ">
        <div className="grid gap-8 sm:grid-cols-[10rem_10rem]">
          <Field label="Нөөц (иш)" name="stock" type="number" min={0} defaultValue={f.stock} required />
          <Field label="Эрэлт (0–100)" name="popularity" type="number" min={0} max={100} defaultValue={f.popularity} required />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {f.variants.map((v) => (
            <fieldset key={v.id} className="border border-ivory/10 p-5">
              <legend className="px-2 font-display text-xl font-light">{v.size}</legend>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Иш" name={`variant:${v.id}:stems`} type="number" min={1} defaultValue={v.stems} required />
                <Field label="Үнэ (₮)" name={`variant:${v.id}:price`} type="number" min={1} defaultValue={v.price} required />
              </div>
            </fieldset>
          ))}
        </div>
      </Section>

      <Section title="Тайлбар">
        <div className="space-y-8">
          <Field label="Утга бэлгэдэл" name="meaning" defaultValue={f.meaning} multiline />
          <Field label="Гарал үүсэл" name="origin" defaultValue={f.origin} multiline />
          <Field label="Хүргэлтийн тэмдэглэл" name="deliveryNote" defaultValue={f.deliveryNote} multiline />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-6 border-t border-ivory/10 bg-plum-950/90 px-4 py-5 backdrop-blur">
        <p role="status" className={cn("text-sm", state?.ok ? "text-gold-soft" : "text-blush-300")}>
          {state?.message}
        </p>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Хадгалж байна…" : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-8 border-b border-ivory/10 pb-3 text-xs tracking-[0.3em] text-gold-soft uppercase">{title}</h2>
      {children}
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string | number;
  multiline?: boolean;
  type?: "text" | "number";
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
};

function Field({ label, name, multiline, type = "text", ...input }: FieldProps) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} defaultValue={input.defaultValue} className={textareaClass} />
      ) : (
        <input id={id} name={name} type={type} {...input} className={inputClass} />
      )}
    </div>
  );
}
