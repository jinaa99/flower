@AGENTS.md

# Flower — premium цэцгийн e-commerce

Scroll-driven 3D туршлагатай, premium botanical уур амьсгалтай цэцгийн онлайн дэлгүүр.

## Stack

- **Next.js 16** (App Router, `cacheComponents: true`) + TypeScript + **Tailwind CSS v4**
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Animation: `gsap` + `ScrollTrigger`, `lenis` (smooth scroll)
- State: `zustand` (сагс — `persist`-тэй, UI state)
- Шрифт (`next/font/google`, `latin` + `cyrillic`):
  - Display: **Cormorant Garamond** → `font-display` (Fraunces кирилл дэмждэггүй тул сонгоогүй)
  - Body: **Manrope** → `font-sans` (default)

Командууд: `npm run dev`, `npm run build`, `npm run lint`.

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

Бусад: `--header-height`, `--ease-bloom` (`ease-bloom`).

**Уур амьсгал:** premium botanical — харанхуй plum дэвсгэр, зөөлөн гэрэл, их зай (whitespace), том serif гарчиг (`font-light`), жижиг uppercase tracking-тэй eyebrow текст.

## Хавтасны бүтэц

```
app/
  layout.tsx              # шрифт, Header, SmoothScroll (Lenis)
  page.tsx                # нүүр — scroll-driven 3D туршлага
  catalog/                # бүх цэцэг
  flowers/[slug]/         # цэцгийн дэлгэрэнгүй (generateStaticParams)
  bouquet-builder/        # баглаа бүрдүүлэгч
  cart/  checkout/
components/
  three/                  # 3D бүх зүйл (Canvas, mesh, shader, postprocessing)
  ui/                     # Header, PageShell, SmoothScroll, бусад UI
lib/                      # data.ts (getter), store.ts (zustand), utils.ts
data/                     # flowers.ts — цэцгийн мэдээлэл
public/images/
```

## Дүрэм

- **3D компонентууд:** `components/three/` доторх бүх файл `"use client"`. Хуудсанд `next/dynamic`-аар `{ ssr: false }` ачаална. `ssr: false` Server Component-д ажиллахгүй — dynamic import-ыг client wrapper компонент дотор хийнэ.
- **`useFrame` дотор шинэ object үүсгэхгүй** (`new THREE.Vector3()`, `new Color()`, `{...}`, `[...]` гэх мэт). Түр object-уудыг module scope эсвэл `useMemo`/`useRef`-д нэг удаа үүсгээд `.set()`, `.copy()`, `.lerp()`-ээр дахин ашиглана — GC-ийн саатлаас сэргийлнэ.
- **`prefers-reduced-motion`-г бүх animation хүндэтгэнэ:** Lenis асахгүй (`SmoothScroll.tsx`), GSAP/ScrollTrigger timeline-ууд `gsap.matchMedia()`-аар салгана, 3D-д тасралтгүй эргэлт/хөдөлгөөн зогсоож статик төлөв харуулна, CSS transition `globals.css`-д унтардаг.
- **Хэл:** UI текст бүгд Монгол хэлээр (`<html lang="mn">`). Цэцгийн нэр Монгол + Англи (`name: { mn, en }`), жишээ нь «Цээнэ · Peony». Үнэ `formatPrice()` (₮).
- ScrollTrigger-ийг Lenis-тэй хамт ашиглана — Lenis нь `gsap.ticker`-ээр ажилладаг тул тусдаа `requestAnimationFrame` loop бүү нэм.
- Zustand `persist` store-ийг client-д mount болсны дараа харуулна (hydration mismatch-аас сэргийлэх).

## Ажлын дараалал

1. **Эхлээд нэг цэцгийг төгс болгоно** (`peony` / Цээнэ): 3D загвар, материал, гэрэл, scroll animation, дэлгэрэнгүй хуудас, сагсанд нэмэх — бүгд бүрэн, өнгөлөгдсөн.
2. Үүний дараа л өргөжүүлнэ: бусад цэцэг, каталог, баглаа бүрдүүлэгч, checkout.

Шинэ цэцэг нэмэхдээ эхний цэцгийн бий болгосон pattern-ийг давтана — шинэ шийдэл бүү зохио.
