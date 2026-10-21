import type { ReactNode } from "react";
import { greenery as greeneryOptions, papers, ribbons, type Greenery } from "@/data/bouquet";
import { flowerHeads, type FlowerHead } from "@/data/flowerHeads";
import type { FlowerSlug } from "@/data/flowers";
import type { BouquetConfig, BuilderFlower } from "@/lib/bouquet";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";

/*
 * Баглааны live preview — давхарласан 2D SVG (3D-гүй, хөнгөн):
 * ар цаас → иш → ногоон навч → цэцгийн толгойнууд → урд цаас → тууз → карт.
 * Толгойнууд phyllotaxis (golden angle)-аар бөмбөгөр хэлбэрт байрлаж, том нь голд;
 * иш нэмэгдэхэд байрлал CSS transition-ээр зөөлөн шилжиж, шинэ толгой «тодорч» гарна
 * (`globals.css` → `.bouquet-*`, reduced motion-д унтарна).
 */

const W = 400;
const H = 520;
const C = { x: 200, y: 205 };
const TIE = { x: 200, y: 380 };
const GOLDEN = (137.5 * Math.PI) / 180;
const PLUM = "#1E0F1A";
const WHITE = "#FFFFFF";
const STEM = "#4E6B3A";

type Shape = "rosette" | "cup" | "star" | "daisy" | "cluster" | "spike" | "cone" | "orchid";

/** Цэцэг бүрийн толгойн хэлбэр, хэмжээ (px, scale-ээс өмнө), голын өнгө */
const heads: Record<FlowerSlug, { shape: Shape; r: number; center?: string; fine?: boolean }> = {
  peony: { shape: "rosette", r: 30 },
  rose: { shape: "rosette", r: 22 },
  "spray-rose": { shape: "rosette", r: 12 },
  tulip: { shape: "cup", r: 19 },
  lily: { shape: "star", r: 26 },
  "oriental-lily": { shape: "star", r: 28 },
  chrysanthemum: { shape: "daisy", r: 19 },
  sunflower: { shape: "daisy", r: 30, center: "#4A2E14" },
  orchid: { shape: "orchid", r: 22 },
  hydrangea: { shape: "cluster", r: 34 },
  ranunculus: { shape: "rosette", r: 17 },
  iris: { shape: "star", r: 22, fine: true },
  lilac: { shape: "cluster", r: 24 },
  lavender: { shape: "spike", r: 18 },
  gerbera: { shape: "daisy", r: 22, center: "#3A2A1A" },
  calla: { shape: "cone", r: 20 },
  freesia: { shape: "spike", r: 18 },
  lisianthus: { shape: "rosette", r: 18 },
  gypsophila: { shape: "cluster", r: 20, fine: true },
};

/** Бодит зурагнаас тайрсан толгой; өнгө нь зурагтай тохирохгүй бол tint (duotone) */
type Photo = { href: string; width: number; height: number; crop: FlowerHead; tint: string | null };
type Head = { key: string; slug: FlowerSlug; hex: string; r: number; seed: number; photo: Photo | null };
type Placed = Head & { x: number; y: number };

