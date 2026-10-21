"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BloomStage, createMotion, type StageChapter } from "@/components/ui/BloomStage";
import { FlowerPhoto } from "@/components/ui/FlowerPhoto";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { ProductCard } from "@/components/ui/ProductCard";
import type { StoryBeat } from "@/data/journey";
import type { JourneyFlower } from "@/lib/data";
import { smoothScroll } from "@/lib/scrollMotion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { HomeStatic } from "./HomeStatic";

gsap.registerPlugin(ScrollTrigger);

/** Нэг цэцгийн бүлэгт ногдох scroll-ийн урт */
const STAGE_VH = 300;
/** Дараагийн цэцэг рүү шилжих (dive + дэлбээлэлт) хугацаа — бүлгийн төгсгөлд */
const T = 0.22;
/** Бүлэг доторх үе: дэлбээлэлт [0, BLOOM_END), гарчгууд [0, BEATS_END), карт [CARD_START, CARD_END) */
const BLOOM_END = 0.3;
const BEATS_END = 0.5;
const CARD_START = 0.54;
const CARD_END = 0.74;
const FADE = 0.05;

type Props = { stops: JourneyFlower[] };

/**
 * Нүүр: бодит гэрэл зургийн «амьд» аялал (BloomStage — нэг WebGL canvas). Reduced motion эсвэл
 * JS-гүй үед HomeStatic (CSS-ээр), WebGL байхгүй/алдаа гарвал JS-ээр HomeStatic руу шилжинэ.
 */
export function HomeHero({ stops }: Props) {
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  return (
    <>
      {!failed && <PhotoJourney stops={stops} onFail={onFail} />}
      <HomeStatic stops={stops} forced={failed} className={failed ? undefined : "hidden motion-reduce:block"} />
    </>
  );
}

/**
 * Цэцэг бүр нэг бүлэг: бодит зураг цэцгийн төвөөс дэлбээлж нээгдэнэ, ойрын дэлбээ салхинд найгана,
 * дэлбээ хөвнө, камер гүнийн дагуу эргэлдэнэ. Бүлгийн төгсгөлд камер цэцгийн гол руу нэвтэрч,
 * дараагийн цэцэг дээр нь дэлбээлнэ. Гарчиг үг үгээрээ гарна. Бүгд нэг scrub timeline — урвуу явна.
 */
