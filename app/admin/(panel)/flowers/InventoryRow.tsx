"use client";

import Link from "next/link";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import type { AdminFlower } from "@/lib/adminCatalog";
import { cn } from "@/lib/utils";
import { updateInventory } from "../../actions";
import { inputClass, labelClass, useFormAction } from "../../ui";

/** Жагсаалтын нэг мөр: нөөц + хэмжээ бүрийн үнийг шууд засна */
export function InventoryRow({ flower }: { flower: AdminFlower }) {
  const { state, pending, onSubmit } = useFormAction(updateInventory);
  const id = (name: string) => `${flower.slug}-${name}`;

  return (
    <li className="border border-ivory/10 bg-plum-800/20 p-5">
      <form onSubmit={onSubmit} className="grid items-end gap-x-6 gap-y-5 md:grid-cols-[14rem_6rem_1fr_auto]">
        <input type="hidden" name="slug" value={flower.slug} />

        <div className="flex items-center gap-4 self-center">
          <div className="relative size-12 shrink-0 overflow-hidden bg-plum-800">
            {flower.thumb && <FlowerPhoto src={flower.thumb} alt="" fill sizes="48px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <Link href={`/admin/flowers/${flower.slug}`} className="font-display text-xl font-light hover:text-blush-100">
              {flower.nameMn}
            </Link>
            <p className="text-xs text-ivory/45">{flower.nameEn}</p>
          </div>
        </div>

        <div>
          <label htmlFor={id("stock")} className={labelClass}>
            Нөөц (иш)
          </label>
          <input
            id={id("stock")}
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={flower.stock}
            className={cn(inputClass, flower.stock === 0 && "text-blush-300")}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {flower.variants.map((v) => (
            <div key={v.id}>
              <label htmlFor={id(v.id)} className={labelClass}>
                {v.size} · {v.stems} иш (₮)
              </label>
              <input
                id={id(v.id)}
                name={`variant:${v.id}:price`}
                type="number"
                min={1}
                required
                defaultValue={v.price}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <p role="status" className={cn("min-w-20 text-right text-xs", state?.ok ? "text-gold-soft" : "text-blush-300")}>
            {pending ? "…" : state?.message}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="border border-gold-soft/50 px-4 py-2 text-xs tracking-[0.15em] text-gold-soft uppercase transition-colors duration-300 hover:bg-gold-soft hover:text-plum-950 disabled:opacity-50"
          >
            Хадгалах
          </button>
        </div>
      </form>
    </li>
  );
}