export function BouquetPreview({ config, flowers }: { config: BouquetConfig; flowers: ReadonlyMap<string, BuilderFlower> }) {
  const list: Head[] = [];
  for (const line of config.stems) {
    const flower = flowers.get(line.slug);
    const hex = flower?.colors[line.color]?.hex;
    if (!flower || !hex) continue;
    for (let k = 0; k < line.count; k++) {
      const key = `${line.slug}:${line.color}:${k}`;
      const seed = hash(key);
      const photo = pickPhoto(flower, hex, seed);
      // Бодит зурган толгой нь бага зэрэг том — нягт, бие биенээ давхарласан бөмбөгөр
      list.push({ key, slug: line.slug, hex, r: heads[line.slug].r * (photo ? 1.3 : 1), seed, photo });
    }
  }
  const { placed, k, halfW, halfH } = layout(list);

  const sprigs: { key: string; g: Greenery; angle: number; length: number; seed: number }[] = [];
  const total = greeneryOptions.reduce((n, g) => n + (config.greenery[g.id] ?? 0), 0);
  let j = 0;
  for (const g of greeneryOptions) {
    for (let i = 0; i < (config.greenery[g.id] ?? 0); i++, j++) {
      const seed = hash(`${g.id}:${i}`);
      // Дээд хагас тойргоор (−165°…−15°) жигд тархаж, бага зэрэг санамсаргүй хазайна
      const angle = -165 + ((j + 0.5) / total) * 150 + (seed - 0.5) * 14;
      sprigs.push({ key: `${g.id}:${i}`, g, angle, length: 64 + seed * 28, seed });
    }
  }

  const paper = papers.find((p) => p.id === config.paper)!.hex;
  const ribbon = ribbons.find((r) => r.id === config.ribbon)!.hex;
  const wrapW = Math.max(halfW + 46, 92);
  const top = C.y - Math.max(halfH, 40) - 18;
  const frontY = C.y + Math.max(halfH, 40) * 0.72 + 6;
  const message = config.message.trim();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Баглааны урьдчилсан зураг">
      <defs>
        {/* Толгойн бөмбөрцөг хэлбэр: ирмэг рүү бараан — зураг хавтгай «наалт» шиг харагдахгүй */}
        <radialGradient id="head-shade" cx="0.42" cy="0.38" r="0.62">
          <stop offset="0.6" stopColor={PLUM} stopOpacity="0" />
          <stop offset="1" stopColor={PLUM} stopOpacity="0.28" />
        </radialGradient>
        {/* Зөөлөн ирмэг — толгойнууд хатуу «дугуй наалт» биш, хөршдөө уусна */}
        <radialGradient id="head-feather">
          <stop offset="0.72" stopColor={WHITE} />
          <stop offset="1" stopColor={WHITE} stopOpacity="0" />
        </radialGradient>
        {/* Цаасны зөөлөн гэрэл-сүүдэр */}
        <linearGradient id="paper-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={WHITE} stopOpacity="0.18" />
          <stop offset="0.6" stopColor={WHITE} stopOpacity="0" />
          <stop offset="1" stopColor={PLUM} stopOpacity="0.22" />
        </linearGradient>
        {[...new Set(list.map((h) => h.photo?.tint).filter((t): t is string => !!t))].map((hex) => (
          <TintFilter key={hex} hex={hex} />
        ))}
      </defs>
      {/* Ар талын цаас — дээд ирмэг нь долгионтой */}
      <path className="bouquet-shape" d={backPaper(wrapW, top)} fill={mix(paper, PLUM, 0.32)} />
      <path className="bouquet-shape" d={backPaper(wrapW - 16, top + 14)} fill={mix(paper, PLUM, 0.16)} />

      {placed.map((h) => (
        <line
          key={`stem-${h.key}`}
          x1={C.x + h.x}
          y1={C.y + h.y}
          x2={TIE.x + (h.seed - 0.5) * 10}
          y2={TIE.y}
          stroke={STEM}
          strokeWidth={1.6}
          strokeLinecap="round"
          className="bouquet-shape"
        />
      ))}

      {sprigs.map((s) => {
        const a = (s.angle * Math.PI) / 180;
        const x = C.x + Math.cos(a) * Math.max(halfW, 30) * 0.8;
        const y = C.y + Math.sin(a) * Math.max(halfH, 24) * 0.8;
        return (
          <g key={s.key} className="bouquet-node" style={{ transform: `translate(${x}px, ${y}px) rotate(${s.angle}deg)` }}>
            <g className="bouquet-pop">{sprig(s.g, s.length, s.seed)}</g>
          </g>
        );
      })}

      {/* Хойноос урагш (y өсөхөөр) — урд талын толгой арынхаа дээр */}
      {[...placed]
        .sort((a, b) => a.y - b.y)
        .map((h) => (
          <g
            key={h.key}
            className="bouquet-node"
            style={{ transform: `translate(${C.x + h.x}px, ${C.y + h.y}px) scale(${k})` }}
          >
            <g className="bouquet-pop">{h.photo ? <PhotoHead head={h} photo={h.photo} /> : head(h)}</g>
          </g>
        ))}

      {/* Урд цаас: хоёр давхцсан хавтас + доош нарийсах боодол */}
      <path
        className="bouquet-shape"
        d={`M${TIE.x - 17} ${TIE.y} L${TIE.x - 8} 506 L${TIE.x + 8} 506 L${TIE.x + 17} ${TIE.y} Z`}
        fill={mix(paper, PLUM, 0.22)}
      />
      <path
        className="bouquet-shape"
        d={`M${TIE.x + 6} ${TIE.y + 6} L${C.x - wrapW - 4} ${frontY} L${C.x + wrapW * 0.18} ${frontY + 30} Z`}
        fill={paper}
      />
      <path
        className="bouquet-shape"
        d={`M${TIE.x - 6} ${TIE.y + 6} L${C.x + wrapW + 4} ${frontY - 8} L${C.x - wrapW * 0.12} ${frontY + 38} Z`}
        fill={mix(paper, PLUM, 0.08)}
      />
      {/* Хоёр хавтас дээр зөөлөн гэрэл-сүүдэр — хавтгай өнгө биш, цаас мэт */}
      <path
        d={`M${TIE.x + 6} ${TIE.y + 6} L${C.x - wrapW - 4} ${frontY} L${C.x + wrapW * 0.18} ${frontY + 30} Z`}
        fill="url(#paper-light)"
      />
      <path
        d={`M${TIE.x - 6} ${TIE.y + 6} L${C.x + wrapW + 4} ${frontY - 8} L${C.x - wrapW * 0.12} ${frontY + 38} Z`}
        fill="url(#paper-light)"
      />
      <path
        className="bouquet-shape"
        d={`M${TIE.x - 6} ${TIE.y + 6} L${C.x - wrapW * 0.12} ${frontY + 38}`}
        stroke={mix(paper, WHITE, 0.35)}
        strokeOpacity={0.5}
        strokeWidth={1}
      />

      <Bow color={ribbon} />

      {message && <Card text={message} />}
    </svg>
  );
}

