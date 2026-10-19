/**
 * Цэцэг бүрийн 3D тохиргоо (FlowerSpec) — зөвхөн энгийн өгөгдөл (hex өнгө, тоо), three.js-гүй.
 * `components/three/Flower/` дахь Flower, Stem, Stamens, World эдгээрийг уншиж бүтээнэ.
 *
 * `Range` = [хамгийн дотор давхарга, хамгийн гадна давхарга] — давхаргын байрлал t (0 → 1)-ээр lerp.
 * Bud = нахиа (bloom 0), open = бүрэн дэлбээлсэн (bloom 1).
 */

export type Range = readonly [number, number];
type Hex = string;

/** Ёроол → дунд → үзүүрийн gradient, судал, ар талын гэрлийн нэвтрэлт, sheen */
export type PetalColors = { base: Hex; mid: Hex; tip: Hex; veinTint: Hex; trans: Hex; sheen: Hex };

/** Outline: x — хамгийн өргөн цэгийн exponent (их = үзүүр рүү), y — үзүүрийн хурц (бага = мохоо), z — ёроолын өргөн */
export type Outline = readonly [number, number, number];

export type LeafSpec = {
  /** Ишний дагуух байрлал: 0 = толгой, 1 = ёроол */
  at: number;
  azimuth: number;
  tilt: number;
  length: number;
  width: number;
  curl: number;
  seed: number;
};

export type WorldSpec = {
  /** Screen-space radial gradient */
  background: { inner: Hex; outer: Hex };
  /** Ертөнц хооронд шилжихэд шинэ цэцэг энэ өнгөний мананцараас гарч ирнэ */
  fog: Hex;
  hemisphere: { sky: Hex; ground: Hex; intensity: number };
  /** Урд дээд зүүнээс */
  key: { color: Hex; intensity: number };
  /** Ар талаас — дэлбээгээр нэвтэрч ирмэгийг гэрэлтүүлнэ; хоёр дахь rim нь intensity × 0.35 */
  rim: { color: Hex; intensity: number; secondary: Hex };
  /** Доороос */
  fill: { color: Hex; intensity: number };
  envIntensity: number;
};

export type FlowerSpec = {
  slug: string;
  /** Dive-ийн төгсгөлд дэлбээ уусах бүтээгдэхүүний зураг (/public/images) */
  image: string;
  /** Толгой камер руу хазайх өнцөг (rad) — dive энэ тэнхлэгийн дагуу явна */
  headTilt: number;
  petals: {
    /** Давхарга бүрийн дэлбээний тоо, дотроос гадагш */
    counts: readonly number[];
    /** spiral: golden angle-аар үргэлжилсэн (цээнэ, сарнай); whorled: давхарга бүр жигд, ээлжлэн шилжсэн (алтанзул, сараана) */
    arrangement: "spiral" | "whorled";
    /** Azimuth-ийн санамсаргүй хазайлт (rad) */
    jitter: number;
    length: number;
    width: number;
    outline: Outline;
    colors: PetalColors;
    /** Гадна давхарга bloom=0-д, хамгийн дотор нь bloom=stagger-т нээгдэж эхэлнэ */
    stagger: number;
    size: Range;
    /** size-ийг t^sizeCurve-ээр lerp */
    sizeCurve: number;
    /** Нахиан дээрх хэмжээний харьцаа */
    budSize: number;
    widthScale: Range;
    /** Төв тэнхлэгээс зай */
    radius: Range;
    /** Гадна давхарга хэр доор суух */
    drop: number;
    tiltBud: Range;
    tiltOpen: Range;
    tiltCurve: number;
    cupBud: number;
    cupOpen: Range;
    /** Сөрөг = үзүүр дотогш (нахиа), эерэг = гадагш эргэнэ */
    curlBud: number;
    curlOpen: Range;
    ruffle: Range;
    ruffleBud: number;
    /** Ёроолын хуурамч ambient occlusion */
    ao: Range;
  };
  sepals: { count: number; length: number; width: number; tiltOpen: number; colors: PetalColors; outline: Outline } | null;
  center: {
    receptacle: { color: Hex; size: number };
    stamens: {
      count: number;
      radius: Range;
      height: Range;
      lean: Range;
      filament: Hex;
      anther: Hex;
      /** [radius, half-length] */
      antherSize: Range;
    };
    pistil: { count: number; spread: number; size: Range; color: Hex };
  };
  stem: { length: number; radius: number; top: Hex; bottom: Hex };
  leaves: { colors: PetalColors; outline: Outline; items: readonly LeafSpec[] };
  camera: {
    /** Orbit-ийн зайн үржвэр (толгойн хэмжээнд тааруулна) */
    distance: number;
    /** Dive-ийн төгсгөлд толгойн төвөөс камер хүртэлх зай */
    dive: number;
  };
  world: WorldSpec;
};

