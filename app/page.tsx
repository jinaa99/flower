import Link from "next/link";
import { getJourney } from "@/lib/data";
import { HomeHero } from "./HomeHero";

// Нүүр хуудас — scroll-driven 3D туршлага: ард нь fixed Canvas, урд нь HTML хэсгүүд.
export default async function Home() {
  return (
    <>
      <HomeHero stops={await getJourney()} />

      {/* Hero-гийн дараах хэсгүүд Canvas-ийг дэвсгэрээрээ халхална */}
      <section className="relative z-10 flex min-h-dvh items-center bg-plum-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,var(--color-plum-800),transparent_65%)]"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
          <p className="mb-6 text-xs tracking-[0.3em] text-gold-soft uppercase">Botanical atelier</p>
          <h2 className="font-display text-6xl leading-[0.95] font-light sm:text-8xl lg:text-9xl">
            Цэцэг бүр
            <br />
            <em className="text-blush-300">түүхтэй</em>
          </h2>
          <p className="mt-8 max-w-md text-lg text-ivory/60">
            Гараар сонгосон тансаг цэцэг, таны мэдрэмжинд зориулсан баглаа.
          </p>
          <Link
            href="/catalog"
            className="mt-12 inline-block border border-gold-soft/50 px-8 py-4 text-sm tracking-[0.2em] text-gold-soft uppercase transition-colors duration-500 hover:bg-gold-soft hover:text-plum-950"
          >
            Каталог үзэх
          </Link>
        </div>
      </section>
    </>
  );
}
