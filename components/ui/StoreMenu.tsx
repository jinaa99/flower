"use client";

import Link from "next/link";
import type { CoverImage } from "@/lib/data";
import type { StoreNav } from "@/lib/storeNav";
import { formatPrice } from "@/lib/utils";
import { FlowerPhoto } from "./FlowerPhoto";

type Props = {
  id: string;
  nav: StoreNav;
  /** «Өөрийн баглаа» хавтангийн зураг — гараар боосон баглаа */
  atelierImage: CoverImage | null;
  total: number;
  onNavigate: () => void;
};

/**
 * Header-ийн «Дэлгүүр» цэс (desktop): зүүн талд төрөл / тохиолдол / өнгө — текстэн жагсаалт, баруун
 * талд улирлын сонголт ба ателье — хоёр зурагтай хавтан. Нээх нь шууд (≈250ms fade), хөдөлгөөн бага.
 */
export function StoreMenu({ id, nav, atelierImage, total, onNavigate }: Props) {
  const lead = nav.seasonal.items[0];
  return (
    <div id={id} className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 pb-12 sm:px-8 lg:grid-cols-12">
      <nav aria-label="Цэцгийн төрөл" className="lg:col-span-3">
        <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Цэцэг</h2>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
          {nav.categories.map((c) => (
            <li key={c.id}>
              <Link href={c.href} onClick={onNavigate} className="group flex items-baseline gap-2 text-[0.95rem] text-ivory/80 transition-colors hover:text-ivory">
                <span className="link-line">{c.label}</span>
                {c.count > 1 && <span className="text-[0.7rem] text-ivory/30 tabular-nums">{c.count}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Тохиолдол" className="lg:col-span-2">
        <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Тохиолдол</h2>
        <ul className="mt-5 space-y-2.5">
          {nav.occasions.slice(0, 7).map((o) => (
            <li key={o.id}>
              <Link href={o.href} onClick={onNavigate} className="link-line text-[0.95rem] text-ivory/80 transition-colors hover:text-ivory">
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Өнгө" className="lg:col-span-2">
        <h2 className="text-[0.7rem] tracking-[0.16em] text-ivory/40 uppercase">Өнгө</h2>
        <ul className="mt-5 space-y-2.5">
          {nav.colors.map((c) => (
            <li key={c.id}>
              <Link href={c.href} onClick={onNavigate} className="group flex items-center gap-3 text-[0.95rem] text-ivory/80 transition-colors hover:text-ivory">
                <span aria-hidden className="size-3 rounded-full ring-1 ring-ivory/15 transition-transform duration-500 group-hover:scale-125" style={{ background: c.hex }} />
                <span className="link-line">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid grid-cols-2 gap-6 lg:col-span-5">
        {lead && (
          <MenuTile
            href={`/flowers/${lead.slug}`}
            image={lead.cover}
            kicker={nav.seasonal.title}
            title={lead.nameMn}
            meta={`${formatPrice(lead.startingPrice)}-аас`}
            onNavigate={onNavigate}
          />
        )}
        <MenuTile
          href="/bouquet-builder"
          image={atelierImage}
          kicker="Ателье"
          title="Өөрийн баглаа"
          meta="Иш бүрийг өөрөө сонго"
          onNavigate={onNavigate}
        />
      </div>

      <div className="flex items-center justify-between border-t border-ivory/10 pt-6 lg:col-span-12">
        <p className="text-sm text-ivory/45">Улаанбаатарт өдөрт нь, таны сонгосон цагт хүргэнэ.</p>
        <Link href="/catalog" onClick={onNavigate} className="link-line text-sm text-ivory">
          Бүх цэцэг · {total} <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function MenuTile({
  href,
  image,
  kicker,
  title,
  meta,
  onNavigate,
}: {
  href: string;
  image: CoverImage | null;
  kicker: string;
  title: string;
  meta: string;
  onNavigate: () => void;
}) {
  return (
    <Link href={href} onClick={onNavigate} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: image?.color }}>
        {image && (
          <FlowerPhoto
            src={image.src}
            alt=""
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-[1.4s] ease-bloom group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="mt-3 text-[0.7rem] tracking-[0.16em] text-gold-soft uppercase">{kicker}</p>
      <p className="mt-1 font-display text-2xl font-light">{title}</p>
      <p className="mt-0.5 text-xs text-ivory/45">{meta}</p>
    </Link>
  );
}