/* ───────────────────────── Нийтлэг ───────────────────────── */

const sepalGreen: PetalColors = {
  base: "#3E5A33",
  mid: "#56733F",
  tip: "#7A6A44",
  veinTint: "#6E8A55",
  trans: "#B5CF7A",
  sheen: "#C9D9A8",
};

/* ───────────────────────── Цээнэ · Peony ───────────────────────── */

export const peonySpec: Omit<FlowerSpec, "image"> = {
  slug: "peony",
  headTilt: 0.5,
  petals: {
    // Дотроос гадагш 5 → 7 дэлбээ, хамгийн гадна 6 том «guard» дэлбээ
    counts: [5, 6, 7, 7, 6],
    arrangement: "spiral",
    jitter: 0.12,
    length: 1,
    width: 0.92,
    outline: [1.6, 0.5, 0.14],
    // ёроолд гүн blush → blush-300 → ivory үзүүр
    colors: { base: "#B86E86", mid: "#E3A6B2", tip: "#F8F3EC", veinTint: "#E3A9B8", trans: "#FFD2D6", sheen: "#F3D3D8" },
    stagger: 0.45,
    size: [0.46, 1],
    sizeCurve: 0.8,
    budSize: 0.72,
    widthScale: [0.8, 1.05],
    radius: [0.02, 0.1],
    drop: 0.05,
    tiltBud: [0.12, 0.3],
    tiltOpen: [0.28, 1.35],
    tiltCurve: 1.3,
    cupBud: 0.75,
    cupOpen: [0.935, 0.55],
    curlBud: -0.8,
    curlOpen: [-0.315, 0.45],
    ruffle: [0.84, 0.48],
    ruffleBud: 0.35,
    ao: [0.8, 0.2],
  },
  sepals: { count: 5, length: 0.5, width: 0.34, tiltOpen: 1.75, colors: sepalGreen, outline: [1.0, 0.8, 0.2] },
  center: {
    receptacle: { color: "#557243", size: 0.13 },
    stamens: {
      count: 90,
      radius: [0.045, 0.15],
      height: [0.15, 0.09],
      lean: [0.25, 0.85],
      filament: "#EFD9A8",
      anther: "#D9AE4E",
      antherSize: [0.011, 0.022],
    },
    pistil: { count: 5, spread: 0.018, size: [0.017, 0.045], color: "#B97A86" },
  },
  // Peony-ийн иш дээд хэсэгтээ улаавтар
  stem: { length: 3.4, radius: 0.05, top: "#6E4A3F", bottom: "#4A6B3A" },
  leaves: {
    colors: { base: "#2E4728", mid: "#3E5E33", tip: "#4D6C3B", veinTint: "#7E9C62", trans: "#A8C772", sheen: "#C9D9A8" },
    outline: [0.76, 1.0, 0.04],
    items: [
      { at: 0.36, azimuth: 1.15, tilt: 0.95, length: 1.15, width: 0.42, curl: 0.55, seed: 0.21 },
      { at: 0.6, azimuth: -1.7, tilt: 1.05, length: 1.0, width: 0.38, curl: 0.7, seed: 0.67 },
    ],
  },
  camera: { distance: 1, dive: 0.85 },
  world: {
    background: { inner: "#3A1C30", outer: "#1E0F1A" },
    fog: "#2A1424",
    hemisphere: { sky: "#F6DDE0", ground: "#3A1C30", intensity: 0.15 },
    key: { color: "#FFF1E6", intensity: 1.5 },
    rim: { color: "#F9CFD6", intensity: 2.6, secondary: "#E8B4BC" },
    fill: { color: "#8A5A78", intensity: 0.3 },
    envIntensity: 0.35,
  },
};

/* ───────────────────────── Сарнай · Rose ───────────────────────── */