/* ───────────── Бодит зурган толгой ───────────── */

/** Сонгосон өнгөнд хамгийн ойр тайралт; ойр нь олон бол иш бүрт ээлжилнэ (байгалийн ялгаа) */
function pickPhoto(flower: BuilderFlower, hex: string, seed: number): Photo | null {
  const crops = (flowerHeads[flower.slug] ?? []).filter((c) => flower.photos[c.image]);
  if (crops.length === 0) return null;
  const scored = crops.map((crop) => ({ crop, d: colorDistance(crop.color, hex) })).sort((a, b) => a.d - b.d);
  const close = scored.filter((s) => s.d < Math.max(scored[0].d * 1.25, 60));
  const { crop, d } = close[Math.floor(seed * close.length) % close.length];
  const p = flower.photos[crop.image];
  const href = isUnsplash(p.src) ? unsplashLoader({ src: p.src, width: 800, quality: 75 }) : p.src;
  // Зураг дахь цэцгийн өнгө сонгосон өнгөнөөс хол бол — тухайн өнгөөр duotone (хэлбэр, бүтэц нь бодит)
  return { href, width: p.width, height: p.height, crop, tint: d > 95 ? hex : null };
}

function PhotoHead({ head: h, photo }: { head: Head; photo: Photo }) {
  const R = h.r;
  const imgW = R / photo.crop.r;
  const imgH = (imgW * photo.height) / photo.width;
  const id = `head-${h.key.replace(/[^a-z0-9]/gi, "-")}`;
  return (
    <g transform={`rotate(${(h.seed - 0.5) * 50})`}>
      <mask id={id}>
        <circle r={R} fill="url(#head-feather)" />
      </mask>
      <image
        href={photo.href}
        x={-photo.crop.cx * imgW}
        y={-photo.crop.cy * imgH}
        width={imgW}
        height={imgH}
        preserveAspectRatio="none"
        mask={`url(#${id})`}
        filter={photo.tint ? `url(#tint-${photo.tint.slice(1)})` : undefined}
      />
      <circle r={R} fill="url(#head-shade)" />
    </g>
  );
}

