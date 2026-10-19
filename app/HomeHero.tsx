"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { defaultFlowerParams } from "@/components/three/Flower/params";
import { scrollMotion } from "@/lib/scrollMotion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const FlowerScene = dynamic(() => import("@/components/three/Flower/FlowerScene"), { ssr: false });

const BLUR = "blur(14px)";

type Props = {
  href: string;
  price: string;
};

/**
 * Нүүрний hero: ард нь бүтэн дэлгэцийн fixed Canvas, урд нь ~300vh sticky хэсэг.
 * ScrollTrigger progress → scrollMotion.hero → (damping) → bloom + камерын orbit (ScrollRig).
 * Гарчгууд scrub-аар fade/blur-ээр солигдоно. Reduced motion: гарчгууд энгийн урсгалаар
 * дараалан, цэцэг бүрэн дэлбээлсэн статик.
 */
export function HomeHero({ href, price }: Props) {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    // Hero дэлгэцээс бүрэн гарч, дараагийн хэсэг Canvas-ийг халхлах үед render-ийг зогсооно
    const visibility = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setActive(self.isActive),
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const [first, second, third] = gsap.utils.toArray<HTMLElement>("[data-beat]", el);
      const hint = el.querySelector("[data-scroll-hint]");
      const hidden = { autoAlpha: 0, filter: BLUR };
      const shown = { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.1 };

      // Байрлал, үргэлжлэх хугацаа нь scroll progress-ийн хувь (нийт = 1)
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
      tl.to(hint, { autoAlpha: 0, y: 16, duration: 0.05 }, 0)
        .to(first, { ...hidden, y: -40, duration: 0.1 }, 0.2)
        .fromTo(second, { ...hidden, y: 40 }, shown, 0.3)
        .to(second, { ...hidden, y: -40, duration: 0.1 }, 0.54)
        .fromTo(third, { ...hidden, y: 40 }, shown, 0.66)
        .set({}, {}, 1);

      scrollMotion.hero = tl.scrollTrigger?.progress ?? 0;
    });

    return () => {
      visibility.kill();
      mm.revert();
      scrollMotion.hero = 0;
    };
  }, []);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <FlowerScene params={defaultFlowerParams} scrollDriven active={active} />
      </div>

      <section ref={section} className="relative z-10 motion-safe:h-[300vh]" aria-label="Цээнэ · Peony">
        <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-dvh motion-safe:overflow-hidden">
          {/* Гарчгийн уншигдах байдлыг хангах зөөлөн сүүдэр — цэцгийг халхлахгүй */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 landscape:bg-linear-to-r landscape:from-plum-950/70 landscape:via-plum-950/20 landscape:to-transparent portrait:bg-linear-to-t portrait:from-plum-950/90 portrait:via-plum-950/30 portrait:to-transparent"
          />

          <div className="relative mx-auto grid h-full w-full max-w-7xl px-4 pt-(--header-height) sm:px-8 motion-reduce:gap-[30vh] motion-reduce:py-[20vh] portrait:items-end portrait:pb-28 landscape:items-center">
            <Beat index={0} eyebrow="Цээнэ · Peony">
              <h1 className={titleClass}>
                Цээнэ — <em className="text-blush-300">эрхэмсэг</em> баяр баясгалан
              </h1>
              <p className={bodyClass}>Давхар дэлбээ бүрд хаврын зөөлөн гэрэл нуугдана.</p>
            </Beat>

            <Beat index={1} eyebrow="Дэлбээлэлт">
              <h2 className={titleClass}>
                Нахиа бүр <em className="text-blush-300">аажмаар</em> нээгдэнэ
              </h2>
              <p className={bodyClass}>Гадна дэлбээнээс эхлэн, дотроо нууцаа хадгалсаар дэлгэрнэ.</p>
            </Beat>

            <Beat index={2} eyebrow="Бүрэн дэлбээлсэн">
              <h2 className={titleClass}>
                Сэтгэлээ илэрхийлэх <em className="text-blush-300">эелдэг</em> үг
              </h2>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <Link
                  href={href}
                  className="inline-block border border-gold-soft/50 px-8 py-4 text-sm tracking-[0.2em] text-gold-soft uppercase transition-colors duration-500 hover:bg-gold-soft hover:text-plum-950"
                >
                  Цээнэ үзэх
                </Link>
                <span className="font-display text-2xl text-gold-soft">{price}</span>
              </div>
            </Beat>
          </div>

          <div
            data-scroll-hint
            className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-[0.65rem] tracking-[0.35em] text-ivory/55 uppercase sm:px-8 landscape:items-start motion-reduce:hidden"
          >
            <span>Доош гүйлгэ</span>
            <span aria-hidden className="relative h-10 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-gold-soft" />
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

const titleClass = "font-display text-5xl leading-[0.95] font-light text-balance sm:text-7xl lg:text-8xl";
const bodyClass = "mt-8 max-w-md text-lg text-ivory/60";

function Beat({ index, eyebrow, children }: { index: number; eyebrow: string; children: React.ReactNode }) {
  return (
    <div
      data-beat
      className={cn(
        // motion-safe: бүгд нэг grid нүдэнд давхцаж, scroll-оор солигдоно
        "max-w-2xl will-change-[opacity,filter,transform] motion-safe:[grid-area:1/1]",
        // Эхний гарчгаас бусад нь JS ачаалахаас өмнө ч нуугдсан байна (GSAP autoAlpha-аар сольно)
        index > 0 && "motion-safe:invisible motion-safe:opacity-0",
      )}
    >
      <p className="mb-6 text-xs tracking-[0.3em] text-gold-soft uppercase">{eyebrow}</p>
      {children}
    </div>
  );
}
