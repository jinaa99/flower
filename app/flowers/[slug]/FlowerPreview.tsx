"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultFlowerParams } from "@/components/three/Flower/params";
import { supportsWebGL } from "@/components/three/Flower/quality";
import { BloomLoader } from "@/components/ui/BloomLoader";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const FlowerScene = dynamic(() => import("@/components/three/Flower/FlowerScene"), { ssr: false });

/**
 * Дэлгэрэнгүй хуудасны жижиг 3D: салхинд найгах цэцэг, аажим эргэнэ, чирж эргүүлнэ.
 * three.js chunk + WebGL context-ийг хуудас `load` болж, browser сул, хэсэг дэлгэцэнд ойртсоны
 * дараа л үүсгэнэ (LCP-д нөлөөлөхгүй). Дэлгэцээс гарвал render зогсоно. WebGL байхгүй эсвэл
 * алдаа гарвал хэсэг бүхэлдээ нуугдана. Reduced motion-д эргэлт, салхигүй статик.
 */
export function FlowerPreview({ spec, name }: { spec: FlowerSpec; name: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [start, setStart] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const specs = useMemo(() => [spec], [spec]);
  const params = useMemo(() => ({ ...defaultFlowerParams, bloom: 0.92, autoRotate: true }), []);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || start) return;
    let idle = 0;
    let timer = 0;
    const begin = () => {
      // Safari-д requestIdleCallback байхгүй
      const go = () => (supportsWebGL() ? setStart(true) : setFailed(true));
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
  }, [visible, start]);

  if (failed) return null;

  return (
    <figure>
      <div
        ref={el}
        className="relative aspect-[16/11] overflow-hidden border border-ivory/10"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${spec.world.background.inner}, ${spec.world.background.outer})`,
        }}
      >
        <BloomLoader visible={!ready} className="absolute inset-0 justify-center" />
        {start && (
          <div
            className={cn(
              "absolute inset-0 cursor-grab transition-opacity duration-1000 ease-bloom active:cursor-grabbing",
              ready ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          >
            <SceneBoundary onError={() => setFailed(true)}>
              <FlowerScene specs={specs} params={params} active={visible} onReady={() => setReady(true)} preview />
            </SceneBoundary>
          </div>
        )}
        <p className="pointer-events-none absolute top-4 left-4 text-[0.62rem] tracking-[0.16em] text-ivory/60 uppercase">
          3D
        </p>
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs text-ivory/50">
        <span>
          {reducedMotion ? `${name} — 3D загвар` : `${name} салхинд найгана`}
        </span>
        <span className="hidden tracking-wide sm:inline">Чирж эргүүлнэ</span>
      </figcaption>
    </figure>
  );
}
