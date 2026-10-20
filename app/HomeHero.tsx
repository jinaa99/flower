"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DepthPhoto } from "@/components/ui/DepthPhoto";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { ProductCard } from "@/components/ui/ProductCard";
import type { StoryBeat } from "@/data/journey";
import type { JourneyFlower } from "@/lib/data";
import { smoothScroll } from "@/lib/scrollMotion";
import { cn } from "@/lib/utils";
import { HomeStatic } from "./HomeStatic";

gsap.registerPlugin(ScrollTrigger);

/** Нэг цэцгийн хэсэгт ногдох scroll-ийн урт */
const STAGE_VH = 280;
/** Дараагийн цэцэг рүү шилжих (дугуй нээлт) хугацаа — хэсгийн төгсгөлд */
const T = 0.16;
/** Хэсэг доторх үе: гарчгууд [0, BEATS_END), карт [CARD_START, CARD_END) */
const BEATS_END = 0.52;
const CARD_START = 0.56;
const CARD_END = 0.8;
const FADE = 0.05;

type Props = { stops: JourneyFlower[] };

/**
 * Нүүр: бодит гэрэл зургийн аялал (motion-reduce болон JS-гүй үед HomeStatic — CSS-ээр).
 */
export function HomeHero({ stops }: Props) {
  return (
    <>
      <PhotoJourney stops={stops} />
      <HomeStatic stops={stops} forced={false} className="hidden motion-reduce:block" />
    </>
  );
}

/**
 * Цэцэг бүр нэг «бүлэг»: баруун талд 2.5D (depth parallax) бодит зураг — өөрийн өнгөний дэвсгэрт
 * зөөлөн уусна, дээр нь жижиг дэлгэрэнгүй зураг (сэтгүүлийн хуудас мэт давхарга), зүүн талд
 * гарчгууд, төгсгөлд нь бүтээгдэхүүний карт. Дараагийн цэцэг цэцгийн төвөөс дугуйгаар «дэлгэрч»
 * нээгдэнэ. Бүх зүйл нэг scrub timeline-д — буцаж гүйлгэхэд урвуу явна.
 */
