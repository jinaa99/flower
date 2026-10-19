import type { Metadata } from "next";
import { getJourney } from "@/lib/data";
import { FlowerLab } from "./FlowerLab";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

// Хөгжүүлэлтийн туршилтын хуудас — цэцгийн бүх параметрийг гараар тааруулна.
export default async function LabPage() {
  return <FlowerLab stops={await getJourney()} />;
}
