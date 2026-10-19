"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { scrollMotion } from "@/lib/scrollMotion";
import { clamp01, lerp } from "./math";

/** Цэцгийн толгойноос бага зэрэг доош — дэлбээлсэн толгой дэлгэцийн төвөөс дээгүүр, header-т тулахгүй */
const TARGET = new THREE.Vector3(0, 0.2, 0);

/** Hero scroll-ын эхэн → төгсгөл: зөөлөн тойрч (azimuth), бага зэрэг доошилж, ойртоно */
const ORBIT = {
  azimuth: [-0.55, 0.4],
  elevation: [0.36, 0.22],
  distance: [6.6, 5.7],
} as const;

/** Scroll-ын энэ хэсэгт bloom 1 хүрнэ — сүүлийн гарчиг бүрэн дэлбээлсэн цэцэгтэй харагдана */
const BLOOM_END = 0.85;
/** Damping-ийн хурд (1/сек) — их байх тусам scroll-ийг ойр дагана */
const DAMPING = 3.2;
/** Нарийн (босоо) дэлгэцэнд дэлбээлсэн толгой өргөнөөрөө багтахаар камерыг холдуулна */
const FIT_ASPECT = 0.85;

type Props = {
  /** Peony кадр бүр уншина */
  bloomRef: RefObject<number>;
  reducedMotion: boolean;
};

/**
 * Hero scroll progress-ийг (scrollMotion.hero) frame-rate-ээс үл хамааран damping-тэй дагаж
 * bloom болон камерын orbit-д хөрвүүлнэ. Reduced motion: бүрэн дэлбээлсэн, хөдөлгөөнгүй камер.
 */
export function ScrollRig({ bloomRef, reducedMotion }: Props) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const progress = useRef(scrollMotion.hero);
  const distanceScale = useRef(1);

  // Хэвтээ дэлгэцэнд цэцэг баруун тийш (зүүн талд гарчиг), босоо дэлгэцэнд дээш (доор гарчиг)
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const { width: w, height: h } = size;
    distanceScale.current = Math.max(1, FIT_ASPECT / (w / h));
    if (w >= h) camera.setViewOffset(w, h, -w * 0.14, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.16, w, h);
    return () => camera.clearViewOffset();
  }, [camera, size]);

  // Камерыг useFrame-ийн state-ээс авч өөрчилнө (hook-ийн утгыг mutate хийхгүй)
  useFrame(({ camera }, delta) => {
    let p = 1;
    if (!reducedMotion) {
      p = THREE.MathUtils.damp(progress.current, scrollMotion.hero, DAMPING, Math.min(delta, 1 / 30));
      // Хязгаарт ойртоод мөнхөд «мөлхөхгүй»
      if (Math.abs(p - scrollMotion.hero) < 1e-4) p = scrollMotion.hero;
    }
    progress.current = p;
    bloomRef.current = clamp01(p / BLOOM_END);

    const az = lerp(ORBIT.azimuth[0], ORBIT.azimuth[1], p);
    const el = lerp(ORBIT.elevation[0], ORBIT.elevation[1], p);
    const d = lerp(ORBIT.distance[0], ORBIT.distance[1], p) * distanceScale.current;
    camera.position.set(
      TARGET.x + d * Math.cos(el) * Math.sin(az),
      TARGET.y + d * Math.sin(el),
      TARGET.z + d * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(TARGET);
  });

  return null;
}