export const roseSpec: Omit<FlowerSpec, "image"> = {
  slug: "rose",
  headTilt: 0.45,
  petals: {
    // Ороомог: дотор давхарга нарийн конус, гадна руу олширно
    counts: [3, 4, 5, 6, 7, 8],
    arrangement: "spiral",
    jitter: 0.08,
    length: 0.9,
    width: 0.95,
    outline: [1.35, 0.55, 0.16],
    colors: { base: "#5E0F1E", mid: "#9E1B32", tip: "#C8374D", veinTint: "#8A1A2E", trans: "#FF6E7A", sheen: "#F2A3AE" },
    stagger: 0.5,
    size: [0.42, 1],
    sizeCurve: 0.9,
    budSize: 0.75,
    widthScale: [0.9, 1.1],
    radius: [0.01, 0.07],
    drop: 0.04,
    tiltBud: [0.03, 0.12],
    // Дотор давхарга бараг босоо (конус) хэвээр, гадна нь хэвтээ болно
    tiltOpen: [0.06, 1.25],
    tiltCurve: 1.8,
    cupBud: 0.95,
    cupOpen: [1.15, 0.7],
    curlBud: -0.7,
    // Гадна дэлбээний үзүүр гадагш эргэнэ (reflex)
    curlOpen: [-0.5, 0.9],
    ruffle: [0.12, 0.25],
    ruffleBud: 0.3,
    ao: [0.85, 0.25],
  },
  sepals: {
    count: 5,
    length: 0.42,
    width: 0.14,
    tiltOpen: 2.0,
    colors: { ...sepalGreen, tip: "#4E6A3A" },
    outline: [0.6, 1.4, 0.1],
  },
  center: {
    receptacle: { color: "#3E5A30", size: 0.1 },
    stamens: {
      count: 24,
      radius: [0.03, 0.06],
      height: [0.05, 0.04],
      lean: [0.2, 0.6],
      filament: "#E8C98A",
      anther: "#C99A3E",
      antherSize: [0.008, 0.014],
    },
    pistil: { count: 0, spread: 0, size: [0, 0], color: "#000000" },
  },
  stem: { length: 3.2, radius: 0.042, top: "#4A3A2A", bottom: "#3A5530" },
  leaves: {
    colors: { base: "#22381F", mid: "#2F4C29", tip: "#3D5E32", veinTint: "#5E7E4A", trans: "#8DB063", sheen: "#B8CC98" },
    outline: [0.9, 0.75, 0.05],
    items: [
      { at: 0.25, azimuth: 1.0, tilt: 1.0, length: 0.55, width: 0.3, curl: 0.25, seed: 0.13 },
      { at: 0.4, azimuth: -1.9, tilt: 1.1, length: 0.6, width: 0.32, curl: 0.3, seed: 0.41 },
      { at: 0.55, azimuth: 2.6, tilt: 1.0, length: 0.55, width: 0.3, curl: 0.35, seed: 0.77 },
      { at: 0.7, azimuth: -0.4, tilt: 1.15, length: 0.5, width: 0.28, curl: 0.3, seed: 0.59 },
    ],
  },
  camera: { distance: 0.95, dive: 1.05 },
  world: {
    background: { inner: "#3D1018", outer: "#170609" },
    fog: "#2A0B12",
    hemisphere: { sky: "#F3C9C2", ground: "#3D1018", intensity: 0.15 },
    key: { color: "#FFE6D6", intensity: 1.4 },
    rim: { color: "#FF9D8A", intensity: 2.4, secondary: "#C9A87C" },
    fill: { color: "#7A3040", intensity: 0.3 },
    envIntensity: 0.3,
  },
};

/* ───────────────────────── Алтанзул · Tulip ───────────────────────── */

export const tulipSpec: Omit<FlowerSpec, "image"> = {
  slug: "tulip",
  headTilt: 0.35,
  petals: {
    // 3 + 3 дэлбээ ээлжлэн, нээгдсэн ч аяга хэлбэрээ хадгална
    counts: [3, 3],
    arrangement: "whorled",
    jitter: 0.04,
    length: 0.82,
    width: 0.72,
    outline: [1.05, 0.7, 0.32],
    colors: { base: "#E0A24A", mid: "#F2A27E", tip: "#F7C9B0", veinTint: "#E8906A", trans: "#FFD0A0", sheen: "#FBE3D0" },
    stagger: 0.2,
    size: [0.95, 1],
    sizeCurve: 1,
    budSize: 0.85,
    widthScale: [0.95, 1.05],
    radius: [0.02, 0.04],
    drop: 0.02,
    tiltBud: [0.04, 0.07],
    tiltOpen: [0.62, 0.86],
    tiltCurve: 1,
    cupBud: 1.05,
    cupOpen: [0.6, 0.5],
    curlBud: -0.35,
    curlOpen: [0.1, 0.25],
    ruffle: [0.04, 0.06],
    ruffleBud: 0.5,
    ao: [0.5, 0.35],
  },
  sepals: null,
  center: {
    receptacle: { color: "#5E7A40", size: 0.07 },
    stamens: {
      count: 6,
      radius: [0.035, 0.04],
      height: [0.14, 0.14],
      lean: [0.2, 0.3],
      filament: "#E8D9A0",
      anther: "#3A2433",
      antherSize: [0.012, 0.034],
    },
    pistil: { count: 3, spread: 0.014, size: [0.018, 0.055], color: "#DCD39A" },
  },
  stem: { length: 2.7, radius: 0.045, top: "#7C9A5E", bottom: "#5A7A48" },
  leaves: {
    // Ёроолоос гарах өргөн, хөхөвтөр ногоон навч
    colors: { base: "#3E5A3E", mid: "#587A55", tip: "#6E8E66", veinTint: "#8AA67E", trans: "#B5CF96", sheen: "#CFE0C0" },
    outline: [0.85, 1.1, 0.2],
    items: [
      { at: 0.72, azimuth: 0.6, tilt: 0.38, length: 1.6, width: 0.55, curl: 0.5, seed: 0.3 },
      { at: 0.84, azimuth: -2.5, tilt: 0.45, length: 1.4, width: 0.5, curl: 0.6, seed: 0.7 },
    ],
  },
  camera: { distance: 0.85, dive: 0.55 },
  world: {
    background: { inner: "#3B2418", outer: "#1A0F0A" },
    fog: "#2A1A11",
    hemisphere: { sky: "#FBE3D0", ground: "#3B2418", intensity: 0.18 },
    key: { color: "#FFF0DC", intensity: 1.6 },
    rim: { color: "#FFC98F", intensity: 2.4, secondary: "#C9A87C" },
    fill: { color: "#7A5A40", intensity: 0.3 },
    envIntensity: 0.4,
  },
};

