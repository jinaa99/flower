import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

/**
 * Admin эрхийг өгөгдөлд ойр шалгана — Server Action, admin хуудас бүр дуудна.
 * `proxy.ts`-ийн redirect нь зөвхөн UX; action-ыг шууд POST-оор дуудаж болдог тул энэ л хамгаалалт.
 */
export async function requireAdmin(): Promise<void> {
  // Session-ийн хугацааг одоогийн цагтай харьцуулна — prerender/prefetch-д орохгүй, request бүрт
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");
}
