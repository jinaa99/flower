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
  - Display: **Cormorant Garamond** → `font-display` (Fraunces кирилл дэмждэггүй тул сонгоогүй)
  - Body: **Manrope** → `font-sans` (default)

Командууд: `npm run dev`, `npm run build`, `npm run lint`, `npm run images:fetch` (Unsplash, `.env.local`-д `UNSPLASH_ACCESS_KEY`),
`npm run images:depth` (зурагнаас depth map — Depth Anything V2, `public/images/depth/` + `data/flowerDepth.ts`).
DB: `npm run db:start` (локал `prisma dev`), `db:migrate`, `db:seed` (байхгүйг нэмнэ), `db:seed:reset` (каталогийг файлаар дарна), `db:studio`. Хувьсагчид: `.env.example`.

## Design tokens

Tailwind v4-д `tailwind.config` байхгүй — token-ууд `app/globals.css`-ийн `@theme` дотор CSS variable хэлбэрээр тодорхойлогдож, utility class автоматаар үүснэ (`bg-plum-950`, `text-gold-soft`, `var(--color-blush-300)`).

| Token        | Утга      | Хэрэглээ                         |
| ------------ | --------- | -------------------------------- |
| `plum-950`   | `#1E0F1A` | Үндсэн дэвсгэр                   |
| `plum-800`   | `#3A1C30` | Давхарга, gradient, гэрэлтүүлэг  |
| `blush-300`  | `#E8B4BC` | Accent, идэвхтэй төлөв           |
| `blush-100`  | `#F6DDE0` | Зөөлөн accent, hover             |
| `ivory`      | `#F8F3EC` | Үндсэн текст                     |
| `gold-soft`  | `#C9A87C` | Үнэ, CTA, нарийн шугам           |

Бусад: `blush-500` (`#D9577E`, гэрэлтэлт), `--header-height`, `--ease-bloom` (`ease-bloom`), `shadow-glow` / `shadow-glow-lg`.

**Utility (`globals.css`, `@utility`):** `btn-primary` (blush pill CTA), `btn-ghost` (хүрээтэй pill), `glass` (шилэн панель),
`eyebrow` (uppercase + араас шугам). Шинэ товч, eyebrow-д эдгээрийг ашиглана — class-ыг дахин бүү бич.

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
  home/                   # нүүрний хэсгүүд (Цэцгийн хэл, Цуглуулга, Онцлох цэцэг, Баглаа CTA, Хүргэлт)
  ui/                     # Header, Footer, Logo, DepthPhoto (2.5D), PageShell, SmoothScroll, бусад UI
lib/                      # data.ts (DB getter, "use cache" + cacheTag), db.ts (Prisma client), store.ts (zustand),
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
