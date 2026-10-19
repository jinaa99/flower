"use client";

import dynamic from "next/dynamic";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { defaultFlowerParams } from "@/components/three/Flower/params";
import { supportsWebGL } from "@/components/three/Flower/quality";
import { BloomLoader } from "@/components/ui/BloomLoader";
import { ProductCard } from "@/components/ui/ProductCard";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import type { StoryBeat } from "@/data/journey";
import type { JourneyFlower } from "@/lib/data";
import { journeyLength, scrollMotion, STAGE } from "@/lib/scrollMotion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { HomeStatic } from "./HomeStatic";

gsap.registerPlugin(ScrollTrigger);

const FlowerScene = dynamic(() => import("@/components/three/Flower/FlowerScene"), { ssr: false });

const BLUR = "blur(14px)";
/** Нэг цэцгийн шатанд ногдох scroll-ийн урт */
const STAGE_VH = 500;
/** Гарчиг, картын fade-ийн үргэлжлэх хугацаа (шатны хувь) */
const FADE = 0.04;

type Props = {
  /** Аяллын дарааллаар */
  stops: JourneyFlower[];
};

/**
 * Нүүр: 3D аялал эсвэл 3D-гүй хувилбар (HomeStatic).
 * - prefers-reduced-motion: CSS-ээр (motion-reduce) шууд static — server HTML-ээс эхлэн, CLS-гүй.
 * - WebGL байхгүй эсвэл 3D алдаа гарвал: JS тогтоосны дараа static руу шилжинэ.
 * - JS-гүй үед (scripting: none) мөн static — `globals.css`.
 */
export function HomeHero({ stops }: Props) {
  const [fallback, setFallback] = useState(false);
  const onFail = useCallback(() => setFallback(true), []);

  return (
    <>
      {!fallback && <Journey stops={stops} onFail={onFail} />}
      <HomeStatic stops={stops} forced={fallback} className={fallback ? undefined : "hidden motion-reduce:block"} />
    </>
  );
}

/**
 * 3D аялал: ард нь бүтэн дэлгэцийн fixed Canvas, урд нь sticky хэсэг (цэцэг бүрд STAGE_VH).
 * ScrollTrigger progress → scrollMotion.hero → (damping) → ScrollRig. Цэцэг бүр: нахиа →
 * дэлбээлэлт → камер голд нь орно → дэлбээ бүтээгдэхүүний зураг руу уусна → карт → зураг
 * голоосоо нээгдэж дараагийн цэцгийн ертөнц рүү гарна (STAGE). Гарчгууд, картууд нэг
 * timeline-д scrub-аар солигдох тул буцаж scroll хийхэд урвуу явна. Сүүлийн цэцгийн
 * картанд «Бүх цэцгийг үзэх» → /catalog.
 *
 * Гүйцэтгэл: WebGL-ийн шалгалт болон three.js chunk-ийг хуудас `load` болж, browser сул болсны
 * дараа л хийнэ — WebGL context үүсгэх (GPU process эхлүүлэх) нь main thread-ийг блоклодог тул
 * hydration-ий үеэр хийвэл first paint, LCP хоцорно. Тэр хооронд цэцгийн байрлалд нахиа
 * loader (BloomLoader), эхний кадрууд render хийгдмэгц Canvas зөөлөн тодорно.
 */
