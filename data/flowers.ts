/**
 * Каталогийн өгөгдөл. Зургууд (`images`) нь `scripts/fetch-unsplash.ts`-ийн үүсгэсэн
 * `flowerImages.ts`-ээс ирнэ — script-ийг ажиллуулахад энд автоматаар орно.
 *
 * Энэ файлыг script Node-оор шууд импортолдог тул: зөвхөн relative `.ts` импорт,
 * `@/` alias-гүй, төрөл зөвхөн `import type`-аар.
 */
import { flowerImages } from "./flowerImages.ts";

export const flowerSlugs = [
  "peony",
  "rose",
  "spray-rose",
  "tulip",
  "lily",
  "oriental-lily",
  "chrysanthemum",
  "sunflower",
  "orchid",
  "hydrangea",
  "ranunculus",
  "iris",
  "lilac",
  "lavender",
  "gerbera",
  "calla",
  "freesia",
  "lisianthus",
  "gypsophila",
] as const;

export type FlowerSlug = (typeof flowerSlugs)[number];

export type FlowerCategory =
  | "цээнэ"
  | "сарнай"
  | "алтанзул"
  | "сараана"
  | "хризантем"
  | "наранцэцэг"
  | "цахирмаа"
  | "гортензи"
  | "хурган цэцэг"
  | "цахилдаг"
  | "голт бор"
  | "лаванда"
  | "гербера"
  | "калла"
  | "фрезия"
  | "эустома"
  | "гипсофила";

export type Occasion =
  | "төрсөн өдөр"
  | "хайр сэтгэл"
  | "баяр"
  | "эмгэнэл"
  | "талархал"
  | "хурим"
  | "төгсөлт"
  | "эдгэрэлт"
  | "шинэ гэр";

export type BouquetSize = "Жижиг" | "Дунд" | "Том";

/** Арчилгааны зөвлөмжийн icon (components/ui/CareIcon) */
export type CareIcon = "cut" | "water" | "mist" | "temp" | "sun" | "bloom" | "hand" | "leaf" | "vase" | "warning";

export type FlowerColor = { name: string; hex: string };

export type FlowerImage = {
  /** Сайтад харуулах Unsplash hotlink (images.unsplash.com, ixid-тэй) — API guideline-ийн дагуу */
  src: string;
  /** scripts/fetch-unsplash.ts-ийн татсан хуулбар: /public/images/flowers/{slug}-{n}.jpg */
  local: string;
  alt: string;
  width: number;
  height: number;
  /** Зургийн дундаж өнгө — ачаалах үеийн дэвсгэр */
  color: string;
  photographer: { name: string; url: string };
  /** Unsplash дээрх зургийн хуудас (utm-тэй) */
  unsplashUrl: string;
};

export type Flower = {
  slug: FlowerSlug;
  nameMn: string;
  nameEn: string;
  latinName: string;
  category: FlowerCategory;
  colors: FlowerColor[];
  origin: string;
  meaning: string;
  occasions: Occasion[];
  care: {
    /** Хэдэн өдөр тутам ус солих */
    waterChangeDays: number;
    /** Ваартаа тэсэх хугацаа (өдөр) */
    vaseLifeDays: [min: number, max: number];
    tips: { icon: CareIcon; text: string }[];
  };
  pricing: {
    sizes: { size: BouquetSize; stems: number; price: number }[];
    /** Агуулахад байгаа иш */
    stock: number;
    deliveryNote: string;
  };
  /** Эрэлт — захиалгын харьцангуй оноо (0–100), каталогийн «Эрэлттэй» эрэмбэ */
  popularity: number;
  /** Каталогт нэмэгдсэн огноо (ISO) — «Шинэ» эрэмбэ */
  addedAt: string;
  images: FlowerImage[];
  relatedSlugs: FlowerSlug[];
  pairsWithSlugs: FlowerSlug[];
};

type FlowerData = Omit<Flower, "images">;

const DELIVERY = "Улаанбаатар хотод захиалснаас хойш 3 цагийн дотор хүргэнэ.";

