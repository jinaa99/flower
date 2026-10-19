import { revalidateTag } from "next/cache";
import { orderRequestSchema, type OrderResponse } from "@/lib/checkout";
import { FLOWERS_TAG } from "@/lib/data";
import { createOrder } from "@/lib/orders";

const reply = (body: OrderResponse, status: number) => Response.json(body, { status });

/** Захиалга үүсгэх: сагс + checkout form → серверт дахин үнэлж хадгална */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return reply({ ok: false, code: "invalid", message: first?.message ?? "Мэдээлэл буруу байна." }, 422);
  }

  const result = await createOrder(parsed.data);
  if (!result.ok) return reply(result, 409);
  // Нөөц хасагдсан — каталогийн «үлдсэн иш»-ийг дараагийн хүсэлтээр шинэчилнэ
  revalidateTag(FLOWERS_TAG, "max");
  return reply({ ok: true, id: result.order.id, number: result.order.number }, 201);
}
