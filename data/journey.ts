/**
 * Нүүрний 3D аялал: каталогийн цэцгүүдээс 4-ийг энэ дарааллаар (3D FlowerSpec + гарчгууд).
 * Бүтээгдэхүүний мэдээлэл, зураг нь `flowers.ts`-ээс (lib/data.ts → getJourney).
 */
import type { FlowerSlug } from "./flowers.ts";
import { lilySpec, peonySpec, roseSpec, tulipSpec, type FlowerSpec } from "./flowerSpecs.ts";

/** Гарчиг: title = [өмнөх текст, онцолсон (italic blush), дараах текст] */
export type StoryBeat = { eyebrow: string; title: readonly [string, string, string]; body: string };

export type JourneyStop = {
  slug: FlowerSlug;
  /** Дэлбээлэлтийн үеийн гарчгууд */
  story: readonly StoryBeat[];
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
      { eyebrow: "Бүрэн дэлбээлсэн", title: ["Сэтгэлээ илэрхийлэх ", "эелдэг", " үг"], body: "Цааш гүйлгэж, цэцгийн зүрх рүү орно уу." },
    ],
    spec: peonySpec,
  },
  {
    slug: "rose",
    story: [
      { eyebrow: "Сарнай · Rose", title: ["Сарнай — ", "хайрын", " мөнхийн хэл"], body: "Дэлбээ бүр нэгнээ тэвэрч, ороомог хэлбэрээр нээгдэнэ." },
      { eyebrow: "Дэлбээлэлт", title: ["Гүн ", "улаан", " өнгийн нууц"], body: "Цааш гүйлгэж, сарнайн зүрх рүү орно уу." },
    ],
    spec: roseSpec,
  },
  {
    slug: "tulip",
    story: [
      { eyebrow: "Алтанзул · Tulip", title: ["Алтанзул — ", "хаврын", " анхны гэрэл"], body: "Зургаан дэлбээ аяга мэт нийлж, нарны илчийг хадгална." },
      { eyebrow: "Дэлбээлэлт", title: ["Энгийн, ", "төгс", " хэлбэр"], body: "Цааш гүйлгэж, аяганы гүн рүү орно уу." },
    ],
    spec: tulipSpec,
  },
  {
    slug: "lily",
    story: [
      { eyebrow: "Зэрлэг сараана · Martagon lily", title: ["Сараана — ", "тал нутгийн", " сүлд"], body: "Урт дэлбээнүүд нь гадагш эргэж, оддын гэрэл мэт цацарна." },
      { eyebrow: "Дэлбээлэлт", title: ["Зэрлэг ", "эрх чөлөө", ""], body: "Цааш гүйлгэж, сараанын зүрх рүү орно уу." },
    ],
    spec: lilySpec,
  },
];
