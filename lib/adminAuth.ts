/*
 * /admin-ийн энгийн нууц үгтэй хамгаалалт. Cookie = «дуусах хугацаа.HMAC» — сервер дээр
 * session хадгалахгүй. Түлхүүрт нууц үг орсон тул ADMIN_PASSWORD солиход бүх session хүчингүй.
 * Web Crypto ашигласан тул `proxy.ts` болон Server Action хоёулаа импортлоно.
 */

export const ADMIN_COOKIE = "flower_admin";
export const SESSION_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

async function sign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${process.env.ADMIN_SECRET}:${process.env.ADMIN_PASSWORD}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Урт нь ижил string-ийг тогтмол хугацаанд харьцуулна */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Нууц үгийг шууд биш HMAC-аар харьцуулна — урт, агуулга задрахгүй */
export async function checkPassword(input: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const [a, b] = await Promise.all([sign(`pw:${input}`), sign(`pw:${process.env.ADMIN_PASSWORD}`)]);
  return safeEqual(a, b);
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${exp}.${await sign(`session:${exp}`)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split(".");
  if (!sig || !(Number(exp) > now / 1000)) return false;
  return safeEqual(sig, await sign(`session:${exp}`));
}

/** Нэвтэрсний дараа буцах хаяг — зөвхөн /admin доторх зам (open redirect-ээс сэргийлнэ) */
export function safeAdminPath(next: unknown): string {
  return typeof next === "string" && /^\/admin(\/[\w\-/]*)?(\?[\w\-=&%]*)?$/.test(next) && !next.startsWith("/admin/login")
    ? next
    : "/admin";
}