const data: FlowerData[] = [
  {
    slug: "peony",
    nameMn: "Цээнэ",
    nameEn: "Peony",
    latinName: "Paeonia lactiflora",
    category: "цээнэ",
    colors: [
      { name: "Цайвар ягаан", hex: "#F3C6CF" },
      { name: "Цагаан", hex: "#F8F3EC" },
      { name: "Тод ягаан", hex: "#D9577E" },
    ],
    origin:
      "Зүүн Ази: Монголын зүүн хэсэг, Хятадын хойд нутаг, Сибирьт зэрлэгээр ургадаг. Хятадад мянга гаруй жилийн турш тариалж, олон зуун сорт гаргасан.",
    meaning:
      "Хятадад «цэцгийн хаан» хэмээн өргөмжилдөг; эд баялаг, нэр хүнд, аз жаргалтай гэр бүлийг бэлгэдэнэ.",
    occasions: ["хурим", "хайр сэтгэл", "төрсөн өдөр", "баяр"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [5, 7],
      tips: [
        { icon: "cut", text: "Ишийг 45° налуу огтолж, усанд орох навчийг авна." },
        { icon: "bloom", text: "Хатуу бөмбөлөг нахиа 1–3 өдөрт дэлгэрнэ — дулаан өрөөнд хурдан нээгдэнэ." },
        { icon: "temp", text: "Нар болон халаагуураас хол, сэрүүн газар тавина." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 95000 },
        { size: "Дунд", stems: 9, price: 165000 },
        { size: "Том", stems: 15, price: 260000 },
      ],
      stock: 60,
      deliveryNote: `Улирлын цэцэг (5–7-р сар), бусад үед урьдчилсан захиалгаар. ${DELIVERY}`,
    },
    popularity: 92,
    addedAt: "2026-05-20",
    relatedSlugs: ["ranunculus", "spray-rose", "hydrangea"],
    pairsWithSlugs: ["gypsophila", "lisianthus", "ranunculus"],
  },
  {
    slug: "rose",
    nameMn: "Сарнай",
    nameEn: "Rose",
    latinName: "Rosa × hybrida",
    category: "сарнай",
    colors: [
      { name: "Гүн улаан", hex: "#9E1B32" },
      { name: "Цайвар ягаан", hex: "#F2B8C2" },
      { name: "Цагаан", hex: "#F7F2EA" },
      { name: "Шаргал", hex: "#F3D3A0" },
    ],
    origin:
      "Сарнайн төрлийн ихэнх зүйл Азиас гаралтай. Орчин үеийн цэцэглэлт сарнай нь 19-р зуунд Европ, Хятадын сарнайг эрлийзжүүлж бий болсон; өнөөдөр Эквадор, Кени, Колумбаас голлон нийлүүлэгддэг.",
    meaning: "Улаан сарнай — хайр, хүсэл тэмүүлэл; цагаан — цэвэр ариун байдал; ягаан — талархал, энхрийлэл.",
    occasions: ["хайр сэтгэл", "төрсөн өдөр", "хурим", "баяр", "талархал"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 10],
      tips: [
        { icon: "cut", text: "Ус солих бүрт ишний үзүүрийг 1–2 см налуу огтолно." },
        { icon: "leaf", text: "Усанд орох навч, өргөсийг авбал ус удаан цэвэр байна." },
        { icon: "water", text: "Толгой унжвал ишийг огтолж, бүлээн усанд 1 цаг бүтнээр нь дүрнэ." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 7, price: 89000 },
        { size: "Дунд", stems: 15, price: 179000 },
        { size: "Том", stems: 25, price: 289000 },
      ],
      stock: 240,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 98,
    addedAt: "2025-09-01",
    relatedSlugs: ["spray-rose", "peony", "lisianthus"],
    pairsWithSlugs: ["gypsophila", "lisianthus", "freesia"],
  },
  {
    slug: "spray-rose",
    nameMn: "Бутлаг сарнай",
    nameEn: "Spray rose",
    latinName: "Rosa × hybrida",
    category: "сарнай",
    colors: [
      { name: "Цайвар ягаан", hex: "#F4C9D2" },
      { name: "Цөцгий", hex: "#F5E6CC" },
      { name: "Тоорын", hex: "#F2B39B" },
    ],
    origin:
      "Нэг ишэн дээр 5–10 жижиг цэцэг гаргадаг сарнайн бүлэг. Нидерланд, Кени, Эквадорт өргөн тариалдаг.",
    meaning: "Эелдэг баяр баясгалан, нандин мэдрэмж — жижиг цэцэг бүр нэг сэтгэлийн үг мэт.",
    occasions: ["төрсөн өдөр", "хурим", "талархал", "эдгэрэлт"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 10],
      tips: [
        { icon: "hand", text: "Хатсан жижиг цэцгийг тухай бүр тасалж авбал бусад нь удаан тогтоно." },
        { icon: "cut", text: "Ишийг налуу огтолж, усанд орох навчийг авна." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 69000 },
        { size: "Дунд", stems: 9, price: 119000 },
        { size: "Том", stems: 15, price: 189000 },
      ],
      stock: 150,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 80,
    addedAt: "2025-09-01",
    relatedSlugs: ["rose", "ranunculus", "lisianthus"],
    pairsWithSlugs: ["gypsophila", "peony", "freesia"],
  },
  {
    slug: "tulip",
    nameMn: "Алтанзул",
    nameEn: "Tulip",
    latinName: "Tulipa gesneriana",
    category: "алтанзул",
    colors: [
      { name: "Шаргал ягаан", hex: "#F2A27E" },
      { name: "Улаан", hex: "#C8283C" },
      { name: "Шар", hex: "#F2C94C" },
      { name: "Цагаан", hex: "#F7F3EA" },
    ],
    origin:
      "Төв Азийн Тянь-Шань, Памирын уулсаас гаралтай. Османы эзэнт гүрэнд эрхэмлэгдэж, 17-р зуунд Нидерландад «алтанзулын галзуурал» үүсгэсэн. Монголд зэрлэг алтанзул (Tulipa uniflora) ургадаг.",
    meaning: "Улаан — төгс хайр; шар — баяр хөөр, нарлаг бодол; цагаан — уучлал, шинэ эхлэл.",
    occasions: ["баяр", "төрсөн өдөр", "хайр сэтгэл", "шинэ гэр"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [5, 7],
      tips: [
        { icon: "sun", text: "Огтолсны дараа ч иш нь ургаж, гэрэл рүү тэмүүлдэг — ваарыг өдөр бүр эргүүлнэ." },
        { icon: "water", text: "Хүйтэн ус хийж, ваарны тал хүртэл л дүүргэнэ." },
        { icon: "warning", text: "Нарцисс (daffodil)-тай нэг ваарт бүү хий — ишний шүүс нь алтанзулыг гандаана." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 9, price: 79000 },
        { size: "Дунд", stems: 15, price: 129000 },
        { size: "Том", stems: 25, price: 209000 },
      ],
      stock: 300,
      deliveryNote: `Хамгийн шилдэг нь 2–5-р сард. ${DELIVERY}`,
    },
    popularity: 88,
    addedAt: "2026-02-10",
    relatedSlugs: ["ranunculus", "iris", "freesia"],
    pairsWithSlugs: ["iris", "freesia", "gypsophila"],
  },
  {
    slug: "lily",
    nameMn: "Зэрлэг сараана",
    nameEn: "Martagon lily",
    latinName: "Lilium martagon",
    category: "сараана",
    colors: [
      { name: "Голт бор", hex: "#B88AC8" },
      { name: "Гүн ягаан", hex: "#8E3E64" },
    ],
    origin:
      "Европоос Монгол, Сибирь хүртэл тархсан. Монголд Хэнтий, Хөвсгөлийн ойт хээр, ойн захаар ургадаг; дэлбээ нь гадагш эргэсэн «туркийн малгай» хэлбэртэй.",
    meaning: "Тал нутгийн эрх чөлөө, эрхэмсэг байдал, тууштай чанар.",
    occasions: ["баяр", "талархал", "төрсөн өдөр"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [5, 8],
      tips: [
        { icon: "hand", text: "Дэлбээ нээгдмэгц тоосны уут (anther)-ыг авбал дэлбээ, хувцас толбогүй үлдэнэ." },
        { icon: "bloom", text: "Дээрээс нь доош дараалан нээгдэнэ — нээгдсэнийг нь тухай бүр авна." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 3, price: 66000 },
        { size: "Дунд", stems: 5, price: 105000 },
        { size: "Том", stems: 9, price: 180000 },
      ],
      stock: 25,
      deliveryNote: `Ховор, улирлын (6–7-р сар) — урьдчилсан захиалгаар. ${DELIVERY}`,
    },
    popularity: 35,
    addedAt: "2026-06-15",
    relatedSlugs: ["oriental-lily", "iris", "lavender"],
    pairsWithSlugs: ["lavender", "gypsophila", "lisianthus"],
  },
  {
    slug: "oriental-lily",
    nameMn: "Ориентал сараана",
    nameEn: "Oriental lily",
    latinName: "Lilium Oriental hybrids",
    category: "сараана",
    colors: [
      { name: "Цагаан", hex: "#F7F3EC" },
      { name: "Ягаан толботой", hex: "#E07A9A" },
    ],
    origin:
      "Японы сараана (Lilium auratum, L. speciosum)-г эрлийзжүүлж гаргасан бүлэг; Нидерландад голлон селекц хийдэг. «Stargazer» сорт хамгийн алдартай.",
    meaning: "Цэвэр ариун байдал, хөгжил дэвшил, эрхэмсэг байдал. Цагаан сараана зарим соёлд эмгэнэлийн цэцэг.",
    occasions: ["хурим", "эмгэнэл", "баяр", "талархал"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [10, 14],
      tips: [
        { icon: "hand", text: "Тоосны уутыг нээгдмэгц салфеткаар хавчиж авна — тоос нь даавуу будна." },
        { icon: "vase", text: "Анхилуун үнэр хүчтэй тул жижиг өрөөнд цөөхөн иш хангалттай." },
        { icon: "warning", text: "Муурны эзэд анхаар: сараана муурт маш хортой." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 3, price: 54000 },
        { size: "Дунд", stems: 5, price: 89000 },
        { size: "Том", stems: 9, price: 155000 },
      ],
      stock: 90,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 60,
    addedAt: "2025-09-01",
    relatedSlugs: ["lily", "calla", "lisianthus"],
    pairsWithSlugs: ["rose", "gypsophila", "hydrangea"],
  },
  {
    slug: "chrysanthemum",
    nameMn: "Хризантем",
    nameEn: "Chrysanthemum",
    latinName: "Chrysanthemum × morifolium",
    category: "хризантем",
    colors: [
      { name: "Цагаан", hex: "#F5F1E6" },
      { name: "Шар", hex: "#F2C14E" },
      { name: "Голт бор", hex: "#B276B2" },
    ],
    origin:
      "Хятадад хэдэн мянган жилийн өмнөөс тариалж эхэлсэн; Японд эзэн хааны сүлд болсон. Өнөөдөр дэлхийд хамгийн их тариалдаг цэцгийн нэг.",
    meaning:
      "Азид урт наслалт, баяр баясгалан. Франц, Итали, Бельги зэрэг Европын орнуудад эмгэнэл, дурсамжийн цэцэг гэж үздэг.",
    occasions: ["эмгэнэл", "талархал", "эдгэрэлт", "баяр"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [14, 21],
      tips: [
        { icon: "water", text: "Хамгийн удаан тэсдэг цэцгийн нэг — ус цэвэр байлгавал 3 долоо хоног тогтоно." },
        { icon: "cut", text: "Иш хатуу тул огтлохдоо хурц хутга ашиглана." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 39000 },
        { size: "Дунд", stems: 11, price: 79000 },
        { size: "Том", stems: 21, price: 139000 },
      ],
      stock: 260,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 55,
    addedAt: "2025-10-05",
    relatedSlugs: ["gerbera", "sunflower", "calla"],
    pairsWithSlugs: ["calla", "oriental-lily", "gypsophila"],
  },
  {
    slug: "sunflower",
    nameMn: "Наранцэцэг",
    nameEn: "Sunflower",
    latinName: "Helianthus annuus",
    category: "наранцэцэг",
    colors: [{ name: "Алтан шар", hex: "#F2B705" }],
    origin:
      "Хойд Америкаас гаралтай; уугуул иргэд МЭӨ 3000 орчим жилээс гаршуулсан. 16-р зуунд Европ руу, дараа нь Орос, Азид тархсан.",
    meaning: "Үнэнч сэтгэл, хүндэтгэл, дулаан найрсаг байдал — залуу нахиа нь нарыг дагаж эргэдэг.",
    occasions: ["төрсөн өдөр", "талархал", "эдгэрэлт", "төгсөлт"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [6, 10],
      tips: [
        { icon: "water", text: "Маш их ус уудаг — ваарыг өдөр бүр шалгаж, дүүрэн байлгана." },
        { icon: "vase", text: "Хүнд толгойтой тул өндөр, тогтвортой ваар сонгоно." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 3, price: 39000 },
        { size: "Дунд", stems: 7, price: 85000 },
        { size: "Том", stems: 12, price: 139000 },
      ],
      stock: 120,
      deliveryNote: `Шилдэг нь 7–9-р сард. ${DELIVERY}`,
    },
    popularity: 58,
    addedAt: "2026-07-01",
    relatedSlugs: ["gerbera", "chrysanthemum", "tulip"],
    pairsWithSlugs: ["chrysanthemum", "lavender", "gypsophila"],
  },
  {
    slug: "orchid",
    nameMn: "Цахирмаа",
    nameEn: "Moth orchid",
    latinName: "Phalaenopsis spp.",
    category: "цахирмаа",
    colors: [
      { name: "Цагаан", hex: "#F8F6F2" },
      { name: "Ягаан", hex: "#D86FA3" },
    ],
    origin:
      "Зүүн өмнөд Ази (Филиппин, Индонез, Малайз)-ийн халуун орны ойд модны мөчир дээр ургадаг эпифит цэцэг.",
    meaning: "Тансаг байдал, нарийн мэдрэмж, эрч хүч — үнэ цэнэтэй хүндэтгэлийн бэлэг.",
    occasions: ["талархал", "шинэ гэр", "баяр", "хайр сэтгэл"],
    care: {
      waterChangeDays: 3,
      vaseLifeDays: [14, 21],
      tips: [
        { icon: "cut", text: "Огтолсон ишийг 3 хоног тутам 1 см огтолж, ус солино." },
        { icon: "sun", text: "Шууд нар, хүйтэн салхинаас хамгаална; цэцгийг шүршихгүй." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 1, price: 69000 },
        { size: "Дунд", stems: 3, price: 189000 },
        { size: "Том", stems: 5, price: 299000 },
      ],
      stock: 30,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 70,
    addedAt: "2025-11-12",
    relatedSlugs: ["calla", "oriental-lily", "lisianthus"],
    pairsWithSlugs: ["calla", "hydrangea", "lisianthus"],
  },
  {
    slug: "hydrangea",
    nameMn: "Гортензи",
    nameEn: "Hydrangea",
    latinName: "Hydrangea macrophylla",
    category: "гортензи",
    colors: [
      { name: "Цэнхэр", hex: "#8FA8D8" },
      { name: "Цагаан", hex: "#F3F1EA" },
      { name: "Цайвар ягаан", hex: "#E8B4C8" },
    ],
    origin:
      "Японоос гаралтай. Хөрсний хүчиллэгээс хамаарч өнгө нь өөрчлөгддөг: хүчиллэг хөрсөнд цэнхэр, шүлтлэгт ягаан.",
    meaning: "Чин сэтгэлийн талархал, гүн мэдрэмж; Японд уучлал, ойлголцлын цэцэг.",
    occasions: ["талархал", "хурим", "шинэ гэр", "эдгэрэлт"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [5, 9],
      tips: [
        { icon: "mist", text: "Дэлбээгээрээ ч ус шингээдэг — өдөр бүр шүршинэ." },
        { icon: "water", text: "Унжиж эхэлбэл толгойг нь бүтнээр нь 30–60 минут хүйтэн усанд дүрнэ." },
        { icon: "cut", text: "Модлог ишийг налуу огтолж, үзүүрийг 2–3 см хуваана." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 1, price: 45000 },
        { size: "Дунд", stems: 3, price: 125000 },
        { size: "Том", stems: 5, price: 199000 },
      ],
      stock: 45,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 72,
    addedAt: "2026-03-18",
    relatedSlugs: ["peony", "lilac", "lisianthus"],
    pairsWithSlugs: ["rose", "peony", "lisianthus"],
  },
  {
    slug: "ranunculus",
    nameMn: "Хурган цэцэг",
    nameEn: "Ranunculus",
    latinName: "Ranunculus asiaticus",
    category: "хурган цэцэг",
    colors: [
      { name: "Тоорын", hex: "#F4B08E" },
      { name: "Цайвар ягаан", hex: "#F3C1CC" },
      { name: "Цагаан", hex: "#F7F3EC" },
      { name: "Улаан", hex: "#C73A3A" },
    ],
    origin:
      "Газар дундын тэнгисийн зүүн эрэг, Баруун өмнөд Ази (Турк, Ойрх Дорнод)-аас гаралтай. Цаас мэт нимгэн олон давхар дэлбээтэй.",
    meaning: "Дур булаам, гэрэлтсэн сэтгэл — Викторийн үеийн цэцгийн хэлээр «Таны сэтгэл татам байдалд гайхаж байна».",
    occasions: ["хайр сэтгэл", "төрсөн өдөр", "хурим"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 10],
      tips: [
        { icon: "water", text: "Иш нь хөндий, зөөлөн тул ваарыг гүехэн усаар дүүргэнэ." },
        { icon: "bloom", text: "Хагас нээгдсэн нахиа ваартаа бүрэн дэлгэрнэ." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 7, price: 77000 },
        { size: "Дунд", stems: 12, price: 129000 },
        { size: "Том", stems: 20, price: 209000 },
      ],
      stock: 80,
      deliveryNote: `Шилдэг нь 1–5-р сард. ${DELIVERY}`,
    },
    popularity: 76,
    addedAt: "2026-01-22",
    relatedSlugs: ["peony", "spray-rose", "tulip"],
    pairsWithSlugs: ["peony", "tulip", "freesia"],
  },
  {
    slug: "iris",
    nameMn: "Цахилдаг",
    nameEn: "Dutch iris",
    latinName: "Iris × hollandica",
    category: "цахилдаг",
    colors: [
      { name: "Хөх ягаан", hex: "#4B4FA8" },
      { name: "Цагаан", hex: "#F5F3EE" },
    ],
    origin:
      "Газар дундын тэнгисийн цахилдаг (Iris xiphium, I. tingitana)-ийг эрлийзжүүлж Нидерландад гаргасан. Монголд олон зүйлийн зэрлэг цахилдаг ургадаг.",
    meaning: "Итгэл, мэргэн ухаан, найдвар — Грекийн домогт солонгын бурхан Ирисийн нэрээр.",
    occasions: ["талархал", "баяр", "төгсөлт", "эдгэрэлт"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [3, 5],
      tips: [
        { icon: "bloom", text: "Богино насалдаг тул өнгө нь харагдаж буй нахиагаар нь авна." },
        { icon: "water", text: "Хүйтэн, шинэ ус өдөр бүр — дулаанд хурдан задарна." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 7, price: 49000 },
        { size: "Дунд", stems: 12, price: 82000 },
        { size: "Том", stems: 20, price: 132000 },
      ],
      stock: 110,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 40,
    addedAt: "2026-04-02",
    relatedSlugs: ["tulip", "freesia", "lily"],
    pairsWithSlugs: ["tulip", "sunflower", "gypsophila"],
  },
  {
    slug: "lilac",
    nameMn: "Голт бор",
    nameEn: "Lilac",
    latinName: "Syringa vulgaris",
    category: "голт бор",
    colors: [
      { name: "Голт бор", hex: "#B79AD1" },
      { name: "Цагаан", hex: "#F4F1EA" },
    ],
    origin:
      "Балканы хойгоос гаралтай бут. Хүйтэнд тэсвэртэй тул Улаанбаатарын гудамж, цэцэрлэгт ч өргөн тарьдаг.",
    meaning: "Анхны хайр, залуу насны дурсамж, хаврын сэргэлт.",
    occasions: ["хайр сэтгэл", "төрсөн өдөр", "төгсөлт"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [3, 5],
      tips: [
        { icon: "cut", text: "Модлог ишийг налуу огтолж, үзүүрийг хувааж ус шингээлтийг сайжруулна." },
        { icon: "leaf", text: "Ихэнх навчийг авбал ус цэцэгт л зарцуулагдана." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 3, price: 45000 },
        { size: "Дунд", stems: 7, price: 99000 },
        { size: "Том", stems: 11, price: 149000 },
      ],
      stock: 0,
      deliveryNote: `Улирлын цэцэг (5–6-р сар). ${DELIVERY}`,
    },
    popularity: 38,
    addedAt: "2026-05-08",
    relatedSlugs: ["hydrangea", "lavender", "peony"],
    pairsWithSlugs: ["peony", "tulip", "ranunculus"],
  },
  {
    slug: "lavender",
    nameMn: "Лаванда",
    nameEn: "Lavender",
    latinName: "Lavandula angustifolia",
    category: "лаванда",
    colors: [{ name: "Лаванда", hex: "#9C8CC9" }],
    origin: "Газар дундын тэнгисийн бүс нутгаас гаралтай; Францын Прованс мужийн лавандын талбай алдартай.",
    meaning: "Тайван байдал, үнэнч сэтгэл, цэвэр ариун байдал.",
    occasions: ["талархал", "шинэ гэр", "эдгэрэлт"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 14],
      tips: [
        { icon: "leaf", text: "Усгүйгээр толгойг нь доош харуулан өлгөж хатаавал үнэр, өнгөө жил гаруй хадгална." },
        { icon: "water", text: "Бага ус — ишний 3–5 см л усанд байхад хангалттай." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 20, price: 35000 },
        { size: "Дунд", stems: 40, price: 65000 },
        { size: "Том", stems: 70, price: 109000 },
      ],
      stock: 400,
      deliveryNote: `Шинэхэн нь 6–8-р сард, хатаасан нь жилийн турш. ${DELIVERY}`,
    },
    popularity: 45,
    addedAt: "2026-06-28",
    relatedSlugs: ["lilac", "lily", "gypsophila"],
    pairsWithSlugs: ["sunflower", "rose", "lily"],
  },
  {
    slug: "gerbera",
    nameMn: "Гербера",
    nameEn: "Gerbera daisy",
    latinName: "Gerbera jamesonii",
    category: "гербера",
    colors: [
      { name: "Улбар шар", hex: "#F28C38" },
      { name: "Ягаан", hex: "#EE6A8E" },
      { name: "Шар", hex: "#F5C842" },
    ],
    origin: "Өмнөд Африкийн Трансвааль нутгаас гаралтай тул «Трансваалийн цэцэг» гэж нэрлэдэг.",
    meaning: "Хөгжилтэй, гэнэн цайлган байдал, амьдралын баяр баясгалан.",
    occasions: ["төрсөн өдөр", "эдгэрэлт", "баяр", "төгсөлт"],
    care: {
      waterChangeDays: 1,
      vaseLifeDays: [5, 10],
      tips: [
        { icon: "water", text: "Иш нь нянд мэдрэг — ваарт 5 см л ус хийж, өдөр бүр солино." },
        { icon: "cut", text: "Толгой унжихаас сэргийлж ишийг цэвэр, хурц хутгаар огтолно." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 7, price: 42000 },
        { size: "Дунд", stems: 12, price: 69000 },
        { size: "Том", stems: 20, price: 109000 },
      ],
      stock: 180,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 52,
    addedAt: "2025-10-05",
    relatedSlugs: ["sunflower", "chrysanthemum", "tulip"],
    pairsWithSlugs: ["chrysanthemum", "gypsophila", "freesia"],
  },
  {
    slug: "calla",
    nameMn: "Калла",
    nameEn: "Calla lily",
    latinName: "Zantedeschia aethiopica",
    category: "калла",
    colors: [
      { name: "Цагаан", hex: "#F6F4EE" },
      { name: "Хар хүрэн ягаан", hex: "#4A1E3A" },
    ],
    origin: "Өмнөд Африкаас гаралтай; нэрээрээ «сараана» ч ботаникийн хувьд сараананы төрөлд хамаарахгүй.",
    meaning: "Сүр жавхлан, гоо үзэсгэлэн, цэвэр ариун байдал — хуримын баглааны сонгодог цэцэг.",
    occasions: ["хурим", "эмгэнэл", "баяр", "талархал"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 14],
      tips: [
        { icon: "water", text: "Иш нь зөөлөн — бага ус хийж, ваарны ёроол хүртэл бүү дүүргэ." },
        { icon: "hand", text: "Дэлбээнд хүрвэл хүрэн толбо үлдэх тул ишнээс нь барина." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 79000 },
        { size: "Дунд", stems: 9, price: 139000 },
        { size: "Том", stems: 15, price: 225000 },
      ],
      stock: 70,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 48,
    addedAt: "2025-12-01",
    relatedSlugs: ["orchid", "oriental-lily", "lisianthus"],
    pairsWithSlugs: ["orchid", "rose", "lisianthus"],
  },
  {
    slug: "freesia",
    nameMn: "Фрезия",
    nameEn: "Freesia",
    latinName: "Freesia × hybrida",
    category: "фрезия",
    colors: [
      { name: "Цагаан", hex: "#F7F4EC" },
      { name: "Шар", hex: "#F3D35B" },
      { name: "Ягаан", hex: "#E58FB4" },
    ],
    origin: "Өмнөд Африкийн Кейп нутгаас гаралтай; сайхан анхилуун үнэрээрээ үнэртэнд өргөн ашиглагддаг.",
    meaning: "Нөхөрлөл, итгэл, гэм зэмгүй сэтгэл.",
    occasions: ["төрсөн өдөр", "талархал", "хурим", "эдгэрэлт"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 10],
      tips: [
        { icon: "bloom", text: "Нахиа нь ёроолоосоо дээш дараалан нээгддэг — гандсан цэцгийг тухай бүр авна." },
        { icon: "warning", text: "Жимсний дэргэд бүү тавь: этилен нахиаг нээгдүүлэхгүй." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 7, price: 59000 },
        { size: "Дунд", stems: 12, price: 99000 },
        { size: "Том", stems: 20, price: 159000 },
      ],
      stock: 130,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 50,
    addedAt: "2026-08-14",
    relatedSlugs: ["tulip", "iris", "spray-rose"],
    pairsWithSlugs: ["rose", "tulip", "ranunculus"],
  },
  {
    slug: "lisianthus",
    nameMn: "Эустома",
    nameEn: "Lisianthus",
    latinName: "Eustoma grandiflorum",
    category: "эустома",
    colors: [
      { name: "Цагаан", hex: "#F6F3EC" },
      { name: "Голт бор", hex: "#8E5BA8" },
      { name: "Цайвар ногоон", hex: "#DCE8C8" },
    ],
    origin:
      "АНУ-ын өмнөд хэсэг (Техас), Мексикийн тал хээрээс гаралтай; Японд селекц хийж давхар дэлбээтэй сортууд гаргасан.",
    meaning: "Талархал, дур булаам байдал, урт насны холбоо.",
    occasions: ["хурим", "талархал", "хайр сэтгэл", "баяр"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [10, 14],
      tips: [
        { icon: "bloom", text: "Нахиа нь ваартаа нэг нэгээр нээгдэж удаан тогтоно." },
        { icon: "mist", text: "Дэлбээ нимгэн тул шүршихгүй, сэрүүн газар байлгана." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 65000 },
        { size: "Дунд", stems: 9, price: 115000 },
        { size: "Том", stems: 15, price: 185000 },
      ],
      stock: 95,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 66,
    addedAt: "2026-09-03",
    relatedSlugs: ["spray-rose", "peony", "calla"],
    pairsWithSlugs: ["rose", "peony", "hydrangea"],
  },
  {
    slug: "gypsophila",
    nameMn: "Гипсофила",
    nameEn: "Baby's breath",
    latinName: "Gypsophila paniculata",
    category: "гипсофила",
    colors: [
      { name: "Цагаан", hex: "#F8F7F2" },
      { name: "Цайвар ягаан", hex: "#F1D3DC" },
    ],
    origin: "Төв, Зүүн Европ болон Төв Азийн тал хээрээс гаралтай; баглаанд «үүл» мэт дүүргэгч болгон хэрэглэдэг.",
    meaning: "Мөнхийн хайр, гэм зэмгүй сэтгэл, цэвэр ариун байдал.",
    occasions: ["хурим", "хайр сэтгэл", "төрсөн өдөр"],
    care: {
      waterChangeDays: 2,
      vaseLifeDays: [7, 10],
      tips: [
        { icon: "vase", text: "Өөрөө ч, бусад цэцэгтэй ч сайхан зохицно; хатаавал удаан хадгалагдана." },
        { icon: "water", text: "Ваарны усыг цэвэр байлгавал жижиг цэцгүүд цагаанаараа үлдэнэ." },
      ],
    },
    pricing: {
      sizes: [
        { size: "Жижиг", stems: 5, price: 29000 },
        { size: "Дунд", stems: 10, price: 52000 },
        { size: "Том", stems: 20, price: 95000 },
      ],
      stock: 350,
      deliveryNote: `Жилийн турш. ${DELIVERY}`,
    },
    popularity: 64,
    addedAt: "2025-09-01",
    relatedSlugs: ["lisianthus", "lavender", "spray-rose"],
    pairsWithSlugs: ["peony", "rose", "chrysanthemum"],
  },
];

export const flowers: Flower[] = data.map((f) => ({ ...f, images: flowerImages[f.slug] ?? [] }));