function PhotoJourney({ stops }: Props) {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const [stage, setStage] = useState(0);
  const n = stops.length;
  const total = n - T;
  // Бүлэг бүрийн 2.5D камер (−1..1) — scroll timeline tween хийж, DepthPhoto кадр бүр уншина
  const drives = useMemo(() => stops.map(() => ({ x: 0, y: 0 })), [stops]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    // Аялал дэлгэц дүүргэж байх үед header тунгалаг (Header: in-data-immersive)
    const immersive = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom 20%",
      onToggle: (self) => document.documentElement.toggleAttribute("data-immersive", self.isActive),
    });

    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", portrait: "(orientation: portrait)" },
      (ctx) => {
        if (!ctx.conditions?.motion) return;
        const q = gsap.utils.selector(el);
        const origin = ctx.conditions.portrait ? "50% 34%" : "68% 50%";

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              const s = Math.min(Math.floor(self.progress * total + T * 0.5), n - 1);
              markStep(steps.current, s);
              setStage((prev) => (prev === s ? prev : s));
            },
          },
        });
        tl.to(q("[data-scroll-hint]"), { autoAlpha: 0, y: 12, duration: 0.03 }, 0);

        for (let i = 0; i < n; i++) {
          // Хугацаа аяллын уртаас хэтрэхгүй — хэтэрвэл scrub-ийн progress бүхэлдээ сунана
          const start = i === 0 ? 0 : i - T;
          const end = Math.min(i + 1, total);
          const last = i === n - 1;
          const photo = q(`[data-photo="${i}"]`);

          // ── Зураг: орж ирэх → амьсгалах → «нэвтэрч» гарах ──
          if (i > 0) {
            tl.fromTo(
              photo,
              { scale: 1.3, xPercent: 7, filter: "blur(10px) brightness(1.15)" },
              { scale: 1.1, xPercent: 0, filter: "blur(0px) brightness(1)", duration: T, ease: "power2.out" },
              i - T,
            );
          }
          const breatheEnd = last ? end : i + 1 - T;
          tl.fromTo(photo, { scale: 1.1 }, { scale: 1, duration: breatheEnd - i, immediateRender: i === 0 }, i);
          if (!last) {
            // filter-ийн эхлэлийг заавал заана: «none»-оос tween хийвэл brightness 0-ээс эхэлж зураг харлана
            tl.fromTo(
              photo,
              { scale: 1, filter: "blur(0px) brightness(1)" },
              { scale: 1.24, filter: "blur(8px) brightness(0.55)", duration: T, ease: "power2.in", immediateRender: false },
              i + 1 - T,
            );
          }

          // ── 2.5D камер: scroll-оор гүнийн дагуу зүүнээс баруун тийш эргэлдэнэ ──
          tl.fromTo(drives[i], { x: -0.9, y: 0.35 }, { x: 0.9, y: -0.35, duration: end - start }, start);

          // ── Давхаргын гүн: арын том дугаар ба жижиг зураг эсрэг чиглэлд, өөр хурдаар ──
          tl.fromTo(q(`[data-num="${i}"]`), { yPercent: 35 }, { yPercent: -35, duration: end - start }, start);
          const detail = q(`[data-detail="${i}"]`);
          tl.fromTo(detail, { yPercent: 30, rotate: -5 }, { yPercent: -30, rotate: 3, duration: end - start }, start);
          tl.fromTo(
            detail,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.12, ease: "power3.out" },
            i + 0.04,
          );

          // Дараагийн бүлэг: цэцгийн төвөөс дугуйгаар дэлгэрнэ
          if (i > 0) {
            tl.fromTo(
              q(`[data-layer="${i}"]`),
              { clipPath: `circle(0% at ${origin})` },
              { clipPath: `circle(150% at ${origin})`, duration: T, ease: "power2.inOut" },
              i - T,
            );
            // Эхэндээ жижиг дугуй «цэг» мэт харагдахгүй — нээлтийн эхний хэсэгт тодорно
            tl.fromTo(q(`[data-layer="${i}"]`), { opacity: 0 }, { opacity: 1, duration: T * 0.4 }, i - T);
          }

          // ── Гарчиг: үг бүр мөрийн доороос маскаар ээлжлэн гарч, дээшээ алга болно ──
          const beats = q(`[data-beat][data-stage="${i}"]`);
          const len = BEATS_END / beats.length;
          beats.forEach((beat, j) => {
            const words = beat.querySelectorAll("[data-word]");
            const rest = beat.querySelectorAll("[data-fade]");
            const inAt = j === 0 ? i - FADE : i + j * len;
            const outAt = i + (j + 1) * len - FADE * 1.4;
            if (i > 0 || j > 0) {
              tl.set(beat, { autoAlpha: 1 }, inAt);
              tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: FADE * 1.6, stagger: 0.008, ease: "power3.out" }, inAt);
              tl.fromTo(rest, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: FADE, stagger: 0.012 }, inAt + 0.025);
            }
            tl.fromTo(words, { yPercent: 0 }, { yPercent: -115, duration: FADE * 1.2, stagger: 0.006, ease: "power2.in", immediateRender: false }, outAt);
            tl.fromTo(rest, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: FADE, immediateRender: false }, outAt);
            tl.set(beat, { autoAlpha: 0 }, outAt + FADE * 1.5);
          });

          // ── Бүтээгдэхүүний карт: доороос маскаар ──
          const card = q(`[data-card][data-stage="${i}"]`);
          tl.fromTo(
            card,
            { autoAlpha: 0, y: 50, clipPath: "inset(0% 0% 100% 0%)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.07, ease: "power3.out" },
            i + CARD_START,
          );
          if (!last) tl.to(card, { autoAlpha: 0, y: -40, duration: FADE }, i + CARD_END);
        }

        // Анх ачаалахад (хуудасны дээд хэсэгт) — гарчиг үг үгээрээ, зураг гэрлээс тодорно. Нэг удаа.
        if (window.scrollY < 40) {
          gsap.from(q('[data-stage="0"][data-beat] [data-word]'), { yPercent: 115, duration: 1.3, stagger: 0.07, ease: "power3.out", delay: 0.15 });
          gsap.from(q('[data-stage="0"][data-beat] [data-fade]'), { autoAlpha: 0, y: 18, duration: 1, stagger: 0.1, delay: 0.6 });
          gsap.fromTo(
            q('[data-photo="0"]'),
            { opacity: 0, filter: "blur(14px) brightness(1.3)" },
            { opacity: 1, filter: "blur(0px) brightness(1)", duration: 1.8, ease: "power2.out", clearProps: "opacity,filter" },
          );
        }
        tl.set({}, {}, total);
        markStep(steps.current, 0);
      },
    );

    return () => {
      immersive.kill();
      document.documentElement.removeAttribute("data-immersive");
      mm.revert();
    };
  }, [n, total, drives]);

  // Цайвар бүлэг дээр header бараан бэхээр (globals.css: data-hero-tone)
  const tone = stops[stage]?.tone ?? "dark";
  useEffect(() => {
    document.documentElement.dataset.heroTone = tone;
    return () => {
      delete document.documentElement.dataset.heroTone;
    };
  }, [tone]);

  /** Аяллын P цэг рүү зөөлөн гүйлгэнэ (шатны индикатор) */
  const jumpTo = useCallback(
    (P: number) => {
      const el = section.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      smoothScroll.to(top + (P / total) * (el.offsetHeight - window.innerHeight));
    },
    [total],
  );

  return (
    <div data-home="journey" className="motion-reduce:hidden">
      <section
        ref={section}
        data-total={total}
        className="relative h-(--journey-height)"
        style={{ "--journey-height": `${n * STAGE_VH}vh` } as CSSProperties}
        aria-label="Цэцгийн аялал"
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          {stops.map((stop, i) => (
            <Chapter key={stop.flower.slug} stop={stop} index={i} count={n} active={Math.abs(stage - i) <= 1} drive={drives[i]} />
          ))}

          {/* Доод голд намуухан «гүйлгэ» заалт */}
          <div
            data-scroll-hint
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.68rem] tracking-[0.12em] text-ivory/50 sm:flex"
          >
            Гүйлгэх
            <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-ivory/70" />
            </span>
          </div>

          {/* Бүлгийн индикатор: 01 Цээнэ 02 03 04 — дарвал тухайн цэцэг рүү */}
          <nav
            aria-label="Цэцгийн аялал"
            className={cn(
              "absolute right-4 bottom-8 z-20 transition-colors duration-700 sm:right-8 lg:right-10",
              stops[stage]?.tone === "light" ? "text-plum-950" : "text-ivory",
            )}
          >
            <ol ref={steps} className="flex gap-5 text-[0.72rem] tracking-[0.08em] tabular-nums">
              {stops.map(({ flower }, i) => (
                <li key={flower.slug}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i === 0 ? 0 : i + 0.02)}
                    aria-label={`${pad(i + 1)} — ${flower.nameMn}`}
                    className="group relative flex items-baseline gap-2 pb-2.5 opacity-40 transition-opacity duration-500 hover:opacity-80 data-active:opacity-100"
                  >
                    {pad(i + 1)}
                    <span aria-hidden className="hidden font-display text-[0.95rem] italic group-data-active:inline">
                      {flower.nameMn}
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-700 ease-bloom group-data-active:scale-x-100"
                    />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>
    </div>
  );
}