/* ───────────────────────── Зэрлэг сараана · Wild lily ───────────────────────── */

export const lilySpec: Omit<FlowerSpec, "image"> = {
  slug: "lily",
  headTilt: 0.65,
  petals: {
    // 3 + 3 урт нарийн дэлбээ, үзүүрээрээ гадагш хүчтэй эргэнэ (turk's cap)
    counts: [3, 3],
    arrangement: "whorled",
    jitter: 0.05,
    length: 1.2,
    width: 0.34,
    outline: [0.7, 1.25, 0.08],
    colors: { base: "#6E3E7E", mid: "#B88AC8", tip: "#E5D2F0", veinTint: "#7A3E80", trans: "#E6C2FF", sheen: "#EDE0F8" },
    stagger: 0.25,
    size: [0.95, 1],
    sizeCurve: 1,
    budSize: 0.8,
    widthScale: [0.95, 1.05],
    radius: [0.03, 0.05],
    drop: 0.02,
    tiltBud: [0.04, 0.06],
    tiltOpen: [1.05, 1.2],
    tiltCurve: 1,
    cupBud: 0.9,
    cupOpen: [0.45, 0.35],
    curlBud: -0.2,
    curlOpen: [1.0, 1.15],
    ruffle: [0.08, 0.12],
    ruffleBud: 0.3,
    ao: [0.45, 0.3],
  },
  sepals: null,
  center: {
    receptacle: { color: "#6E8A50", size: 0.06 },
    stamens: {
      count: 6,
      radius: [0.03, 0.03],
      height: [0.4, 0.4],
      lean: [0.5, 0.6],
      filament: "#D8E0B0",
      anther: "#8A3A1E",
      antherSize: [0.014, 0.05],
    },
    pistil: { count: 1, spread: 0, size: [0.012, 0.26], color: "#A8B87E" },
  },
  stem: { length: 3.6, radius: 0.04, top: "#5A7A40", bottom: "#4A6A38" },
  leaves: {
    // Ишийг тойрсон нарийн навчны цагираг
    colors: { base: "#2E4A2A", mid: "#3F6236", tip: "#4E7240", veinTint: "#739462", trans: "#A5C777", sheen: "#C2D6A4" },
    outline: [0.7, 1.1, 0.03],
    items: [0.2, 1.25, 2.3, 3.4, 4.4, 5.4].map((azimuth, i) => ({
      at: 0.42 + (i % 2) * 0.02,
      azimuth,
      tilt: 1.1,
      length: 0.65,
      width: 0.16,
      curl: 0.4,
      seed: (i * 0.173 + 0.11) % 1,
    })),
  },
  camera: { distance: 1.05, dive: 0.7 },
  world: {
    background: { inner: "#1F1E3D", outer: "#0D0C1E" },
    fog: "#17162E",
    hemisphere: { sky: "#E5DCF5", ground: "#1F1E3D", intensity: 0.16 },
    key: { color: "#EEF0FF", intensity: 1.4 },
    rim: { color: "#C9B8FF", intensity: 2.6, secondary: "#E8B4BC" },
    fill: { color: "#4A4A7A", intensity: 0.3 },
    envIntensity: 0.35,
  },
};
