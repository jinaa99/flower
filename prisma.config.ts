import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Prisma CLI `.env`-ийг автоматаар уншдаггүй — Next-тэй нэг `.env.local`-ийг ашиглана
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: env("DATABASE_URL") },
});
