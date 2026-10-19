import { markOrderPaid } from "@/lib/orders";

/**
 * Mock төлбөр: «Төлбөр шалгах» товч төлөгдсөн гэж тэмдэглэнэ.
 * Жинхэнэ интеграцид QPay-ийн callback / банкны webhook энэ үүргийг гүйцэтгэнэ.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/orders/[id]/pay">) {
  const { id } = await ctx.params;
  const order = await markOrderPaid(id);
  if (!order) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, paid: order.paid });
}
