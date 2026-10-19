export type Flower = {
  slug: string;
  name: { mn: string; en: string };
  description: string;
  /** Төгрөгөөр, нэг ширхэгийн үнэ */
  price: number;
  palette: string[];
};

// Ажлын дараалал: эхлээд нэг цэцгийг төгс болгоод дараа нь нэмнэ.
export const flowers: Flower[] = [
  {
    slug: "peony",
    name: { mn: "Цээнэ", en: "Peony" },
    description: "Давхар дэлбээтэй, зөөлөн ягаан өнгөтэй, анхилуун цээнэ цэцэг.",
    price: 18000,
    palette: ["#E8B4BC", "#F6DDE0", "#F8F3EC"],
  },
];
