import { BouquetCta, type AtelierImage } from "@/components/home/BouquetCta";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { Finale } from "@/components/home/Finale";
import { LanguageSection, type BotanicalPlate } from "@/components/home/LanguageSection";
import type { Flower, FlowerSlug } from "@/data/flowers";
import { toCatalogItem } from "@/lib/catalog";
import { getCoverImage, getDepthMap, getFlowers, getJourney, type CoverImage } from "@/lib/data";
import { HomeHero } from "./HomeHero";

/**
 * Нүүрний зургийн сонголт (цэцэг + зургийн индекс). Бүгд бараан дэвсгэртэй макро зураг —
 * нэг уур амьсгалтай боловч цэцэг бүр өөрийн өнгөөр.
 */
const PLATES: { slug: FlowerSlug; image: number }[] = [
  { slug: "ranunculus", image: 0 },
  { slug: "calla", image: 2 },
  { slug: "iris", image: 1 },
  { slug: "sunflower", image: 1 },
];
const FEATURED: { slug: FlowerSlug; image: number }[] = [
  { slug: "rose", image: 2 },
  { slug: "peony", image: 0 },
  { slug: "orchid", image: 0 },
  { slug: "hydrangea", image: 1 },
  { slug: "lisianthus", image: 1 },
];
/** Ателье: гараар боосон бодит баглаа; төгсгөл: харанхуйгаас тодрох цээнэний баглаа */
const ATELIER = { slug: "spray-rose", image: 1 } as const;
const FINALE = { slug: "peony", image: 1 } as const;

// Нүүр: A–B 3D аялал (hero → дэлбээлэлт → бүтээгдэхүүн), C Цэцгийн хэл, D Цуглуулга,
// E Ателье, F Төгсгөлийн кадр. Hero-гийн дараах хэсгүүд fixed Canvas-ийг дэвсгэрээрээ халхална.
export default async function Home() {
  const [stops, flowers] = await Promise.all([getJourney(), getFlowers()]);
  const bySlug = new Map(flowers.map((f) => [f.slug, f]));
  const pick = <T,>(list: readonly { slug: FlowerSlug; image: number }[], map: (f: Flower, i: number) => T) =>
    list.flatMap(({ slug, image }) => {
      const flower = bySlug.get(slug);
      return flower ? [map(flower, image)] : [];
    });

  const plates = pick(PLATES, toPlate);
  const featured = pick(FEATURED, (f, i) => ({
    ...toCatalogItem(f, imageAt(f, i)),
    depth: getDepthMap(f.slug, i),
  }));
  const atelier = bySlug.get(ATELIER.slug);
  const finale = bySlug.get(FINALE.slug);

  return (
    <>
      <HomeHero stops={stops} />

      <div className="relative z-10 bg-plum-950">
        <LanguageSection plates={plates} />
        <FeaturedCollection items={featured} />
        <BouquetCta image={atelier ? withDepth(atelier, ATELIER.image) : null} flowerCount={flowers.length} />
        <Finale image={finale ? imageAt(finale, FINALE.image) : null} />
      </div>
    </>
  );
}

/** Сонгосон индексийн зураг, байхгүй бол нүүр зураг */
function imageAt(flower: Flower, index: number): CoverImage | null {
  return flower.images[index] ?? getCoverImage(flower);
}

function withDepth(flower: Flower, index: number): AtelierImage | null {
  const image = flower.images[index];
  return image ? { ...image, depth: getDepthMap(flower.slug, index) } : null;
}

function toPlate(flower: Flower, index: number): BotanicalPlate {
  return {
    slug: flower.slug,
    nameMn: flower.nameMn,
    nameEn: flower.nameEn,
    latinName: flower.latinName,
    meaning: flower.meaning,
    origin: firstSentence(flower.origin),
    // «Улирлын цэцэг (5–7-р сар), бусад үед …. Улаанбаатар …» → «Улирлын цэцэг (5–7-р сар)»
    season: flower.pricing.deliveryNote.split(".")[0].split(",")[0],
    colors: flower.colors,
    image: imageAt(flower, index)!,
  };
}

function firstSentence(text: string) {
  const end = text.search(/\.(\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}