function PhotoJourney({ stops, onFail }: Props & { onFail: () => void }) {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [active, setActive] = useState(true);
  const n = stops.length;
  const total = n - T;

  const chapters = useMemo<StageChapter[]>(
    () =>
      stops.map((s) => ({
        src: s.hero.src,
        depth: s.hero.depth ?? "",
        width: s.hero.width,
        height: s.hero.height,
        bg: s.tone === "light" ? (s.hero.color ?? "#f3e6e0") : "#0b0608",
        focus: s.focus,
      })),
    [stops],
  );
  // Бүлэг бүрийн хөдөлгөөний төлөв — GSAP шууд tween хийж, BloomStage кадр бүр уншина
  const motion = useMemo(() => stops.map((_, i) => createMotion(i === 0)), [stops]);
  const hasDepth = stops.every((s) => s.hero.depth);

  useEffect(() => {
    if (!hasDepth) onFail();
  }, [hasDepth, onFail]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    const visibility = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setActive(self.isActive),
    });
    // Аялал дэлгэц дүүргэж байх үед header тунгалаг (Header: in-data-immersive)
    const immersive = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom 20%",
      onToggle: (self) => document.documentElement.toggleAttribute("data-immersive", self.isActive),
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (self) => {
            const s = Math.min(Math.floor(self.progress * total + T * 0.5), n - 1);
            markStep(steps.current, s);
            setStage((prev) => (prev === s ? prev : s));
          },
        },
      });
      // Олдохгүй элемент (жишээ нь дэлгэрэнгүй зураггүй бүлэг) дээр tween үүсгэхгүй
      const at = (selector: string) => {
        const found = q(selector);
        return found.length ? found : null;
      };
      tl.to(q("[data-scroll-hint]"), { autoAlpha: 0, y: 12, duration: 0.03 }, 0);

      for (let i = 0; i < n; i++) {
        const m = motion[i];
        const start = i === 0 ? 0 : i - T;
        const end = Math.min(i + 1, total);
        const last = i === n - 1;

        // ── Цэцэг: дэлбээлэх → камер эргэлдэх → гол руу нэвтрэх (эхнийх нь ачаалахад дэлбээлнэ) ──
        if (i > 0) {
          tl.set(m, { visible: 1 }, i - T);
          tl.fromTo(m, { bloom: 0 }, { bloom: 1, duration: T + BLOOM_END, ease: "power1.out" }, i - T);
          // Дэлбээ ихэнх хэсгийг бүрхсэний дараа дэвсгэр бүтэн болно — доорх бүлэг алга болно
          tl.fromTo(m, { bg: 0 }, { bg: 1, duration: T * 0.5 }, i - T * 0.5);
          tl.set(motion[i - 1], { visible: 0 }, i + 0.01);
        }
        tl.fromTo(m, { panX: -0.85, panY: 0.3 }, { panX: 0.85, panY: -0.3, duration: end - start }, start);
        if (!last) {
          tl.fromTo(m, { dive: 0 }, { dive: 1, duration: T + 0.04, ease: "power2.in" }, i + 1 - T - 0.04);
          tl.fromTo(m, { petals: 0.45 }, { petals: 1, duration: T, immediateRender: false }, i + 1 - T - 0.04);
        }

        // ── Текстийн давхарга: бүлэгтэйгээ хамт ──
        const layer = q(`[data-layer="${i}"]`);
        if (i > 0) tl.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: T * 0.4 }, i - T * 0.4);
        // Дараагийн цэцэг гарч ирэхээс өмнө — өмнөх бүлгийн зураг/текст шинэ цэцэг дээр үлдэхгүй
        if (!last) tl.to(layer, { autoAlpha: 0, duration: T * 0.35 }, i + 1 - T - 0.04);

        const num = at(`[data-num="${i}"]`);
        if (num) tl.fromTo(num, { yPercent: 35 }, { yPercent: -35, duration: end - start }, start);
        const detail = at(`[data-detail="${i}"]`);
        if (detail) {
          tl.fromTo(detail, { yPercent: 30, rotate: -5 }, { yPercent: -30, rotate: 3, duration: end - start }, start);
          tl.fromTo(detail, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.12, ease: "power3.out" }, i + 0.06);
        }

        // ── Гарчиг: үг бүр мөрийн доороос маскаар гарч, дээшээ алга болно ──
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
            if (rest.length) tl.fromTo(rest, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: FADE, stagger: 0.012 }, inAt + 0.025);
          }
          tl.fromTo(words, { yPercent: 0 }, { yPercent: -115, duration: FADE * 1.2, stagger: 0.006, ease: "power2.in", immediateRender: false }, outAt);
          if (rest.length) tl.fromTo(rest, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: FADE, immediateRender: false }, outAt);
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
      tl.set({}, {}, total);
      markStep(steps.current, 0);

      // Анх (хуудасны дээд хэсэгт): гарчиг үг үгээрээ гарна. Цэцэг нь зураг ачаалагдмагц дэлбээлнэ (onReady).
      if (window.scrollY < 40) {
        gsap.from(q('[data-stage="0"][data-beat] [data-word]'), { yPercent: 115, duration: 1.3, stagger: 0.07, ease: "power3.out", delay: 0.5 });
        gsap.from(q('[data-stage="0"][data-beat] [data-fade]'), { autoAlpha: 0, y: 18, duration: 1, stagger: 0.1, delay: 0.9 });
      }
    });

    return () => {
      visibility.kill();
      immersive.kill();
      document.documentElement.removeAttribute("data-immersive");
      mm.revert();
    };
  }, [n, total, motion]);

  // Эхний цэцэг: хуудасны дээд хэсэгт бол удаан дэлбээлнэ, доор ачаалсан бол шууд нээлттэй
  const bloomIn = useCallback(() => {
    const m = motion[0];
    if (window.scrollY > 40 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.set(m, { bloom: 1 });
    else gsap.fromTo(m, { bloom: 0.04 }, { bloom: 1, duration: 3.2, ease: "power2.inOut" });
  }, [motion]);

  // Цайвар бүлэг дээр header бараан бэхээр (globals.css: data-hero-tone)
  const tone = stops[stage]?.tone ?? "dark";
  useEffect(() => {
    document.documentElement.dataset.heroTone = tone;
    return () => {
      delete document.documentElement.dataset.heroTone;
    };
  }, [tone]);

  /** Аяллын P цэг рүү зөөлөн гүйлгэнэ (бүлгийн индикатор) */
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
        <div className="sticky top-0 h-dvh overflow-hidden bg-[#0b0608]">
          {/* Зураг ачаалагдмагц эхний цэцэг нахиагаас дэлбээлнэ (гарчиг түүнээс өмнө харагдана) */}
          {!reduced && <BloomStage chapters={chapters} motion={motion} current={stage} active={active} onReady={bloomIn} onFail={onFail} />}

          {stops.map((stop, i) => (
            <Chapter key={stop.flower.slug} stop={stop} index={i} count={n} />
          ))}

          {/* Доод голд намуухан «гүйлгэ» заалт */}
          <div
            data-scroll-hint
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.68rem] tracking-[0.12em] text-ivory/50 landscape:sm:flex"
          >
            Гүйлгэх
            <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-ivory/70" />
            </span>
          </div>

          {/* Бүлгийн индикатор — дарвал тухайн цэцэг рүү */}
          <nav
            aria-label="Цэцгийн аялал"
            className={cn(
              "absolute right-4 bottom-5 z-20 transition-colors duration-700 sm:right-8 sm:bottom-8 lg:right-10",
              stops[stage]?.tone === "light" ? "text-plum-950" : "text-ivory",
            )}
          >
            <ol ref={steps} className="flex gap-4 text-[0.7rem] tracking-[0.08em] tabular-nums sm:gap-5">
              {stops.map(({ flower }, i) => (
                <li key={flower.slug}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i === 0 ? 0 : i + 0.02)}
                    aria-label={`${pad(i + 1)} — ${flower.nameMn}`}
                    className="group relative flex items-baseline gap-2 pb-2 opacity-40 transition-opacity duration-500 hover:opacity-80 data-active:opacity-100"
                  >
                    {pad(i + 1)}
                    <span aria-hidden className="hidden font-display text-[0.92rem] italic group-data-active:inline">
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
 * Нэг бүлгийн текстийн давхарга (зураг, дэвсгэрийг BloomStage зурна): гарчгууд, бүтээгдэхүүний карт,
 * арын том дугаар, жижиг дэлгэрэнгүй зураг, attribution. Босоо дэлгэцэнд текст доод 40%-д.
 */
function Chapter({ stop, index, count }: { stop: JourneyFlower; index: number; count: number }) {
  const { flower, story, hero, detail, tone, cover } = stop;
  const light = tone === "light";
  return (
    <div
      data-layer={index}
      className={cn("absolute inset-0", light ? "text-plum-950" : "text-ivory", index > 0 && "invisible opacity-0")}
      style={{ zIndex: index + 2 }}
    >
      {/* Арын том serif дугаар — scroll-оор эсрэг чиглэлд хөдөлж гүн өгнө */}
      <span
        data-num={index}
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-[4vw] -left-[1vw] font-display text-[40vw] leading-none font-extralight select-none landscape:text-[24vw]",
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

      <div className="relative mx-auto grid h-full w-full max-w-7xl px-5 pt-(--header-height) sm:px-8 portrait:items-end portrait:pb-20 landscape:items-center">
        {story.map((beat, j) => (
          <Beat key={j} stage={index} beat={beat} first={index === 0 && j === 0} light={light} />
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

// Босоо (утас): 3 мөрөөс хэтрэхгүй хэмжээ; хэвтээ: том редакцын гарчиг
const titleClass =
  "font-display text-[2.35rem] leading-[1.04] font-extralight tracking-[-0.01em] text-balance sm:text-6xl landscape:lg:text-[5.2rem]";

function Beat({ stage, beat, first, light }: { stage: number; beat: StoryBeat; first: boolean; light: boolean }) {
  const [before, em, after] = beat.title;
  const Heading = first ? "h1" : "h2";
  return (
    <div
      data-beat
      data-stage={stage}
      className={cn("max-w-xl [grid-area:1/1] landscape:max-w-[33rem]", !first && "invisible")}
    >
      <p data-fade className={cn("eyebrow mb-5 sm:mb-8", light && "text-gold-deep! before:bg-gold-deep/50!")}>
        {beat.eyebrow}
      </p>
      <Heading className={titleClass}>
        <Words text={before} />
        <em className={cn("font-light", light ? "text-rose-ink" : "text-blush-100")}>
          <Words text={em} />
        </em>
        <Words text={after} />
      </Heading>
      <p
        data-fade
        className={cn(
          "mt-5 max-w-sm text-[0.95rem] leading-relaxed sm:mt-7 sm:text-[1.05rem]",
          light ? "text-plum-950/70" : "text-ivory/70",
        )}
      >
        {beat.body}
      </p>
      {first && (
        <div data-fade className="mt-8 sm:mt-11">
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
