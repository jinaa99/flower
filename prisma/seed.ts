/**
 * `data/flowers.ts` + `lib/delivery.ts`-ийн анхны утгыг DB-д оруулна.
 *
 *   npm run db:seed            # байхгүйг л нэмнэ — admin-д засварласан үнэ, нөөц хэвээр
 *   npm run db:seed:reset     # каталогийг файлын утгаар бүрэн дарж бичнэ (захиалга хөндөхгүй)
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { flowers } from "../data/flowers.ts";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client.ts";
import { deliverySlots } from "../lib/delivery.ts";

const reset = process.argv.includes("--reset");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  for (const [i, f] of flowers.entries()) {
    const content = {
      nameMn: f.nameMn,
      nameEn: f.nameEn,
      latinName: f.latinName,
      category: f.category,
      colors: f.colors,
      origin: f.origin,
      meaning: f.meaning,
      occasions: f.occasions,
      care: f.care as unknown as Prisma.InputJsonValue,
      deliveryNote: f.pricing.deliveryNote,
      popularity: f.popularity,
      addedAt: new Date(`${f.addedAt}T00:00:00Z`),
      relatedSlugs: f.relatedSlugs,
      pairsWithSlugs: f.pairsWithSlugs,
      sortOrder: i,
    };
    await db.flower.upsert({
      where: { slug: f.slug },
      create: { slug: f.slug, ...content, stock: f.pricing.stock },
      update: reset ? { ...content, stock: f.pricing.stock } : {},
    });

    for (const [j, v] of f.pricing.sizes.entries()) {
      const variant = { stems: v.stems, price: v.price, sortOrder: j };
      await db.variant.upsert({
        where: { flowerSlug_size: { flowerSlug: f.slug, size: v.size } },
        create: { flowerSlug: f.slug, size: v.size, ...variant },
        update: reset ? variant : {},
      });
    }
  }

  for (const [i, s] of deliverySlots.entries()) {
    const slot = { label: s.label, startHour: s.start, endHour: s.end, capacity: s.capacity, sortOrder: i };
    await db.deliverySlot.upsert({
      where: { id: s.id },
      create: { id: s.id, ...slot },
      update: reset ? { ...slot, active: true } : {},
    });
  }

  console.log(`[seed] ${flowers.length} цэцэг, ${deliverySlots.length} хүргэлтийн завсар${reset ? " (reset)" : ""}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