/** Gradient map: зургийн гэрэлтэлт → сонгосон өнгөний бараан..цайвар (бодит бүтэц хадгалагдана) */
function TintFilter({ hex }: { hex: string }) {
  const [r, g, b] = rgb(hex);
  const table = (c: number) => [c * 0.18, c * 0.62, c, c + (1 - c) * 0.7].map((v) => v.toFixed(3)).join(" ");
  return (
    <filter id={`tint-${hex.slice(1)}`} colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={table(r)} />
        <feFuncG type="table" tableValues={table(g)} />
        <feFuncB type="table" tableValues={table(b)} />
      </feComponentTransfer>
    </filter>
  );
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

/** Хүний нүдний мэдрэмжид ойр (жинтэй RGB) өнгөний зай, 0–~440 */
function colorDistance(a: string, b: string) {
  const [r1, g1, b1] = rgb(a).map((v) => v * 255);
  const [r2, g2, b2] = rgb(b).map((v) => v * 255);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2) / 3;
}

/* ───────────── Байрлал ───────────── */

function layout(list: Head[]) {
  if (list.length === 0) return { placed: [] as Placed[], k: 1, halfW: 0, halfH: 0 };
  // Том толгой голд, жижиг нь захад; ижил хэмжээтэйд тогтвортой эрэмбэ (key)
  const sorted = [...list].sort((a, b) => b.r - a.r || a.key.localeCompare(b.key));
  const meanR = Math.sqrt(sorted.reduce((s, h) => s + h.r * h.r, 0) / sorted.length);
  const step = meanR * 0.94;
  const raw = sorted.map((h, i) => {
    const radius = step * Math.sqrt(i + 0.4);
    const theta = i * GOLDEN + 0.6;
    return {
      ...h,
      x: Math.cos(theta) * radius * 1.1 + (h.seed - 0.5) * 4,
      y: Math.sin(theta) * radius * 0.72 + (h.seed - 0.5) * 4,
    };
  });
  const maxX = Math.max(...raw.map((h) => Math.abs(h.x) + h.r));
  const maxY = Math.max(...raw.map((h) => Math.abs(h.y) + h.r));
  // Цаасан дотор багтана — олон иштэй үед бүхэлдээ жижгэрнэ
  const k = Math.min(1.7, 138 / maxX, 108 / maxY);
  return {
    placed: raw.map((h) => ({ ...h, x: h.x * k, y: h.y * k })),
    k,
    halfW: maxX * k,
    halfH: maxY * k,
  };
}

function backPaper(halfW: number, top: number) {
  const left = C.x - halfW;
  const right = C.x + halfW;
  const waves = 5;
  let d = `M${TIE.x - 14} ${TIE.y} L${left} ${top + 34} `;
  for (let i = 0; i < waves; i++) {
    const x0 = left + ((right - left) * i) / waves;
    const x1 = left + ((right - left) * (i + 1)) / waves;
    // Хоёр захаас голруу өргөгдсөн долгионтой ирмэг
    const lift = Math.sin(((i + 0.5) / waves) * Math.PI) * 34;
    d += `Q${(x0 + x1) / 2} ${top - lift - 10} ${x1} ${top + 34 - Math.sin(((i + 1) / waves) * Math.PI) * 34} `;
  }
  return `${d}L${TIE.x + 14} ${TIE.y} Z`;
}

/* ───────────── Цэцгийн толгой ───────────── */