/**
 * Нэг бүлэг (бүтэн дэлгэцийн давхарга): дэвсгэр нь зургийн өөрийн өнгө — зураг ирмэгээрээ уусч
 * «зүйдэл» харагдахгүй. Хэвтээ дэлгэцэнд зураг баруун 64%, босоо дэлгэцэнд дээд 64%.
 */
function Chapter({
  stop,
  index,
  count,
  active,
  drive,
}: {
  stop: JourneyFlower;
  index: number;
  count: number;
  active: boolean;
  drive: { x: number; y: number };
}) {
  const { flower, story, hero, detail, tone, cover } = stop;
  const light = tone === "light";
  return (
    <div
      data-layer={index}
      data-tone={tone}
      className={cn("absolute inset-0", light ? "text-plum-950" : "text-ivory")}
      style={{
        zIndex: index + 1,
        // Бараан бүлэг: бараг хар — зургийн хар дэвсгэр рүү «зүйдэлгүй» уусна. Цайвар: зургийн өнгө.
        backgroundColor: light ? hero.color : "#0b0608",
        // Server HTML-д ч дараагийн бүлгүүд хаалттай (JS ачаалахаас өмнө анивчихгүй)
        clipPath: index > 0 ? "circle(0% at 68% 50%)" : undefined,
      }}
    >
      <div
        className="absolute portrait:inset-x-0 portrait:top-0 portrait:h-[64%] landscape:inset-y-0 landscape:right-0 landscape:w-[64%] portrait:[mask-image:linear-gradient(to_bottom,black_70%,transparent)] landscape:[mask-image:linear-gradient(to_right,transparent,black_36%)]"
      >
        <div data-photo={index} className="absolute inset-0 will-change-transform">
          {hero.depth ? (
            <DepthPhoto
              src={hero.src}
              depth={hero.depth}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              color={hero.color}
              sizes="(orientation: portrait) 100vw, 64vw"
              priority={index === 0}
              strength={0.04}
              paused={!active}
              drive={drive}
              className="size-full"
            />
          ) : (
            <FlowerPhoto src={hero.src} alt={hero.alt} fill sizes="(orientation: portrait) 100vw, 64vw" priority={index === 0} className="object-cover" />
          )}
        </div>
      </div>

      {/* Арын том serif дугаар — scroll-оор эсрэг чиглэлд хөдөлж гүн өгнө */}
      <span
        data-num={index}
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-[4vw] -left-[1vw] font-display text-[42vw] leading-none font-extralight select-none landscape:text-[24vw]",
          light ? "text-plum-950/[0.07]" : "text-ivory/[0.045]",
        )}
      >
        {pad(index + 1)}
      </span>

      {/* Сэтгүүлийн давхарга: ижил цэцгийн өөр өнцгийн жижиг зураг, өөр хурдаар хөдөлнө */}
      {detail && (
        <figure
          data-detail={index}
          className="absolute right-[7%] bottom-[16%] hidden w-[clamp(9rem,12vw,12.5rem)] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.7)] landscape:lg:block"
        >
          <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: detail.color }}>
            <FlowerPhoto src={detail.src} alt="" fill sizes="13vw" className="object-cover" />
          </div>
          <figcaption className={cn("mt-2.5 font-display text-sm italic", light ? "text-plum-950/60" : "text-ivory/60")}>
            {flower.latinName}
          </figcaption>
        </figure>
      )}

      {/* Unsplash attribution — зураг харагдах газар бүрт */}
      <PhotoCredit
        image={hero}
        className={cn(
          "absolute bottom-8 left-4 z-10 hidden text-[0.62rem] sm:left-8 landscape:block",
          light && "text-plum-950/50! [&_a]:text-plum-950/70!",
        )}
      />

      <div className="relative mx-auto grid h-full w-full max-w-7xl px-4 pt-(--header-height) sm:px-8 portrait:items-end portrait:pb-24 landscape:items-center">
        {story.map((beat, j) => (
          <Fragment key={j}>
            <Beat stage={index} beat={beat} first={index === 0 && j === 0} light={light} />
          </Fragment>
        ))}
        <ProductCard
          flower={flower}
          stage={index}
          count={count}
          cover={hero.photographer ? hero : cover}
          data-card
          data-stage={index}
          className="invisible opacity-0 [grid-area:1/1] portrait:self-end landscape:max-w-sm"
        />
      </div>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Идэвхтэй бүлгийн товчинд data-active (scroll бүрт re-render хийхгүй) */
