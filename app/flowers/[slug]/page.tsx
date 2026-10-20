import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CareIcon } from "@/components/ui/CareIcon";
import { FlowerCarousel } from "@/components/ui/FlowerCarousel";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { getStockStatus, slugify, toCatalogItem } from "@/lib/catalog";
import {
  getCoverImage,
  getDeliverySlots,
  getFlower,
  getFlowers,
  getFlowerSpec,
  getNearbyFlowers,
  getPairingFlowers,
  type CoverImage,
} from "@/lib/data";
import { capitalize } from "@/lib/utils";
import type { Flower } from "@/data/flowers";
import { FlowerPreview } from "./FlowerPreview";
import { Gallery } from "./Gallery";
import { PurchasePanel } from "./PurchasePanel";

export async function generateStaticParams() {
  return (await getFlowers()).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(props: PageProps<"/flowers/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const flower = await getFlower(slug);
  if (!flower) return { title: "Олдсонгүй" };
  const title = `${flower.nameMn} · ${flower.nameEn}`;
  // Unsplash hotlink нь бүтэн URL — placeholder (/images/…) metadataBase-гүй тул орхино
  const images = flower.images.slice(0, 1).map((img) => ({ url: img.src, width: img.width, height: img.height, alt: img.alt }));
  return {
    title,
    description: flower.meaning,
    openGraph: { title, description: flower.meaning, type: "website", images },
  };
}

export default async function FlowerPage(props: PageProps<"/flowers/[slug]">) {
  const { slug } = await props.params;
  const flower = await getFlower(slug);
  if (!flower) notFound();

  const cover = getCoverImage(flower);
  const gallery: CoverImage[] = flower.images.length > 0 ? flower.images : cover ? [cover] : [];
  const spec = getFlowerSpec(flower);
  const [nearby, pairing, slots] = await Promise.all([
    getNearbyFlowers(flower).then((fs) => fs.map((f) => toCatalogItem(f, getCoverImage(f)))),
    getPairingFlowers(flower).then((fs) => fs.map((f) => toCatalogItem(f, getCoverImage(f)))),
    getDeliverySlots(),
  ]);

  return (
    <article className="mx-auto max-w-7xl px-4 pt-[calc(var(--header-height)+2.5rem)] pb-32 sm:px-8">
      <ProductJsonLd flower={flower} images={gallery} />

      <nav aria-label="Байршил" className="mb-10 text-xs tracking-[0.2em] text-ivory/45 uppercase">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/catalog" className="transition-colors hover:text-blush-100">
              Дэлгүүр
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/catalog?type=${slugify(flower.category)}`} className="transition-colors hover:text-blush-100">
              {capitalize(flower.category)}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ivory/70">
            {flower.nameMn}
          </li>
        </ol>
      </nav>

      <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="min-w-0 space-y-10">
          <Gallery images={gallery} swatch={flower.colors[0].hex} />
          {spec && <FlowerPreview spec={spec} name={flower.nameMn} />}
        </div>

        {/* min-w-0: хүргэлтийн өдрүүдийн хэвтээ scroll баганыг өргөсгөхгүй */}
        <div className="min-w-0">
          <p className="mb-5 text-xs tracking-[0.16em] text-gold-soft uppercase">{capitalize(flower.category)}</p>
          <h1 className="font-display text-6xl leading-[0.95] font-extralight sm:text-7xl">{flower.nameMn}</h1>
          <p className="mt-4 font-display text-xl text-ivory/55 italic">
            {flower.nameEn} <span className="text-ivory/30">·</span> {flower.latinName}
          </p>

          <dl className="mt-10 space-y-6 border-t border-ivory/10 pt-8 text-sm">
            <Fact term="Өнгө">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {flower.colors.map((c) => (
                  <li key={c.hex} className="flex items-center gap-2 text-ivory/70">
                    <span
                      aria-hidden
                      className="size-4 rounded-full ring-1 ring-ivory/20"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </li>
                ))}
              </ul>
            </Fact>
            <Fact term="Гарал үүсэл">
              <p className="leading-relaxed text-ivory/70">{flower.origin}</p>
            </Fact>
          </dl>

          <div className="mt-12 border-t border-ivory/10 pt-10">
            <PurchasePanel flower={flower} slots={slots} />
          </div>

          <Link
            href={`/bouquet-builder?flower=${flower.slug}`}
            className="group mt-10 flex items-center justify-between gap-6 border border-ivory/10 bg-plum-800/20 px-6 py-5 transition-colors duration-500 hover:border-gold-soft/40"
          >
            <span>
              <span className="block text-xs tracking-[0.16em] text-gold-soft uppercase">Өөрийн баглаа бүрдүүлэх</span>
              <span className="mt-1.5 block text-sm text-ivory/60">
                {flower.nameMn} болон бусад цэцгээр өвөрмөц баглаа бүтээгээрэй
              </span>
            </span>
            <span
              aria-hidden
              className="text-gold-soft transition-transform duration-500 ease-bloom group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>

      <section className="mt-32 grid gap-16 border-t border-ivory/10 pt-16 md:grid-cols-2 md:gap-20">
        <div>
          <h2 className="mb-6 text-xs tracking-[0.16em] text-gold-soft uppercase">Утга бэлгэдэл</h2>
          <p className="font-display text-3xl leading-snug font-extralight text-ivory/90 sm:text-4xl">{flower.meaning}</p>
        </div>
        <div>
          <h2 className="mb-6 text-xs tracking-[0.16em] text-gold-soft uppercase">Хэзээ бэлэглэх вэ</h2>
          <ul className="flex flex-wrap gap-2.5">
            {flower.occasions.map((o) => (
              <li key={o}>
                <Link
                  href={`/catalog?occasion=${slugify(o)}`}
                  className="inline-block rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory/80 transition-colors duration-300 hover:border-ivory/50 hover:text-ivory"
                >
                  {capitalize(o)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ivory/45">Тохиолдлыг сонгож, түүнд зохих бусад цэцгийг үзээрэй.</p>
        </div>
      </section>

      <Care flower={flower} />

      <FlowerCarousel eyebrow="Ойролцоо цэцэг" title="Танд таалагдаж магадгүй" items={nearby} />
      <FlowerCarousel eyebrow="Хамт тохирох" title="Баглаанд хослуулах" items={pairing} />

      <PhotoCredits images={gallery} />
    </article>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
      <dt className="text-xs tracking-[0.2em] text-ivory/45 uppercase sm:pt-0.5">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Care({ flower }: { flower: Flower }) {
  const { waterChangeDays, vaseLifeDays, tips } = flower.care;
  const [min, max] = vaseLifeDays;
  return (
    <section className="mt-28 border-t border-ivory/10 pt-16">
      <h2 className="mb-10 text-xs tracking-[0.16em] text-gold-soft uppercase">Арчилгаа</h2>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <dl className="grid grid-cols-2 gap-4">
          <Stat icon="water" term="Ус солих" value={waterChangeDays === 1 ? "Өдөр бүр" : `${waterChangeDays} хоног тутам`} />
          <Stat icon="vase" term="Ваазанд хадгалагдах" value={`${min}–${max} хоног`} />
        </dl>
        <ul className="space-y-5">
          {tips.map((tip) => (
            <li key={tip.text} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-soft/30 text-gold-soft">
                <CareIcon name={tip.icon} className="size-[1.15rem]" />
              </span>
              <p className="pt-2 text-ivory/70">{tip.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ icon, term, value }: { icon: "water" | "vase"; term: string; value: string }) {
  return (
    <div className="border border-ivory/10 bg-plum-800/20 p-6">
      <CareIcon name={icon} className="size-6 text-gold-soft" />
      <dt className="mt-6 text-xs tracking-[0.2em] text-ivory/50 uppercase">{term}</dt>
      <dd className="mt-2 font-display text-3xl leading-tight font-light">{value}</dd>
    </div>
  );
}

/** Unsplash attribution — gallery-ийн зураг бүрийн гэрэл зурагчин */
function PhotoCredits({ images }: { images: CoverImage[] }) {
  const credited = images.filter((img) => img.photographer && img.unsplashUrl);
  if (credited.length === 0) return null;
  return (
    <footer className="mt-28 border-t border-ivory/10 pt-8">
      <h2 className="mb-4 text-[0.65rem] tracking-[0.16em] text-ivory/40 uppercase">Зургийн эх сурвалж</h2>
      <ul className="flex flex-wrap gap-x-8 gap-y-2">
        {credited.map((img) => (
          <li key={img.src}>
            <PhotoCredit image={img} />
          </li>
        ))}
      </ul>
    </footer>
  );
}

/** Хайлтын системд бүтээгдэхүүний мэдээлэл (schema.org Product) */
function ProductJsonLd({ flower, images }: { flower: Flower; images: CoverImage[] }) {
  const prices = flower.pricing.sizes.map((s) => s.price);
  const out = getStockStatus(flower.pricing.stock, Math.min(...flower.pricing.sizes.map((s) => s.stems))) === "out";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${flower.nameMn} · ${flower.nameEn}`,
    description: flower.meaning,
    image: images.filter((img) => img.src.startsWith("http")).map((img) => img.src),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MNT",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };
  return (
    <script
      type="application/ld+json"
      // «<» escape — JSON дотор </script> гарч ирэхээс сэргийлнэ
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
