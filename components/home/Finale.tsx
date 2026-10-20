import Link from "next/link";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import type { CoverImage } from "@/lib/data";
import { FREE_DELIVERY_FROM } from "@/lib/delivery";
import { formatPrice } from "@/lib/utils";
import { Parallax, RevealGroup } from "./Motion";

/**
 * Төгсгөлийн кадр: брэндийн киноны сүүлчийн дүр мэт — харанхуйгаас тодрох баглаа, scroll-оор
 * удаан «тогтох» томруулалт, нэг өгүүлбэр, нэг CTA. Доор нь хүргэлтийн амлалт (#delivery) —
 * киноны титр шиг намуухан мөр.
 */
export function Finale({ image }: { image: CoverImage | null }) {
  const promises = [
    { title: "Өдөрт нь", body: "Улаанбаатарт захиалснаас хойш 3 цагийн дотор, таны сонгосон цагт." },
    { title: "Гараар боосон", body: "Гар урлалын цаас, торгон тууз, гараар бичсэн карт." },
    { title: "Үнэгүй хүргэлт", body: `${formatPrice(FREE_DELIVERY_FROM)}-өөс дээш захиалгад.` },
  ];

  return (
    <RevealGroup label="Төгсгөл" className="relative">
      <div className="relative isolate flex min-h-[110svh] items-end overflow-hidden">
        {image && (
          <Parallax className="absolute! inset-0 -z-10" shift={0} zoom={[1.16, 1]} style={{ backgroundColor: image.color }}>
            <FlowerPhoto src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover object-[60%_45%]" />
          </Parallax>
        )}
        {/* Доороос харанхуй — текст уншигдана, кадр хар дэвсгэрт уусна */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-plum-950 via-plum-950/45 to-plum-950/30" />
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-48 bg-linear-to-b from-plum-950 to-transparent" />

        <div className="reveal mx-auto w-full max-w-7xl px-4 pb-24 sm:px-8 sm:pb-32">
          <h2 className="max-w-4xl font-display text-[3.2rem] leading-[0.98] font-extralight tracking-[-0.01em] text-balance sm:text-8xl lg:text-[7.5rem]">
            Мөч бүрийг <em className="font-light text-blush-100">цэцэглүүл</em>
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-6">
            <Link href="/catalog" className="btn-primary">
              Цэцэг сонгох <span aria-hidden>→</span>
            </Link>
            <Link href="/bouquet-builder" className="link-line text-sm text-ivory/80 hover:text-ivory">
              эсвэл өөрөө бүтээх
            </Link>
          </div>
          {image && <PhotoCredit image={image} className="mt-16 text-[0.62rem]" />}
        </div>
      </div>

      <div id="delivery" className="scroll-mt-(--header-height) border-t border-ivory/[0.06]">
        <ul className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-8 md:grid-cols-3 md:gap-8">
          {promises.map((p) => (
            <li key={p.title} className="reveal">
              <h3 className="font-display text-2xl font-light">{p.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ivory/55">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </RevealGroup>
  );
}
