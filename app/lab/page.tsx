import type { Metadata } from "next";
import { FlowerLab } from "./FlowerLab";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

// Хөгжүүлэлтийн туршилтын хуудас — цэцгийн бүх параметрийг гараар тааруулна.
export default function LabPage() {
  return <FlowerLab />;
}
