import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/PageShell";
import { getFlower, getFlowers } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return getFlowers().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(props: PageProps<"/flowers/[slug]">) {
  const { slug } = await props.params;
  const flower = getFlower(slug);
  return { title: flower ? `${flower.name.mn} · ${flower.name.en}` : "Олдсонгүй" };
}

export default async function FlowerPage(props: PageProps<"/flowers/[slug]">) {
  const { slug } = await props.params;
  const flower = getFlower(slug);
  if (!flower) notFound();

  return (
    <PageShell eyebrow={flower.name.en} title={flower.name.mn} subtitle={flower.description}>
      <p className="font-display text-3xl text-gold-soft">{formatPrice(flower.price)}</p>
    </PageShell>
  );
}
