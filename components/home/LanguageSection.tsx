import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

const parts: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Дэлбээ",
    body: "Зөөлөн, эелдэг — сэтгэлийн үгийг дуугүйгээр илэрхийлнэ.",
    icon: <path d="M12 21c-4.5-3-6.5-7.6-5-12.5C11.6 9.6 14.2 13 12 21Zm0 0c1-4.8 3.6-8.6 7.4-10.6.6 4.5-1.8 8.5-7.4 10.6Z" />,
  },
  {
    title: "Тоост",
    body: "Цэцгийн зүрх — амьдралыг үргэлжлүүлэх эх үүсвэр.",
    icon: (
      <>
        <path d="M12 21v-9M12 12c-1.8-2.2-3.8-3.2-6-3.4M12 12c1.8-2.2 3.8-3.2 6-3.4M12 12V5" />
        <circle cx="5.6" cy="8" r="1.4" />
        <circle cx="18.4" cy="8" r="1.4" />
        <circle cx="12" cy="3.8" r="1.4" />
      </>
    ),
  },
  {
    title: "Тоосонцор",
    body: "Шинэ эхлэл, сэргэлт, амьдралын мөнхийн эргэлтийн бэлгэдэл.",
    icon: (
      <>
        <circle cx="12" cy="12" r="2.2" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle
            key={a}
            cx={12 + Math.cos((a * Math.PI) / 180) * 6.5}
            cy={12 + Math.sin((a * Math.PI) / 180) * 6.5}
            r="1.1"
          />
        ))}
      </>
    ),
  },
];

/** «Цэцгийн хэл»: зүүн талд гарчиг, төвд задалсан цэцгийн гэрэлтэх дүрслэл, баруун талд бүтэц */
export function LanguageSection() {
  return (
    <section id="language" className="relative scroll-mt-(--header-height) overflow-hidden py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_55%,rgb(217_87_126/0.16),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-[1fr_1.15fr_0.85fr] lg:gap-10">
        <SectionHeading
          eyebrow="Цэцгийн хэл"
          title={["Цэцэг бүр ", "түүхтэй", ""]}
          body="Хайр, талархлаас эхлээд шинэ эхлэл хүртэл — цэцэг бүр өөрийн гэсэн утга агуулдаг."
        >
          <Link href="/catalog" className="btn-ghost mt-10">
            Утга бэлгэдлийг нээх <span aria-hidden>→</span>
          </Link>
        </SectionHeading>

        <ExplodedFlower />

        <ul className="space-y-10">
          {parts.map((p) => (
            <li key={p.title} className="flex gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-blush-300/25 bg-plum-800/30 text-blush-100 shadow-glow">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  {p.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-3xl font-light">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/55">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Нэг дэлбээний хэлбэр (ёроол нь 0,0, урт нь +x) */
const PETAL = "M0 0C30-34 110-52 190-22 210-12 214 2 196 10 120 44 40 34 0 0Z";

/**
 * Задалсан цэцэг: дээд дэлбээ, гэрэлтэх цөмтэй дунд цэцэг, доод дэлбээ — давхарга бүр
 * өөр хурдаар хөвнө (CSS float, reduced motion-д зогсоно). Доор нь гэрлийн тойрог.
 */
function ExplodedFlower() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[5/6] w-full max-w-[30rem]">
      <svg viewBox="-260 -300 520 620" className="absolute inset-0 size-full overflow-visible">
        <defs>
          <linearGradient id="lang-petal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D9577E" stopOpacity="0.75" />
            <stop offset="0.55" stopColor="#E8B4BC" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F6DDE0" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="lang-core">
            <stop offset="0" stopColor="#FFF4D6" />
            <stop offset="0.35" stopColor="#F3C77A" stopOpacity="0.85" />
            <stop offset="1" stopColor="#D9577E" stopOpacity="0" />
          </radialGradient>
          <filter id="lang-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Гэрлийн тойрог */}
        <g transform="translate(0 210)">
          <ellipse rx="210" ry="36" fill="none" stroke="#E8B4BC" strokeOpacity="0.35" />
          <ellipse rx="150" ry="24" fill="none" stroke="#C9A87C" strokeOpacity="0.25" />
          <circle cx="-150" cy="22" r="3" fill="#F6DDE0" filter="url(#lang-glow)" />
          <circle cx="196" cy="-12" r="2.4" fill="#C9A87C" filter="url(#lang-glow)" />
        </g>

        {/* Дээд дэлбээ */}
        <g className="motion-safe:animate-float" style={{ "--float-y": "-16px" } as CSSProperties}>
          <g transform="translate(-120 -190) rotate(-14)" filter="url(#lang-glow)">
            <Petal />
          </g>
        </g>

        {/* Дунд: цэцэг + гэрэлтэх цөм + тоост */}
        <g className="motion-safe:animate-float" style={{ "--float-y": "-9px", animationDelay: "-3s" } as CSSProperties}>
          <g transform="translate(0 0) scale(1 0.42)" filter="url(#lang-glow)">
            {[0, 72, 144, 216, 288].map((a) => (
              <g key={a} transform={`rotate(${a + 18})`}>
                <Petal scale={0.92} />
              </g>
            ))}
          </g>
          <circle r="70" fill="url(#lang-core)" />
          <g stroke="#F3C77A" strokeWidth="1.2" strokeLinecap="round" filter="url(#lang-glow)">
            {Array.from({ length: 11 }, (_, i) => {
              const a = -Math.PI / 2 + (i - 5) * 0.2;
              const len = 58 + (i % 3) * 14;
              const x = Math.cos(a) * len * 0.75;
              const y = Math.sin(a) * len;
              return (
                <g key={i}>
                  <path d={`M0 0Q${x * 0.3} ${y * 0.6} ${x} ${y}`} fill="none" strokeOpacity="0.8" />
                  <ellipse cx={x} cy={y} rx="4" ry="6.5" fill="#E2925A" stroke="none" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />
                </g>
              );
            })}
          </g>
          {/* Тоосонцор */}
          {[
            [-90, -120, 2.4],
            [70, -150, 1.8],
            [130, -60, 2.2],
            [-150, -40, 1.6],
            [30, -190, 1.4],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="#FFF4D6"
              filter="url(#lang-glow)"
              className="motion-safe:animate-twinkle"
              style={{ animationDelay: `${i * -0.7}s`, transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}
        </g>

        {/* Доод дэлбээ */}
        <g className="motion-safe:animate-float" style={{ "--float-y": "-12px", animationDelay: "-5s" } as CSSProperties}>
          <g transform="translate(-40 150) rotate(-8) scale(0.85 0.6)" filter="url(#lang-glow)">
            <Petal />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Petal({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d={PETAL} fill="url(#lang-petal)" stroke="#F6DDE0" strokeOpacity="0.55" strokeWidth="1" />
      {/* Судал */}
      <g fill="none" stroke="#F6DDE0" strokeOpacity="0.28" strokeWidth="0.8">
        <path d="M6 0C60-6 120-8 192-6" />
        <path d="M10 -2C60-20 110-28 170-20" />
        <path d="M10 2C60 16 110 22 168 12" />
      </g>
    </g>
  );
}
