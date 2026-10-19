"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { defaultFlowerParams, paramGroups, type FlowerParams } from "@/components/three/Flower/params";
import { defaultWindConfig, windGroups, type WindConfig } from "@/components/three/Flower/wind";
import type { JourneyFlower } from "@/lib/data";
import { scrollMotion } from "@/lib/scrollMotion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const FlowerScene = dynamic(() => import("@/components/three/Flower/FlowerScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-xs tracking-[0.3em] text-ivory/40 uppercase">
      Ачаалж байна…
    </div>
  ),
});

export function FlowerLab({ stops }: { stops: JourneyFlower[] }) {
  const [slug, setSlug] = useState(stops[0].flower.slug);
  const stop = stops.find((s) => s.flower.slug === slug) ?? stops[0];
  const { flower } = stop;
  const specs = useMemo(() => [stop.spec], [stop]);
  const [params, setParams] = useState<FlowerParams>(defaultFlowerParams);
  const [wind, setWind] = useState<WindConfig>(defaultWindConfig);
  const [panelOpen, setPanelOpen] = useState(true);
  const statsRef = useRef<HTMLParagraphElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const scrollTween = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(
    () => () => {
      tween.current?.kill();
      scrollTween.current?.kill();
      scrollMotion.simulated = 0;
    },
    [],
  );

  const showStats = (text: string) => {
    if (statsRef.current) statsRef.current.textContent = text;
  };

  const set = <K extends keyof FlowerParams>(key: K, value: FlowerParams[K]) => {
    if (key === "bloom") tween.current?.kill();
    setParams((p) => ({ ...p, [key]: value }));
  };

  // bloom 0 → 1 (нахиа → бүрэн дэлбээлэлт)-ийг тоглуулж stagger-ийг шалгана
  const playBloom = () => {
    tween.current?.kill();
    const proxy = { value: 0 };
    tween.current = gsap.to(proxy, {
      value: 1,
      duration: reducedMotion ? 0 : 4.5,
      ease: "none",
      onUpdate: () => setParams((p) => ({ ...p, bloom: proxy.value })),
    });
  };

  // Lenis-ийн хурдан scroll-ийг дуурайна: хурд огцом өсөөд аажим 0 болно → цэцэг налж, spring-ээр буцна
  const simulateScroll = (direction: 1 | -1) => {
    scrollTween.current?.kill();
    scrollTween.current = gsap
      .timeline()
      .to(scrollMotion, { simulated: direction * wind.scrollMaxVelocity, duration: 0.2, ease: "power2.out" })
      .to(scrollMotion, { simulated: 0, duration: 0.9, ease: "power2.in" });
  };

  return (
    <div className="fixed inset-x-0 top-(--header-height) bottom-0" data-lenis-prevent>
      <div className="absolute inset-0">
        <FlowerScene specs={specs} params={params} wind={wind} onStats={showStats} />
      </div>

      <p
        ref={statsRef}
        className="pointer-events-none absolute top-4 left-4 font-mono text-xs text-ivory/60 tabular-nums"
        aria-live="off"
      >
        — fps
      </p>

      <button
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        className="absolute top-4 right-4 z-10 border border-ivory/15 bg-plum-950/70 px-4 py-2 text-xs tracking-[0.2em] text-ivory/80 uppercase backdrop-blur-md transition-colors hover:border-gold-soft/50 hover:text-gold-soft"
        aria-expanded={panelOpen}
        aria-controls="lab-panel"
      >
        {panelOpen ? "Хаах" : "Тохиргоо"}
      </button>

      <aside
        id="lab-panel"
        className={cn(
          "absolute top-16 right-4 bottom-4 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border border-ivory/10 bg-plum-950/75 p-6 backdrop-blur-md",
          !panelOpen && "hidden",
        )}
      >
        <p className="text-xs tracking-[0.3em] text-gold-soft uppercase">Lab</p>
        <h1 className="mt-2 font-display text-3xl font-light">
          {flower.nameMn} · {flower.nameEn}
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Цэцэг сонгох">
          {stops.map(({ flower: f }) => (
            <button
              key={f.slug}
              type="button"
              onClick={() => setSlug(f.slug)}
              aria-pressed={f.slug === slug}
              className={cn(
                "border px-2 py-2 text-xs transition-colors",
                f.slug === slug
                  ? "border-blush-300 text-blush-300"
                  : "border-ivory/15 text-ivory/70 hover:border-gold-soft/50 hover:text-gold-soft",
              )}
            >
              {f.nameMn}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <LabButton onClick={playBloom}>Нээх ▶</LabButton>
          <LabButton onClick={() => set("bloom", 0)}>Нахиа</LabButton>
          <LabButton
            onClick={() => {
              tween.current?.kill();
              setParams(defaultFlowerParams);
              setWind(defaultWindConfig);
            }}
          >
            Reset
          </LabButton>
        </div>

        {paramGroups.map((group) => (
          <LabGroup key={group.title} title={group.title}>
            {group.controls.map((c) => (
              <Slider key={c.key} label={c.label} min={c.min} max={c.max} step={c.step} value={params[c.key]} onChange={(v) => set(c.key, v)} />
            ))}
          </LabGroup>
        ))}

        <p className="mt-12 text-xs tracking-[0.3em] text-gold-soft uppercase">Салхи</p>
        {reducedMotion && (
          <p className="mt-2 text-xs text-ivory/50">Reduced motion идэвхтэй — салхи унтарсан.</p>
        )}
        <div className="mt-4 flex gap-2">
          <LabButton onClick={() => simulateScroll(1)}>Scroll ↓</LabButton>
          <LabButton onClick={() => simulateScroll(-1)}>Scroll ↑</LabButton>
          <LabButton onClick={() => setWind(defaultWindConfig)}>Reset</LabButton>
        </div>
        {windGroups.map((group) => (
          <LabGroup key={group.title} title={group.title}>
            {group.controls.map((c) => (
              <Slider
                key={c.key}
                label={c.label}
                min={c.min}
                max={c.max}
                step={c.step}
                value={wind[c.key]}
                onChange={(v) => setWind((w) => ({ ...w, [c.key]: v }))}
              />
            ))}
          </LabGroup>
        ))}

        <label className="mt-8 flex items-center gap-3 text-xs text-ivory/75">
          <input
            type="checkbox"
            checked={params.autoRotate}
            onChange={(e) => set("autoRotate", e.target.checked)}
            className="accent-blush-300"
          />
          Автоматаар эргүүлэх
        </label>
      </aside>
    </div>
  );
}

function LabGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8">
      <legend className="mb-3 text-[0.65rem] tracking-[0.3em] text-ivory/45 uppercase">{title}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

type SliderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  const digits = step >= 1 ? 0 : step >= 0.01 ? 2 : 3;
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-ivory/75">
        <span>{label}</span>
        <span className="text-gold-soft tabular-nums">{value.toFixed(digits)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-blush-300"
      />
    </label>
  );
}

function LabButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 border border-gold-soft/40 px-2 py-2 text-[0.65rem] tracking-[0.2em] text-gold-soft uppercase transition-colors hover:bg-gold-soft hover:text-plum-950"
    >
      {children}
    </button>
  );
}
