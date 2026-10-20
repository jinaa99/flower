import Link from "next/link";
import { DepthPhoto } from "@/components/ui/DepthPhoto";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { greenery, MAX_STEMS, MIN_STEMS, papers, ribbons } from "@/data/bouquet";
import type { CoverImage } from "@/lib/data";
import { RevealGroup } from "./Motion";

export type AtelierImage = CoverImage & { depth: string | null };

/**
 * «Ателье»: баглаа бүрдүүлэгч рүү урилга — цэцэгчний ширээ мэт: зүүн талд гараар боосон
 * бодит баглааны 2.5D зураг, баруун талд 4 алхам (бүрдүүлэгчийн бодит сонголтоос тоолсон).
 */
export function BouquetCta({ image, flowerCount }: { image: AtelierImage | null; flowerCount: number }) {
  const steps = [
    { title: "Цэцэг", body: `${flowerCount} төрлөөс ${MIN_STEMS}–${MAX_STEMS} иш, өнгийг нь өөрөө сонгоно.` },
    { title: "Ногоон навч", body: `${greenery.length} төрлийн навч — эвкалипт, оймын хөнгөн хүрээ.` },
    { title: "Боодол", body: `${papers.length} өнгийн гар урлалын цаас, ${ribbons.length} өнгийн тууз.` },
    { title: "Захидал", body: "Карт дээрх үгийг тань цэцэгчин гараар бичнэ." },
  ];

  return (
    <RevealGroup id="bouquet" label="Баглаа бүрдүүлэгч" className="relative overflow-hidden border-t border-ivory/[0.06] py-28 sm:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-12 lg:gap-8">
        {image && (
          <figure className="reveal lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: image.color }}>
              {image.depth ? (
                <DepthPhoto
                  src={image.src}
                  depth={image.depth}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  color={image.color}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  strength={0.03}
                  className="size-full"
                />
              ) : (
                <FlowerPhoto src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              )}
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-display text-sm text-ivory/45 italic">Цэцэгчний ширээнээс</span>
              <PhotoCredit image={image} className="text-[0.65rem]" />
            </figcaption>
          </figure>
        )}

        <div className="reveal lg:col-span-5 lg:col-start-8">
          <p className="eyebrow">Ателье</p>
          <h2 className="mt-8 font-display text-5xl leading-[1.02] font-extralight text-balance sm:text-6xl">
            Өөрийн <em className="font-light text-blush-100">баглааг</em> бүтээ
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/60">
            Цэцэгчинтэй ширээний ард суугаа мэт — иш бүрийг сонгож, үнэ нь шууд тооцогдоно.
          </p>

          <ol className="mt-12 border-t border-ivory/10">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-ivory/10 py-5">
                <span className="pt-1 font-display text-lg text-gold-soft/80 italic tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-light">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ivory/55">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href="/bouquet-builder" className="btn-primary mt-10">
            Бүтээж эхлэх <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </RevealGroup>
  );
}