function head(h: Head): ReactNode {
  const { shape, center, fine } = heads[h.slug];
  const r = h.r;
  const c = h.hex;
  const rot = h.seed * 360;
  switch (shape) {
    case "rosette":
      return (
        <g transform={`rotate(${rot})`}>
          <circle r={r} fill={mix(c, PLUM, 0.35)} />
          {ring(5, (i) => (
            <ellipse key={i} cy={-r * 0.52} rx={r * 0.52} ry={r * 0.46} fill={c} transform={`rotate(${i * 72})`} />
          ))}
          <circle r={r * 0.6} fill={mix(c, PLUM, 0.14)} />
          {ring(4, (i) => (
            <ellipse
              key={i}
              cy={-r * 0.28}
              rx={r * 0.3}
              ry={r * 0.26}
              fill={mix(c, WHITE, 0.16)}
              transform={`rotate(${i * 90 + 40})`}
            />
          ))}
          <circle r={r * 0.17} fill={mix(c, PLUM, 0.4)} />
        </g>
      );
    case "cup":
      return (
        <g transform={`rotate(${(h.seed - 0.5) * 30})`}>
          <ellipse cx={-r * 0.34} rx={r * 0.48} ry={r * 0.82} fill={mix(c, PLUM, 0.28)} transform="rotate(-14)" />
          <ellipse cx={r * 0.34} rx={r * 0.48} ry={r * 0.82} fill={mix(c, PLUM, 0.18)} transform="rotate(14)" />
          <ellipse cy={r * 0.06} rx={r * 0.5} ry={r * 0.86} fill={c} />
          <ellipse cx={-r * 0.14} cy={-r * 0.3} rx={r * 0.12} ry={r * 0.36} fill={mix(c, WHITE, 0.3)} opacity={0.6} />
        </g>
      );
    case "star": {
      const w = r * (fine ? 0.42 : 0.3);
      const petal = `M0 0 C${w} ${-r * 0.35} ${w * 0.8} ${-r * 0.8} 0 ${-r} C${-w * 0.8} ${-r * 0.8} ${-w} ${-r * 0.35} 0 0Z`;
      return (
        <g transform={`rotate(${rot})`}>
          {ring(6, (i) => (
            <path key={i} d={petal} fill={i % 2 ? mix(c, PLUM, 0.12) : c} transform={`rotate(${i * 60 + 30})`} />
          ))}
          <circle r={r * 0.2} fill={mix(c, WHITE, 0.4)} />
          {ring(6, (i) => (
            <g key={i} transform={`rotate(${i * 60})`}>
              <line y2={-r * 0.48} stroke={mix(c, WHITE, 0.5)} strokeWidth={0.8} />
              <ellipse cy={-r * 0.5} rx={1.6} ry={2.6} fill="#8A4B2A" />
            </g>
          ))}
        </g>
      );
    }
    case "daisy":
      return (
        <g transform={`rotate(${rot})`}>
          {ring(16, (i) => (
            <ellipse
              key={`b${i}`}
              cy={-r * 0.6}
              rx={r * 0.14}
              ry={r * 0.4}
              fill={mix(c, PLUM, 0.2)}
              transform={`rotate(${i * 22.5 + 11})`}
            />
          ))}
          {ring(16, (i) => (
            <ellipse key={i} cy={-r * 0.58} rx={r * 0.13} ry={r * 0.38} fill={c} transform={`rotate(${i * 22.5})`} />
          ))}
          <circle r={r * 0.36} fill={center ?? mix(c, PLUM, 0.25)} />
          <circle r={r * 0.22} fill={mix(center ?? c, WHITE, 0.12)} opacity={0.6} />
        </g>
      );
    case "cluster": {
      const n = fine ? 26 : 14;
      const fr = r * (fine ? 0.11 : 0.22);
      return (
        <g>
          {!fine && <circle r={r * 0.9} fill={mix(c, PLUM, 0.3)} />}
          {Array.from({ length: n }, (_, i) => {
            const rad = (r - fr) * Math.sqrt((i + 0.5) / n);
            const a = i * GOLDEN + h.seed * 6;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * rad} ${Math.sin(a) * rad})`}>
                <circle r={fr} fill={i % 3 ? c : mix(c, WHITE, 0.2)} />
                {!fine && <circle r={fr * 0.28} fill={mix(c, PLUM, 0.35)} />}
              </g>
            );
          })}
        </g>
      );
    }
    case "spike":
      return (
        <g transform={`rotate(${(h.seed - 0.5) * 40})`}>
          <line y1={r * 0.6} y2={-r * 1.5} stroke={STEM} strokeWidth={1.2} />
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx={(i % 2 ? 1 : -1) * r * 0.1}
              cy={r * 0.4 - i * r * 0.26}
              rx={r * (0.24 - i * 0.015)}
              ry={r * 0.16}
              fill={i % 2 ? c : mix(c, PLUM, 0.18)}
            />
          ))}
        </g>
      );
    case "cone":
      return (
        <g transform={`rotate(${(h.seed - 0.5) * 50})`}>
          <path
            d={`M${-r * 0.4} ${r * 0.7} C${-r * 0.5} 0 ${-r * 0.75} ${-r * 0.5} ${-r * 0.1} ${-r} C${r * 0.45} ${-r * 0.95} ${r * 0.85} ${-r * 0.6} ${r * 0.62} ${-r * 0.28} C${r * 0.3} 0 ${r * 0.38} ${r * 0.4} ${r * 0.42} ${r * 0.7} Z`}
            fill={c}
          />
          <ellipse cx={r * 0.12} cy={-r * 0.48} rx={r * 0.34} ry={r * 0.22} fill={mix(c, PLUM, 0.3)} transform="rotate(-20)" />
          <line x1={r * 0.05} y1={-r * 0.1} x2={r * 0.16} y2={-r * 0.55} stroke="#E8C547" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      );
    case "orchid":
      return (
        <g transform={`rotate(${(h.seed - 0.5) * 30})`}>
          <ellipse cy={-r * 0.55} rx={r * 0.3} ry={r * 0.45} fill={mix(c, PLUM, 0.08)} />
          <ellipse cx={-r * 0.35} cy={r * 0.4} rx={r * 0.24} ry={r * 0.42} fill={mix(c, PLUM, 0.12)} transform="rotate(30)" />
          <ellipse cx={r * 0.35} cy={r * 0.4} rx={r * 0.24} ry={r * 0.42} fill={mix(c, PLUM, 0.12)} transform="rotate(-30)" />
          <ellipse cx={-r * 0.48} rx={r * 0.5} ry={r * 0.42} fill={c} />
          <ellipse cx={r * 0.48} rx={r * 0.5} ry={r * 0.42} fill={c} />
          <ellipse cy={r * 0.3} rx={r * 0.2} ry={r * 0.24} fill={mix(c, "#7A1F3D", 0.45)} />
          <circle cy={-r * 0.04} r={r * 0.1} fill="#F2D06B" />
        </g>
      );
  }
}

/* ───────────── Ногоон навч ───────────── */

const leaf = (l: number, w: number) => `M0 0 Q${l / 2} ${-w} ${l} 0 Q${l / 2} ${w} 0 0Z`;

function sprig(g: Greenery, length: number, seed: number): ReactNode {
  const dark = mix(g.hex, PLUM, 0.25);
  switch (g.shape) {
    case "coin":
      return (
        <g>
          <line x2={length} stroke={dark} strokeWidth={1.2} />
          {Array.from({ length: 6 }, (_, i) => (
            <circle
              key={i}
              cx={length * (0.25 + i * 0.13)}
              cy={(i % 2 ? 1 : -1) * 6}
              r={7 - i * 0.5}
              fill={i % 2 ? g.hex : mix(g.hex, WHITE, 0.12)}
            />
          ))}
        </g>
      );
    case "blade":
      return (
        <g>
          <line x2={length} stroke={dark} strokeWidth={1} />
          {Array.from({ length: 4 }, (_, i) => (
            <path
              key={i}
              d={leaf(18, 5)}
              fill={i % 2 ? g.hex : dark}
              transform={`translate(${length * (0.3 + i * 0.18)} 0) rotate(${(i % 2 ? 1 : -1) * 28})`}
            />
          ))}
        </g>
      );
    case "frond":
      return (
        <g>
          <line x2={length} stroke={dark} strokeWidth={1} />
          {Array.from({ length: 9 }, (_, i) => {
            const t = 0.12 + i * 0.1;
            const size = 9 * (1 - t * 0.55);
            return (
              <g key={i} transform={`translate(${length * t} 0)`}>
                <path d={leaf(size, 2.4)} fill={g.hex} transform="rotate(-55)" />
                <path d={leaf(size, 2.4)} fill={dark} transform="rotate(55)" />
              </g>
            );
          })}
        </g>
      );
    case "cluster":
      return (
        <g>
          {[-26, 0, 24].map((a, i) => (
            <path
              key={a}
              d={leaf(length * (0.72 + ((seed * 3 + i) % 1) * 0.12), 9)}
              fill={i === 1 ? g.hex : dark}
              transform={`rotate(${a})`}
            />
          ))}
        </g>
      );
  }
}

/* ───────────── Тууз, карт ───────────── */

function Bow({ color }: { color: string }) {
  const { x, y } = TIE;
  const shade = mix(color, PLUM, 0.25);
  return (
    <g className="bouquet-shape" transform={`translate(${x} ${y}) scale(1.45) translate(${-x} ${-y})`}>
      <path d={`M${x - 3} ${y} L${x - 20} ${y + 64} L${x - 10} ${y + 59} L${x + 2} ${y + 4} Z`} fill={shade} />
      <path d={`M${x + 3} ${y} L${x + 24} ${y + 58} L${x + 13} ${y + 56} L${x - 1} ${y + 4} Z`} fill={color} />
      <path d={`M${x} ${y} C${x - 32} ${y - 26} ${x - 50} ${y + 6} ${x} ${y}Z`} fill={color} stroke={shade} strokeWidth={0.8} />
      <path d={`M${x} ${y} C${x + 32} ${y - 26} ${x + 50} ${y + 6} ${x} ${y}Z`} fill={color} stroke={shade} strokeWidth={0.8} />
      <rect x={x - 26} y={y - 3} width={52} height={6} fill={shade} opacity={0.55} />
      <ellipse cx={x} cy={y} rx={6.5} ry={7.5} fill={shade} />
    </g>
  );
}

const CARD = { x: 248, y: 404, w: 128, h: 78 };

function Card({ text }: { text: string }) {
  const lines = wrap(text, 22, 4);
  return (
    <g className="bouquet-pop">
      <line x1={TIE.x + 4} y1={TIE.y + 2} x2={CARD.x + 14} y2={CARD.y + 6} stroke="#C9A87C" strokeWidth={0.8} />
      <g transform={`rotate(-5 ${CARD.x} ${CARD.y})`}>
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} fill="#F8F3EC" stroke="#C9A87C" strokeWidth={0.6} />
        <circle cx={CARD.x + 14} cy={CARD.y + 8} r={2.2} fill="none" stroke="#C9A87C" strokeWidth={0.8} />
        {lines.map((line, i) => (
          <text
            key={i}
            x={CARD.x + 12}
            y={CARD.y + 26 + i * 14}
            fill={PLUM}
            fontSize={12}
            fontStyle="italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
}

/** Үгээр мөр таслана; хэтэрвэл сүүлийн мөрийг «…»-ээр төгсгөнө */
function wrap(text: string, width: number, max: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) current = next;
    else {
      if (current) lines.push(current);
      current = word.length > width ? `${word.slice(0, width - 1)}…` : word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > max) {
    const kept = lines.slice(0, max);
    kept[max - 1] = `${kept[max - 1].slice(0, width - 1)}…`;
    return kept;
  }
  return lines;
}

/* ───────────── Туслах ───────────── */

const ring = (n: number, fn: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => fn(i));

/** 0…1 тогтвортой псевдо-санамсаргүй тоо — ижил key-д ижил хэлбэр */
function hash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}
