"use server";

import { cookies } from "next/headers";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  adminConfigured,
  checkPassword,
  createSessionToken,
  safeAdminPath,
  SESSION_SECONDS,
} from "@/lib/adminAuth";
import { requireAdmin } from "@/lib/adminSession";
import { FLOWERS_TAG } from "@/lib/data";
import { db } from "@/lib/db";
import { isOrderStatus } from "@/lib/orderStatus";
import { setOrderStatus } from "@/lib/orders";

export type FormState = { ok: boolean; message: string } | null;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!adminConfigured()) {
    return { ok: false, message: "ADMIN_PASSWORD, ADMIN_SECRET орчны хувьсагч тохируулаагүй байна." };
  }
  if (!(await checkPassword(String(formData.get("password") ?? "")))) {
    // Таах оролдлогыг удаашруулна
    await new Promise((r) => setTimeout(r, 800));
    return { ok: false, message: "Нууц үг буруу байна." };
  }
  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect(safeAdminPath(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function changeOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status");
  if (!isOrderStatus(status)) return;
  await setOrderStatus(id, status);
  refresh();
}

const int = (label: string, max: number) =>
  z.coerce
    .number(`${label}: тоо оруулна уу`)
    .int(`${label}: бүхэл тоо оруулна уу`)
    .min(0, `${label}: сөрөг байж болохгүй`)
    .max(max, `${label}: хэт их байна`);

/** FormData: `variant:<id>:price`, `variant:<id>:stems` → [{ id, price?, stems? }] */
function readVariants(formData: FormData) {
  const map = new Map<string, Record<string, FormDataEntryValue>>();
  for (const [key, value] of formData) {
    const m = /^variant:([\w-]+):(price|stems)$/.exec(key);
    if (m) map.set(m[1], { ...map.get(m[1]), [m[2]]: value });
  }
  return [...map].map(([id, fields]) => ({ id, ...fields }));
}

const variantSchema = z.object({
  id: z.string(),
  price: int("Үнэ", 10_000_000).refine((v) => v > 0, "Үнэ: 0-ээс их байна"),
  stems: int("Иш", 500).refine((v) => v > 0, "Иш: 0-ээс их байна").optional(),
});

const inventorySchema = z.object({
  slug: z.string(),
  stock: int("Нөөц", 100_000),
  variants: z.array(variantSchema),
});

const detailsSchema = inventorySchema.extend({
  nameMn: z.string().trim().min(1, "Монгол нэр хоосон байна").max(60),
  nameEn: z.string().trim().min(1, "Англи нэр хоосон байна").max(60),
  latinName: z.string().trim().max(80),
  origin: z.string().trim().max(1000),
  meaning: z.string().trim().max(1000),
  deliveryNote: z.string().trim().max(400),
  popularity: int("Эрэлт", 100),
});

const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Мэдээлэл буруу байна.";

async function saveFlower(
  slug: string,
  data: Record<string, unknown>,
  variants: z.infer<typeof variantSchema>[],
): Promise<FormState> {
  try {
    await db.$transaction([
      db.flower.update({ where: { slug }, data }),
      // Өөр цэцгийн хэмжээг энэ формоор засахгүй
      ...variants.map(({ id, ...v }) => db.variant.update({ where: { id, flowerSlug: slug }, data: v })),
    ]);
  } catch {
    return { ok: false, message: "Хадгалж чадсангүй — хуудсыг сэргээгээд дахин оролдоно уу." };
  }
  // Каталог, дэлгэрэнгүй, сагсны үнэ шууд шинэчлэгдэнэ
  updateTag(FLOWERS_TAG);
  refresh();
  return { ok: true, message: "Хадгаллаа" };
}

/** Жагсаалтаас: нөөц + үнэ */
export async function updateInventory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = inventorySchema.safeParse({
    slug: formData.get("slug"),
    stock: formData.get("stock"),
    variants: readVariants(formData),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const { slug, stock, variants } = parsed.data;
  return saveFlower(slug, { stock }, variants);
}

/** Дэлгэрэнгүй засвар: нэр, тайлбар, эрэлт, нөөц, хэмжээ бүрийн иш + үнэ */
export async function updateFlower(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = detailsSchema.safeParse({
    ...Object.fromEntries(
      ["slug", "stock", "nameMn", "nameEn", "latinName", "origin", "meaning", "deliveryNote", "popularity"].map((k) => [
        k,
        formData.get(k),
      ]),
    ),
    variants: readVariants(formData),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const { slug, variants, ...data } = parsed.data;
  return saveFlower(slug, data, variants);
}
