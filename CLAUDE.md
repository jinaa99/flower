@AGENTS.md

# Saran — premium цэцгийн e-commerce

Scroll-driven 3D туршлагатай, premium botanical уур амьсгалтай цэцгийн онлайн дэлгүүр.

## Stack

- **Next.js 16** (App Router, `cacheComponents: true`) + TypeScript + **Tailwind CSS v4**
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Animation: `gsap` + `ScrollTrigger`, `lenis` (smooth scroll)
- State: `zustand` (сагс — `persist`-тэй, UI state)
- DB: **PostgreSQL + Prisma 7** (`prisma-client` generator → `lib/generated/prisma`, `@prisma/adapter-pg`, `prisma.config.ts` нь `.env.local`-ийг уншина)
- Шрифт (`next/font/google`, `latin` + `cyrillic`):
  - Display: **Noto Serif Display** (200/300/400 + italic) → `font-display` — өндөр контрасттай Didone, кирилл дэмждэг
    (Fraunces, Bodoni Moda дэмждэггүй). Том гарчиг `font-extralight`, онцолсон үг `<em className="font-light text-blush-100">`.
  - Body: **Manrope** → `font-sans` (default)

Командууд: `npm run dev`, `npm run build`, `npm run lint`, `npm run images:fetch` (Unsplash, `.env.local`-д `UNSPLASH_ACCESS_KEY`),
`npm run images:depth` (зурагнаас depth map — Depth Anything V2, `public/images/depth/` + `data/flowerDepth.ts`).
DB: `npm run db:start` (локал `prisma dev`), `db:migrate`, `db:seed` (байхгүйг нэмнэ), `db:seed:reset` (каталогийг файлаар дарна), `db:studio`. Хувьсагчид: `.env.example`.

## Design tokens

Tailwind v4-д `tailwind.config` байхгүй — token-ууд `app/globals.css`-ийн `@theme` дотор CSS variable хэлбэрээр тодорхойлогдож, utility class автоматаар үүснэ (`bg-plum-950`, `text-gold-soft`, `var(--color-blush-300)`).

| Token        | Утга      | Хэрэглээ                         |
| ------------ | --------- | -------------------------------- |
| `plum-950`   | `#140A0F` | Үндсэн дэвсгэр (near-black burgundy) |
| `plum-900`   | `#1D0F16` | Өргөгдсөн гадаргуу (drawer, ширээ)   |
| `plum-800`   | `#33161F` | Давхарга                             |
| `blush-300`  | `#E3AAB4` | Accent, идэвхтэй төлөв               |
| `blush-100`  | `#F3DADE` | Онцолсон italic үг, hover            |
| `ivory`      | `#F4ECE2` | Үндсэн текст, үндсэн CTA             |
| `gold-soft`  | `#C9AE84` | Champagne: үнэ, нарийн шугам         |

Бусад: `blush-500` (`#B4486A`, гүн сарнай — neon биш), `moss`, `--header-height`, `--ease-bloom`. `shadow-glow*` нь одоо
бараан зөөлөн сүүдэр — **гэрэлтэх хүрээ, neon ягаан, шилэн панель, чимэглэлийн gradient бүү нэм.** Хэсэг бүрийн өнгийг
цэцгийн өөрийнх нь өнгө (зураг, `flower.colors`) тодорхойлно.

**Utility (`globals.css`, `@utility`):** `btn-primary` (ivory pill CTA — бүх хуудсанд, checkout ч мөн), `btn-ghost`
(хүрээтэй pill), `link-line` (доогуур шугамтай текст холбоос), `glass` (3D дээрх бараан панель), `eyebrow` (жижиг
uppercase + өмнө нь шугам — хэсэгт нэгээс илүүгүй). Шинэ товч, eyebrow-д эдгээрийг ашиглана — class-ыг дахин бүү бич.
Uppercase шошгон дээр tracking ≤ `0.2em`. Tag/chip — rounded-full pill; сонголтын карт (хэмжээ, өдөр) — тэгш өнцөгт.
Цайвар хэсэг: `bg-paper text-plum-950` (Цэцгийн хэл — ботаникийн цомог), accent нь `rose-ink`, `gold-deep`.
Overlay (хайлт, mobile цэс, сагс) — native `<dialog>` + `useScrollLock` + `CloseOnNavigate`; `useUI` нэг л overlay нээнэ. `@utility` өөрчилсний дараа dev server хуучин CSS өгвөл файлыг дахин хадгална.

