/**
 * Нүүрний 3D аялал: каталогийн цэцгүүдээс 4-ийг энэ дарааллаар (3D FlowerSpec + гарчгууд).
 * Бүтээгдэхүүний мэдээлэл, зураг нь `flowers.ts`-ээс (lib/data.ts → getJourney).
 */
import type { FlowerSlug } from "./flowers.ts";
import { lilySpec, peonySpec, roseSpec, tulipSpec, type FlowerSpec } from "./flowerSpecs.ts";

/** Гарчиг: title = [өмнөх текст, онцолсон (italic blush), дараах текст] */
export type StoryBeat = { eyebrow: string; title: readonly [string, string, string]; body: string };

/**
 * Нүүрний гэрэл зургийн аялал: `flowerImages`-ийн индекс. hero — бүтэн кадрын 2.5D (depth) зураг,
 * detail — дээр нь давхарласан жижиг дэлгэрэнгүй зураг. tone — хэсгийн гэрэл (light бол бараан текст).
 */
export type JourneyPhoto = {
  hero: number;
  detail?: number;
  tone: "dark" | "light";
  /** hero зураг дээрх цэцгийн төв (0–1, y доошоо) — дэлбээлэлт, dive эндээс */
  focus: readonly [number, number];
};

export type JourneyStop = {
  slug: FlowerSlug;
  /** Хэсгийн гарчгууд (эхнийх нь hero) */
  story: readonly StoryBeat[];
  photo: JourneyPhoto;
  /** Дэлгэрэнгүй хуудасны 3D preview */
  spec: Omit<FlowerSpec, "image">;
};

export const journeyStops: JourneyStop[] = [
  {
    slug: "peony",
    story: [
      {
        eyebrow: "Цэцэг бүрд түүх бий",
        title: ["Цэцгээс ", "илүү", " мэдрэмж"],
        body: "Хайр, талархал, амьдралын онцгой мөчүүдэд зориулж гараар бүтээсэн тансаг баглаа.",
      },
      { eyebrow: "Цээнэ · Peony", title: ["Цээнэ — ", "эрхэмсэг", " баяр баясгалан"], body: "Давхар дэлбээ бүрд хаврын зөөлөн гэрэл нуугдана." },
      { eyebrow: "Бүрэн дэлбээлсэн", title: ["Сэтгэлээ илэрхийлэх ", "эелдэг", " үг"], body: "Өглөө бүр шинээр ирсэн цээнэг цэцэгчин гараар сонгоно." },
    ],
    photo: { hero: 1, detail: 2, tone: "dark", focus: [0.48, 0.48] },
    spec: peonySpec,
  },
  {
    slug: "rose",
    story: [
      { eyebrow: "Сарнай · Rose", title: ["Сарнай — ", "хайрын", " мөнхийн хэл"], body: "Дэлбээ бүр нэгнээ тэвэрч, ороомог хэлбэрээр нээгдэнэ." },
      { eyebrow: "Дэлбээлэлт", title: ["Гүн ", "улаан", " өнгийн нууц"], body: "Хилэн дэлбээ бүрд гүн улаан өнгө нуугдана." },
    ],
    photo: { hero: 1, detail: 0, tone: "dark", focus: [0.56, 0.28] },
    spec: roseSpec,
  },
  {
    slug: "tulip",
    story: [
      { eyebrow: "Алтанзул · Tulip", title: ["Алтанзул — ", "хаврын", " анхны гэрэл"], body: "Зургаан дэлбээ аяга мэт нийлж, нарны илчийг хадгална." },
      { eyebrow: "Дэлбээлэлт", title: ["Энгийн, ", "төгс", " хэлбэр"], body: "Хаврын анхны гэрэл шиг цэвэр, даруу." },
    ],
    photo: { hero: 0, detail: 2, tone: "light", focus: [0.5, 0.33] },
    spec: tulipSpec,
  },
  {
    slug: "lily",
    story: [
      { eyebrow: "Зэрлэг сараана · Martagon lily", title: ["Сараана — ", "тал нутгийн", " сүлд"], body: "Урт дэлбээнүүд нь гадагш эргэж, оддын гэрэл мэт цацарна." },
      { eyebrow: "Дэлбээлэлт", title: ["Зэрлэг ", "эрх чөлөө", ""], body: "Монголын тал нутагт зэрлэгээр ургадаг ховор цэцэг." },
    ],
    photo: { hero: 0, tone: "light", focus: [0.71, 0.42] },
    spec: lilySpec,
  },
];
