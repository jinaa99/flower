import { BouquetCta } from "@/components/home/BouquetCta";
import { CollectionRail } from "@/components/home/CollectionRail";
import { DeliverySection } from "@/components/home/DeliverySection";
import { LanguageSection } from "@/components/home/LanguageSection";
import { Spotlight, type SpotlightData, type SpotlightImage } from "@/components/home/Spotlight";
import type { Flower } from "@/data/flowers";
import { toCatalogItem } from "@/lib/catalog";
import { getCoverImage, getDepthMap, getFlowers, getJourney } from "@/lib/data";
import { capitalize } from "@/lib/utils";
import { HomeHero } from "./HomeHero";

/** Онцлох цэцэг, баглааны урилгын зураг (depth map-тай) */
const SPOTLIGHT = "rose";
const BOUQUET_IMAGE = { slug: "peony", index: 2 } as const;

// Нүүр хуудас — scroll-driven 3D аялал (ард нь fixed Canvas), дараа нь HTML хэсгүүд.
export default async function Home() {
  const [stops, flowers] = await Promise.all([getJourney(), getFlowers()]);
  const collection = [...flowers]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10)
    .map((f) => toCatalogItem(f, getCoverImage(f)));
  const spotlight = flowers.find((f) => f.slug === SPOTLIGHT);
  const bouquet = flowers.find((f) => f.slug === BOUQUET_IMAGE.slug);

  return (
    <>
      <HomeHero stops={stops} />

      {/* Hero-гийн дараах хэсгүүд Canvas-ийг дэвсгэрээрээ халхална */}
      <div className="relative z-10 bg-plum-950">
        <LanguageSection />
        <CollectionRail items={collection} />
        {spotlight && <Spotlight data={toSpotlight(spotlight)} />}
        <BouquetCta image={bouquet ? withDepth(bouquet, BOUQUET_IMAGE.index) : null} />
        <DeliverySection />
      </div>
    </>
  );
}

function withDepth(flower: Flower, index: number): SpotlightImage | null {
  const image = flower.images[index];
  return image ? { ...image, depth: getDepthMap(flower.slug, index) } : null;
}

function toSpotlight(flower: Flower): SpotlightData {
  const [min, max] = flower.care.vaseLifeDays;
  const smallest = flower.pricing.sizes.reduce((a, b) => (b.price < a.price ? b : a));
  const cover = getCoverImage(flower);
  const images = flower.images.map((_, i) => withDepth(flower, i)!);
  return {
    slug: flower.slug,
    nameMn: flower.nameMn,
    nameEn: flower.nameEn,
    meaning: flower.meaning,
    facts: [
      { label: "Тохиолдол", value: flower.occasions.slice(0, 2).map(capitalize).join(", ") },
      { label: "Улирал", value: flower.pricing.deliveryNote.split(".")[0] },
      { label: "Ваазанд", value: `${min}–${max} хоног` },
    ],
    smallest,
    images: images.length ? images : cover ? [{ ...cover, depth: null }] : [],
  };
}