**Брэнд:** нэр, tagline нь `lib/brand.ts`-д (Saran / Саран); logo — `components/ui/Logo.tsx`, favicon — `app/icon.svg`.

**Уур амьсгал:** premium botanical — харанхуй plum дэвсгэр, зөөлөн гэрэл, их зай (whitespace), том serif гарчиг (`font-light`), жижиг uppercase tracking-тэй eyebrow текст.

## Хавтасны бүтэц

```
app/
  layout.tsx              # шрифт, Header, SmoothScroll (Lenis)
  page.tsx                # нүүр — scroll-driven 3D туршлага
  catalog/                # бүх цэцэг
  flowers/[slug]/         # цэцгийн дэлгэрэнгүй (generateStaticParams)
  bouquet-builder/        # баглаа бүрдүүлэгч
  cart/  checkout/         # сагс; checkout — react-hook-form + zod (lib/checkout.ts, сервертэй нэг schema)
  order/[id]/             # захиалга баталгаажсан + mock төлбөр (QPay / шилжүүлэг)
  api/orders/             # route handler: POST захиалга (үнийг серверт дахин тооцно, нөөц хасна), [id]/pay — mock
  admin/                  # нууц үгтэй (ADMIN_PASSWORD): (panel)/ захиалга + төлөв, flowers/ нөөц, үнэ, засвар; actions.ts
prisma/                   # schema.prisma (Flower, Variant, DeliverySlot, Order, OrderItem), migrations/, seed.ts
proxy.ts                  # /admin → нэвтрээгүй бол /admin/login (зөвхөн UX — жинхэнэ шалгалт requireAdmin)
components/
  three/                  # 3D бүх зүйл (Canvas, mesh, shader, postprocessing; Atmosphere — bokeh, тоосонцор)
  home/                   # нүүрний хэсгүүд: LanguageSection (ботаникийн цомог), FeaturedCollection/Item (бутик сүлжээ),
                          # BouquetCta (ателье), Finale (төгсгөлийн кадр + #delivery), Motion (RevealGroup, Parallax)
  ui/                     # Header (+ StoreMenu mega цэс, SearchOverlay, MobileMenu — layout-оос каталогийн мөр авна),
                          # Icons (нэгдсэн 1.3 шугамтай), CloseOnNavigate, Footer, Logo, DepthPhoto (2.5D), бусад UI
lib/                      # storeNav.ts (төрөл/тохиолдол/өнгө/улирал — каталогийн мөрөөс; цэс, хайлт, дэлгүүрийн танхим),
                          # data.ts (DB getter, "use cache" + cacheTag), db.ts (Prisma client), store.ts (zustand),
                          # utils.ts, cart.ts (мөр/дүн), orders.ts (transaction: нөөц хасах, завсрын багтаамж),
                          # adminAuth.ts / adminSession.ts (HMAC cookie, requireAdmin), orderStatus.ts
data/                     # flowers.ts — каталогийн seed (сайт DB-ээс уншина); journey.ts — нүүрний 3D аялал (story + spec);
                          # flowerSpecs.ts — 3D FlowerSpec; flowerImages.ts — script-ийн үүсгэдэг (гараар бүү засаарай)
scripts/                  # fetch-unsplash.ts — Node-оор шууд (type stripping) ажиллана
public/images/
```

## Дүрэм

