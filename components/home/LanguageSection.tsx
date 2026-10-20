import Link from "next/link";
import type { CSSProperties } from "react";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { FlowerColor } from "@/data/flowers";
import type { CoverImage } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Parallax, RevealGroup } from "./Motion";

export type BotanicalPlate = {
  slug: string;
  nameMn: string;
  nameEn: string;
  latinName: string;
  meaning: string;
  /** Гарал үүслийн эхний өгүүлбэр */
  origin: string;
  /** «Жилийн турш», «Шилдэг нь 7–9-р сард» гэх мэт */
  season: string;
  colors: FlowerColor[];
  image: CoverImage;
};

const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

/**
 * «Цэцгийн хэл» — ботаникийн цомог: цэцэг бүр нэг хуудас (plate). Зураг, текст ээлжлэн
 * баруун/зүүн, зургийн харьцаа нь өөрийнх нь (давтагдсан ижил хайрцаг биш). Цэцгийн
 * өнгө нь тухайн хуудасны жижиг accent-ийг тодорхойлно.
 */
export function LanguageSection({ plates }: { plates: BotanicalPlate[] }) {
  return (
    <RevealGroup id="language" label="Цэцгийн хэл" className="relative scroll-mt-(--header-height) bg-paper py-28 text-plum-950 sm:py-44 [&_*:focus-visible]:outline-rose-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="reveal grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-gold-deep! before:bg-gold-deep/50! lg:col-span-12">Цэцгийн хэл</p>
          <h2 className="font-display text-5xl leading-[1.02] font-extralight text-balance sm:text-7xl lg:col-span-7">
            Цэцэг бүр <em className="font-light text-rose-ink">өөрийн</em> үгтэй
          </h2>
          <p className="max-w-md self-end text-lg leading-relaxed text-plum-950/65 lg:col-span-4 lg:col-start-9">
            Эрт дээр үеэс хүмүүс хэлж чадаагүй үгээ цэцгээр илгээдэг байв. Утга, гарал, улирлыг нь мэдвэл баглаа бүр
            захидал болно.
          </p>
        </header>

        <div className="mt-24 space-y-28 sm:mt-32 sm:space-y-44">
          {plates.map((plate, i) => (
            <Plate key={plate.slug} plate={plate} index={i} />
          ))}
        </div>
      </div>
    </RevealGroup>
  );
}

function Plate({ plate, index }: { plate: BotanicalPlate; index: number }) {
  const flip = index % 2 === 1;
  const { image } = plate;
  // Зургийн жинхэнэ харьцаа (хэт өндөр/хэвтээг хязгаарлана) — хуудас бүр өөр хэмнэлтэй
  const ratio = Math.min(Math.max(image.width / image.height, 0.72), 1.3);
  const accent = plate.colors[0].hex;

  return (
    <article
      className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8"
      style={{ "--accent": accent } as CSSProperties}
      aria-labelledby={`plate-${plate.slug}`}
    >
      <figure
        className={cn(
          "reveal relative",
          flip ? "lg:order-2 lg:col-span-6 lg:col-start-7" : "lg:col-span-7",
          ratio < 1 && (flip ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5 lg:col-start-2"),
        )}
      >
        <Link href={`/flowers/${plate.slug}`} tabIndex={-1} aria-hidden className="group block">
          <Parallax className="w-full" style={{ aspectRatio: ratio, backgroundColor: image.color }} shift={5} zoom={[1.1, 1.1]}>
            <FlowerPhoto
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition-[filter] duration-1000 ease-bloom group-hover:brightness-110"
            />
          </Parallax>
        </Link>
        <figcaption className="mt-4 flex items-baseline justify-between gap-4">
          <span className="font-display text-sm text-plum-950/50 italic">{plate.latinName}</span>
          <PhotoCredit image={image} className="text-[0.65rem] text-plum-950/50! [&_a]:text-plum-950/75!" />
        </figcaption>
      </figure>

      <div
        className={cn(
          "reveal",
          flip ? "lg:order-1 lg:col-span-4 lg:col-start-2" : "lg:col-span-4 lg:col-start-9",
          ratio < 1 && !flip && "lg:col-start-8 lg:col-span-4",
        )}
      >
        <p className="flex items-center gap-4 font-display text-2xl font-light text-[color-mix(in_oklab,var(--accent)_55%,#2a1a1f)] italic">
          {NUMERALS[index]}
          <span aria-hidden className="h-px w-10 bg-[color-mix(in_oklab,var(--accent)_55%,#2a1a1f)] opacity-50" />
        </p>
        <h3 id={`plate-${plate.slug}`} className="mt-6 font-display text-5xl leading-none font-extralight sm:text-6xl">
          {plate.nameMn}
        </h3>
        <p className="mt-3 text-sm text-plum-950/50">{plate.nameEn}</p>

        <blockquote className="mt-9 font-display text-2xl leading-snug font-light text-plum-950/90 sm:text-[1.7rem]">
          {plate.meaning}
        </blockquote>

        <dl className="mt-10 space-y-4 border-t border-plum-950/15 pt-6 text-sm">
          <div className="grid grid-cols-[6.5rem_1fr] gap-4">
            <dt className="text-plum-950/45">Гарал</dt>
            <dd className="leading-relaxed text-plum-950/75">{plate.origin}</dd>
          </div>
          <div className="grid grid-cols-[6.5rem_1fr] gap-4">
            <dt className="text-plum-950/45">Улирал</dt>
            <dd className="text-plum-950/75">{plate.season}</dd>
          </div>
          <div className="grid grid-cols-[6.5rem_1fr] gap-4">
            <dt className="text-plum-950/45">Өнгө</dt>
            <dd>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-plum-950/75">
                {plate.colors.map((c) => (
                  <li key={c.hex} className="flex items-center gap-2">
                    <span aria-hidden className="size-2.5 rounded-full ring-1 ring-plum-950/20" style={{ background: c.hex }} />
                    {c.name}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <Link href={`/flowers/${plate.slug}`} className="link-line mt-10 inline-flex items-center gap-3 text-sm text-plum-950">
          {plate.nameMn} үзэх <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
