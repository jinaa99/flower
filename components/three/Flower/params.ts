"use client";

/**
 * Бүх цэцэгт нийтлэг тохируулга — /lab хуудас эдгээрийг удирдана. Хэлбэр ба гэрэл нь
 * FlowerSpec-ийн утгын үржвэр (1 = spec хэвээр), материал ба postprocessing абсолют утга.
 */
export type FlowerParams = {
  /** 0 = хаалттай нахиа, 1 = бүрэн дэлбээлсэн (lab; нүүрэнд scroll удирдана) */
  bloom: number;
  // Дэлбээний хэлбэр — spec × үржвэр
  length: number;
  width: number;
  cupAmount: number;
  curlAmount: number;
  ruffle: number;
  // Материал
  sheen: number;
  translucency: number;
  veins: number;
  // Гэрэл — spec.world × үржвэр
  keyIntensity: number;
  rimIntensity: number;
  envIntensity: number;
  // Postprocessing
  glow: number;
  glowThreshold: number;
  vignette: number;
  grain: number;
  autoRotate: boolean;
};

export const defaultFlowerParams: FlowerParams = {
  bloom: 0.85,
  length: 1,
  width: 1,
  cupAmount: 1,
  curlAmount: 1,
  ruffle: 1,
  sheen: 0.35,
  translucency: 0.55,
  veins: 0.55,
  keyIntensity: 1,
  rimIntensity: 1,
  envIntensity: 1,
  glow: 0.35,
  glowThreshold: 0.8,
  vignette: 0.55,
  grain: 0.16,
  autoRotate: false,
};

type NumericKey = { [K in keyof FlowerParams]: FlowerParams[K] extends number ? K : never }[keyof FlowerParams];

export type ParamControl = { key: NumericKey; label: string; min: number; max: number; step: number };

export const paramGroups: { title: string; controls: ParamControl[] }[] = [
  {
    title: "Цэцэглэлт",
    controls: [
      { key: "bloom", label: "Bloom", min: 0, max: 1, step: 0.001 },
    ],
  },
  {
    title: "Дэлбээ",
    controls: [
      { key: "length", label: "Урт ×", min: 0.6, max: 1.4, step: 0.01 },
      { key: "width", label: "Өргөн ×", min: 0.4, max: 1.5, step: 0.01 },
      { key: "cupAmount", label: "Хотгор (cup) ×", min: 0, max: 2, step: 0.01 },
      { key: "curlAmount", label: "Эргэлт (curl) ×", min: 0, max: 2.5, step: 0.01 },
      { key: "ruffle", label: "Долгион (ruffle) ×", min: 0, max: 2.5, step: 0.01 },
    ],
  },
  {
    title: "Материал",
    controls: [
      // sheen 0 болоход shader дахин compile хийгддэг тул доод хязгаар > 0
      { key: "sheen", label: "Sheen", min: 0.05, max: 1, step: 0.01 },
      { key: "translucency", label: "Гэрэл нэвтрэлт", min: 0, max: 2, step: 0.01 },
      { key: "veins", label: "Судал", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: "Гэрэл",
    controls: [
      { key: "keyIntensity", label: "Key light ×", min: 0, max: 3, step: 0.01 },
      { key: "rimIntensity", label: "Rim / back light ×", min: 0, max: 3, step: 0.01 },
      { key: "envIntensity", label: "Environment ×", min: 0, max: 4, step: 0.01 },
    ],
  },
  {
    title: "Postprocessing",
    controls: [
      { key: "glow", label: "Bloom (гэрэлтэлт)", min: 0, max: 2, step: 0.01 },
      { key: "glowThreshold", label: "Bloom threshold", min: 0, max: 1, step: 0.01 },
      { key: "vignette", label: "Vignette", min: 0, max: 1, step: 0.01 },
      { key: "grain", label: "Film grain", min: 0, max: 0.5, step: 0.01 },
    ],
  },
];