- **3D компонентууд:** `components/three/` доторх бүх файл `"use client"`. Хуудсанд `next/dynamic`-аар `{ ssr: false }` ачаална. `ssr: false` Server Component-д ажиллахгүй — dynamic import-ыг client wrapper компонент дотор хийнэ.
- **`useFrame` дотор шинэ object үүсгэхгүй** (`new THREE.Vector3()`, `new Color()`, `{...}`, `[...]` гэх мэт). Түр object-уудыг module scope эсвэл `useMemo`/`useRef`-д нэг удаа үүсгээд `.set()`, `.copy()`, `.lerp()`-ээр дахин ашиглана — GC-ийн саатлаас сэргийлнэ.
- **`prefers-reduced-motion`-г бүх animation хүндэтгэнэ:** Lenis асахгүй (`SmoothScroll.tsx`), GSAP/ScrollTrigger timeline-ууд `gsap.matchMedia()`-аар салгана, 3D-д тасралтгүй эргэлт/хөдөлгөөн зогсоож статик төлөв харуулна, CSS transition `globals.css`-д унтардаг.
- **3D цэцгийн материал:** emissive «гэрэлтэлт», шүүдэр (dew) бараг 0 — бодит харагдац нь key гэрлийн сүүдэр (дэлбээ бүр
  `customDepthMaterial`-аар ижил хэлбэрээр сүүдэр тусгана), голын гүн сүүдэр (`cavity`), velvet sheen-ээс. Шинэ цэцэгт
  `world` нь бараан (near-black) байх ёстой; толбо хэрэгтэй бол `petals.spots`.
- **Хэл:** UI текст бүгд Монгол хэлээр (`<html lang="mn">`). Цэцгийн нэр Монгол + Англи (`name: { mn, en }`), жишээ нь «Цээнэ · Peony». Үнэ `formatPrice()` (₮).
- ScrollTrigger-ийг Lenis-тэй хамт ашиглана — Lenis нь `gsap.ticker`-ээр ажилладаг тул тусдаа `requestAnimationFrame` loop бүү нэм.
- Zustand `persist` store-ийг client-д mount болсны дараа харуулна (hydration mismatch-аас сэргийлэх).
- **Каталог DB-д:** уншилт `lib/data.ts`-ээр (`"use cache"`, tag `flowers` / `delivery-slots`). Admin засварт `updateTag`,
  захиалгын дараа `revalidateTag(…, "max")`. Үнэ, нөөцийг захиалгад cache-гүй `get*Fresh()`-ээр шалгана.
  Зураг, 3D spec, journey кодонд үлдэж slug-аар нэгдэнэ.
- **Admin:** Server Action, admin хуудас бүр `requireAdmin()` дуудна (proxy-д найдахгүй); session уншдаг хэсэг `<Suspense>` дотор.

## Ажлын дараалал

1. **Эхлээд нэг цэцгийг төгс болгоно** (`peony` / Цээнэ): 3D загвар, материал, гэрэл, scroll animation, дэлгэрэнгүй хуудас, сагсанд нэмэх — бүгд бүрэн, өнгөлөгдсөн.
2. Үүний дараа л өргөжүүлнэ: бусад цэцэг, каталог, баглаа бүрдүүлэгч, checkout.

Шинэ цэцэг нэмэхдээ эхний цэцгийн бий болгосон pattern-ийг давтана — шинэ шийдэл бүү зохио:
каталогт `data/flowers.ts`-д нэмж (`flowerSlugs`-д ч) `npm run db:seed`, `npm run images:fetch -- --only=slug`; 3D аялалд оруулах бол
`data/flowerSpecs.ts`-д `FlowerSpec` нэмж `data/journey.ts`-д холбоно. Хэлбэрийг `/lab`-д тааруулна.

- `data/` дахь файлууд script-ээс Node-оор шууд импортлогдоно: зөвхөн relative `.ts` импорт, `@/` alias-гүй, төрөл `import type`.
- 2.5D зураг: `DepthPhoto` (raw WebGL, three-гүй) + `getDepthMap(slug, i)`. Шинэ зурагт `npm run images:depth`.
- Unsplash зураг: сайт `images.unsplash.com`-ийг hotlink хийнэ (`FlowerPhoto` / `unsplashLoader`, Next optimizer-ээр биш),
  харуулсан газар бүрт `PhotoCredit` attribution. Local хуулбар (`local`) зөвхөн хөгжүүлэлтэд.
