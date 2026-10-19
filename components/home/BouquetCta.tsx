import Link from "next/link";
import { DepthPhoto } from "@/components/ui/DepthPhoto";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { SpotlightImage } from "./Spotlight";

/** «Өөрийн баглаа»: том бөөрөнхий карт — зүүн талд урилга, баруун талд 2.5D зураг */
export function BouquetCta({ image }: { image: SpotlightImage | null }) {
  return (
    <section id="bouquet" className="px-4 py-16 sm:px-8 sm:py-24">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] border border-ivory/10 bg-linear-to-br from-plum-800/70 via-plum-950 to-plum-950 lg:grid-cols-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-blush-500/20 blur-3xl"
        />
        <div className="relative flex flex-col justify-center p-10 sm:p-16">
          <p className="eyebrow mb-7">Баглаа бүрдүүлэгч</p>
          <h2 className="font-display text-5xl leading-[0.98] font-light text-balance sm:text-6xl">
            Өөрийн <em className="text-blush-300">баглаа</em> бүтээ
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/60">
            Цэцэг, ногоон навч, боодол, туузаа сонгоод онцгой мөчдөө зориулсан өвөрмөц баглаа бүрдүүлээрэй.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/bouquet-builder" className="btn-primary">
              Бүтээж эхлэх <span aria-hidden>→</span>
            </Link>
            <span className="text-xs tracking-[0.2em] text-ivory/45 uppercase">5 – 40 иш · үнэ шууд тооцогдоно</span>
          </div>
        </div>
        {image && (
          <div className="relative min-h-80 lg:min-h-[34rem]">
            <div className="absolute inset-0">
              {image.depth ? (
                <DepthPhoto
                  src={image.src}
                  depth={image.depth}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  color={image.color}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  strength={0.03}
                  className="size-full"
                />
              ) : (
                <FlowerPhoto src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              )}
            </div>
            <div aria-hidden className="absolute inset-0 bg-linear-to-r from-plum-950/80 via-transparent to-transparent max-lg:bg-linear-to-t" />
            <PhotoCredit image={image} className="absolute right-6 bottom-5 text-[0.6rem]" />
          </div>
        )}
      </div>
    </section>
  );
}