function Journey({ stops, onFail }: Props & { onFail: () => void }) {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const reducedMotion = useReducedMotion();
  const [start3D, setStart3D] = useState(false);
  const [ready, setReady] = useState(false);
  const specs = useMemo(() => stops.map((s) => s.spec), [stops]);
  const total = journeyLength(stops.length);

  // Reduced motion-д аялал CSS-ээр нуугдсан — three.js-ийг огт ачаалахгүй
  useEffect(() => {
    if (reducedMotion) return;
    let idle = 0;
    let timer = 0;
    const begin = () => {
      // Safari-д requestIdleCallback байхгүй
      const go = () => (supportsWebGL() ? setStart3D(true) : onFail());
      if (typeof requestIdleCallback === "function") idle = requestIdleCallback(go, { timeout: 1500 });
      else timer = window.setTimeout(go, 300);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      window.removeEventListener("load", begin);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, [reducedMotion, onFail]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    // Аялал дэлгэцээс бүрэн гарч, дараагийн хэсэг Canvas-ийг халхлах үед render-ийг зогсооно
    const visibility = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setActive(self.isActive),
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const scrim = q("[data-scrim]");
      const hidden = { autoAlpha: 0, filter: BLUR };
      const shown = { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: FADE };
      const S = STAGE;
      const n = stops.length;

      // Байрлал, үргэлжлэх хугацаа нь аяллын P нэгжээр: шат i нь [i, i + 1)
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            scrollMotion.hero = self.progress;
          },
        },
      });
      tl.to(q("[data-scroll-hint]"), { autoAlpha: 0, y: 16, duration: 0.02 }, 0);

      for (let i = 0; i < n; i++) {
        // Дэлбээлэлтийн үеэр гарчгууд ээлжлэн солигдоно; дараагийн цэцгийн эхний гарчиг
        // шинэ нахиа гарч ирэх үед (өмнөх шатны гарцын төгсгөлд) тодорно
        const beats = q(`[data-beat][data-stage="${i}"]`);
        const len = S.diveStart / beats.length;
        beats.forEach((beat, j) => {
          if (i > 0 || j > 0) tl.fromTo(beat, { ...hidden, y: 40 }, shown, j === 0 ? i - 0.05 : i + j * len);
          const out = j === beats.length - 1 ? i + S.diveStart - 0.01 : i + (j + 1) * len - FADE;
          tl.to(beat, { ...hidden, y: -40, duration: FADE }, out);
        });

        // Dive: сүүдэр сулрана — дэлбээ дэлгэцийг бүтэн дүүргэнэ. Зураг гарсны дараа буцна.
        tl.to(scrim, { autoAlpha: 0.25, duration: 0.12 }, i + S.diveStart).to(
          scrim,
          { autoAlpha: 1, duration: 0.05 },
          i + S.dissolveEnd - 0.03,
        );

        const card = q(`[data-card][data-stage="${i}"]`);
        tl.fromTo(card, { ...hidden, y: 40 }, { ...shown, duration: 0.06 }, i + S.cardStart);
        if (i < n - 1) tl.to(card, { ...hidden, y: -40, duration: FADE }, i + S.exitStart);
      }
      tl.set({}, {}, total);

      scrollMotion.hero = tl.scrollTrigger?.progress ?? 0;
    });

    return () => {
      visibility.kill();
      mm.revert();
      scrollMotion.hero = 0;
    };
  }, [stops, total]);

  return (
    <div data-home="journey" className="motion-reduce:hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className={cn("absolute inset-0 transition-opacity duration-1000 ease-bloom", ready ? "opacity-100" : "opacity-0")}>
          {start3D && !reducedMotion && (
            <SceneBoundary onError={onFail}>
              <FlowerScene
                specs={specs}
                params={defaultFlowerParams}
                scrollDriven
                active={active}
                onReady={() => setReady(true)}
              />
            </SceneBoundary>
          )}
        </div>
        {/* Цэцгийн байрлалд (ScrollRig-ийн view offset): хэвтээд баруун тийш, босоод дээш */}
        <BloomLoader
          visible={!ready}
          className="absolute -translate-x-1/2 -translate-y-1/2 portrait:top-[36%] portrait:left-1/2 landscape:top-1/2 landscape:left-[64%]"
        />
      </div>

      <section
        ref={section}
        className="relative z-10 h-(--journey-height)"
        style={{ "--journey-height": `${total * STAGE_VH + 100}vh` } as CSSProperties}
        aria-label="Цэцгийн аялал"
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          {/* Гарчгийн уншигдах байдлыг хангах зөөлөн сүүдэр — цэцгийг халхлахгүй */}
          <div
            aria-hidden
            data-scrim
            className="pointer-events-none absolute inset-0 landscape:bg-linear-to-r landscape:from-plum-950/70 landscape:via-plum-950/20 landscape:to-transparent portrait:bg-linear-to-t portrait:from-plum-950/90 portrait:via-plum-950/30 portrait:to-transparent"
          />

          <div className="relative mx-auto grid h-full w-full max-w-7xl px-4 pt-(--header-height) sm:px-8 portrait:items-end portrait:pb-28 landscape:items-center">
            {stops.map(({ flower, story, cover }, i) => (
              <Fragment key={flower.slug}>
                {story.map((beat, j) => (
                  <Beat key={j} stage={i} beat={beat} first={i === 0 && j === 0} />
                ))}
                {/* Dissolve дууссаны дараа л GSAP харуулна */}
                <ProductCard
                  flower={flower}
                  stage={i}
                  count={stops.length}
                  cover={cover}
                  data-card
                  data-stage={i}
                  className="invisible opacity-0 [grid-area:1/1]"
                />
              </Fragment>
            ))}
          </div>

          <div
            data-scroll-hint
            className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-[0.65rem] tracking-[0.35em] text-ivory/55 uppercase sm:px-8 landscape:items-start"
          >
            <span>Доош гүйлгэ</span>
            <span aria-hidden className="relative h-10 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-gold-soft" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

const titleClass = "font-display text-5xl leading-[0.95] font-light text-balance sm:text-7xl lg:text-8xl";
const bodyClass = "mt-8 max-w-md text-lg text-ivory/60";

function Beat({ stage, beat, first }: { stage: number; beat: StoryBeat; first: boolean }) {
  const [before, em, after] = beat.title;
  const Heading = first ? "h1" : "h2";
  return (
    <div
      data-beat
      data-stage={stage}
      className={cn(
        // Бүгд нэг grid нүдэнд давхцаж, scroll-оор солигдоно
        "max-w-2xl [grid-area:1/1]",
        // Эхний гарчгаас бусад нь JS ачаалахаас өмнө ч нуугдсан байна (GSAP autoAlpha-аар сольно)
        !first && "invisible opacity-0",
      )}
    >
      <p className="mb-6 text-xs tracking-[0.3em] text-gold-soft uppercase">{beat.eyebrow}</p>
      <Heading className={titleClass}>
        {before}
        <em className="text-blush-300">{em}</em>
        {after}
      </Heading>
      <p className={bodyClass}>{beat.body}</p>
    </div>
  );
}
