import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Dev-ийн HMR модулийг дахин ачаалахад холболтын pool давхардахгүй
const g = globalThis as typeof globalThis & { __flowerDb?: PrismaClient };

export const db = (g.__flowerDb ??= new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Локал `prisma dev` (PGlite) зэрэг олон холболтыг даахгүй — .env.local-д 1 болгоно
    max: process.env.DATABASE_POOL_MAX ? Number(process.env.DATABASE_POOL_MAX) : undefined,
  }),
}));