function markStep(list: HTMLOListElement | null, stage: number) {
  list?.querySelectorAll("button").forEach((b, i) => {
    b.toggleAttribute("data-active", i === stage);
    if (i === stage) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
}

const titleClass =
  "font-display text-[2.75rem] leading-[1.02] font-extralight tracking-[-0.01em] text-balance sm:text-7xl lg:text-[5.4rem]";

function Beat({ stage, beat, first, light }: { stage: number; beat: StoryBeat; first: boolean; light: boolean }) {
  const [before, em, after] = beat.title;
  const Heading = first ? "h1" : "h2";
  return (
    <div
      data-beat
      data-stage={stage}
      className={cn("max-w-2xl [grid-area:1/1] landscape:max-w-[34rem]", !first && "invisible")}
    >
      <p data-fade className={cn("eyebrow mb-8", light && "text-gold-deep! before:bg-gold-deep/50!")}>
        {beat.eyebrow}
      </p>
      <Heading className={titleClass}>
        <Words text={before} />
        <em className={cn("font-light", light ? "text-rose-ink" : "text-blush-100")}>
          <Words text={em} />
        </em>
        <Words text={after} />
      </Heading>
      <p data-fade className={cn("mt-7 max-w-sm text-[1.05rem] leading-relaxed", light ? "text-plum-950/70" : "text-ivory/70")}>
        {beat.body}
      </p>
      {first && (
        <div data-fade className="mt-11">
          <Link href="/catalog" className="btn-primary">
            Цуглуулга үзэх <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Үг бүрийг маск (overflow-hidden) дотор — GSAP мөрийн доороос дээш гаргана. Кирилл үсгийн
 * доод сүүл (ц, щ, у) таслагдахгүйн тулд доор нь зай үлдээнэ.
 */
function Words({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, i) =>
    /^\s+$/.test(part) || part === "" ? (
      part
    ) : (
      <span key={i} className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-top">
        <span data-word className="inline-block will-change-transform">
          {part}
        </span>
      </span>
    ),
  );
}
