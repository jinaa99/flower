/**
 * Scroll-ийн хурд (px/frame) — SmoothScroll (Lenis) бичиж, 3D тал useFrame-ээс
 * React state-гүйгээр уншина. `simulated` нь /lab-д scroll-гүйгээр туршихад.
 * `hero` нь нүүрний hero хэсгийн ScrollTrigger progress (0–1) — 3D тал үүнийг
 * шууд биш, damping-тэйгээр дагана.
 */
export const scrollMotion = { velocity: 0, simulated: 0, hero: 0 };

/** Lenis асаалттай бол түүгээр, үгүй бол native-аар зөөлөн гүйлгэнэ (SmoothScroll бүртгэнэ) */
export const smoothScroll: { to: (y: number) => void } = {
  to: (y) => window.scrollTo({ top: y, behavior: "smooth" }),
};

export const getScrollVelocity = () => scrollMotion.velocity + scrollMotion.simulated;

/**
 * Нүүрний аялал: цэцэг бүр нэг «шат» (stage). Шат доторх progress (0–1) дээрх үе шатууд —
 * HTML timeline (HomeHero) болон 3D камер/dissolve (ScrollRig) хоёулаа эндээс уншина.
 * Аяллын нийт progress P = stage + local; сүүлийн цэцэгт гарц (exit) байхгүй.
 */
export const STAGE = {
  /** Bloom 1 хүрнэ */
  bloomEnd: 0.3,
  /** Orbit дуусч, камер цэцгийн гол руу орж эхэлнэ */
  diveStart: 0.37,
  diveEnd: 0.6,
  /** Камер голд ойртох үед дэлбээ → бүтээгдэхүүний зураг руу уусна */
  dissolveStart: 0.55,
  dissolveEnd: 0.71,
  /** Зураг бүрэн гарсны дараа бүтээгдэхүүний карт */
  cardStart: 0.72,
  /** Зураг голоосоо нээгдэж дараагийн цэцгийн ертөнц рүү гарна, шинэ нахиа гарч ирнэ */
  exitStart: 0.88,
} as const;

/** n цэцгийн аяллын нийт урт (P-ийн дээд хязгаар) — сүүлийн шатанд exit байхгүй */
export const journeyLength = (n: number) => n - (1 - STAGE.exitStart);
