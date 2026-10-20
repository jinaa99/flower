"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { WorldSpec } from "@/data/flowerSpecs";
import { Backdrop } from "./Backdrop";
import type { JourneyState } from "./journey";
import { lerp } from "./math";
import type { FlowerParams } from "./params";

/** Ердийн үед fog бараг мэдрэгдэхгүй — зөвхөн ертөнц хооронд шилжихэд өтгөрнө */
const FOG = { near: 10, far: 28 };
/** Шинэ нахиа (камераас ~11) бүрэн мананцарт нуугдаж эхэлнэ */
const HAZE = { near: 0.5, far: 6 };

type WorldColors = ReturnType<typeof toColors>;
type Lights = {
  hemi: THREE.HemisphereLight | null;
  key: THREE.DirectionalLight | null;
  rim: THREE.DirectionalLight | null;
  rim2: THREE.DirectionalLight | null;
  fill: THREE.DirectionalLight | null;
};

function toColors(w: WorldSpec) {
  const c = (hex: string) => new THREE.Color(hex);
  return {
    inner: c(w.background.inner),
    outer: c(w.background.outer),
    fog: c(w.fog),
    sky: c(w.hemisphere.sky),
    ground: c(w.hemisphere.ground),
    key: c(w.key.color),
    rim: c(w.rim.color),
    rim2: c(w.rim.secondary),
    fill: c(w.fill.color),
  };
}

type Props = {
  worlds: readonly WorldSpec[];
  params: FlowerParams;
  /** Өгвөл journey.world (бутархай индекс) болон haze-ийг дагана; үгүй бол worlds[0] статик */
  journey?: JourneyState;
  /** Key гэрлийн сүүдрийн map-ийн хэмжээ (quality) */
  shadowMap: number;
};

/**
 * Цэцгийн ертөнц: дэвсгэрийн gradient, гэрэл, fog, environment-ийн хүч. Кадр бүр хоёр
 * хөрш ертөнцийн хооронд lerp — нэг цэцгийн голоор нэвтэрч дараагийн ертөнц рүү гарахад
 * өнгө, гэрэл зөөлөн шилжинэ. Бүх утга урьдчилан үүсгэсэн Color-д .lerpColors-оор бичигдэнэ.
 */
export function World({ worlds, params, journey, shadowMap }: Props) {
  const scene = useThree((s) => s.scene);
  const paramsRef = useRef(params);
  useLayoutEffect(() => {
    paramsRef.current = params;
  });

  const palettes = useMemo(() => worlds.map(toColors), [worlds]);
  // Одоогийн (холилдсон) утгууд — Backdrop, fog, гэрлүүд эдгээрийг заана
  const live = useMemo(() => toColors(worlds[0]), [worlds]);
  const fog = useMemo(() => new THREE.Fog(live.fog, FOG.near, FOG.far), [live]);

  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const rim2 = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);

  useLayoutEffect(() => attachFog(scene, fog), [scene, fog]);

  // Чанарын түвшин солигдоход shadow map шинэ хэмжээгээр дахин үүснэ (three өөрөө үүсгэхгүй)
  useLayoutEffect(() => {
    const shadow = key.current?.shadow;
    if (!shadow?.map) return;
    shadow.map.dispose();
    shadow.map = null;
  }, [shadowMap]);

  useFrame(({ scene }) => {
    const w = Math.min(Math.max(journey?.world ?? 0, 0), worlds.length - 1);
    const lights = { hemi: hemi.current, key: key.current, rim: rim.current, rim2: rim2.current, fill: fill.current };
    blendWorld(scene, live, fog, lights, palettes, worlds, w, journey?.haze ?? 0, paramsRef.current);
  });

  return (
    <>
      <Backdrop inner={live.inner} outer={live.outer} />
      <hemisphereLight ref={hemi} />
      {/* Key: урд дээд зүүнээс зөөлөн дулаан — цорын ганц сүүдэр тусгах гэрэл (цэцгийн толгойд тааруулсан хүрээ) */}
      <directionalLight
        ref={key}
        position={[-3, 4, 4]}
        castShadow
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-bias={-0.0012}
        shadow-normalBias={0.045}
        shadow-radius={4}
        shadow-camera-left={-1.5}
        shadow-camera-right={1.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={2}
        shadow-camera-far={11}
      />
      {/* Rim / back: ар талаас — дэлбээгээр нэвтэрч ирмэгийг гэрэлтүүлнэ */}
      <directionalLight ref={rim} position={[1.5, 2.2, -5]} />
      <directionalLight ref={rim2} position={[-2.5, 0.5, -4]} />
      {/* Доороос бага зэргийн fill */}
      <directionalLight ref={fill} position={[3, -1.5, 2]} />

      <Environment resolution={128} frames={1}>
        {/* Студийн гэрэл: дээрээс том softbox, хажуугаас дулаан champagne тусгал — өнгө нь ертөнцөөс */}
        <color attach="background" args={["#140A0F"]} />
        <Lightformer form="rect" color="#F4ECE2" intensity={2} position={[0, 5, 2]} scale={[8, 3, 1]} target />
        <Lightformer form="circle" color="#E9CFC8" intensity={1.1} position={[-5, 1, -3]} scale={4} target />
        <Lightformer form="rect" color="#C9AE84" intensity={0.7} position={[5, 0, 2]} scale={[2, 5, 1]} target />
      </Environment>
    </>
  );
}

function attachFog(scene: THREE.Scene, fog: THREE.Fog) {
  scene.fog = fog;
  return () => {
    scene.fog = null;
  };
}

/** w = бутархай ертөнцийн индекс; хөрш хоёр ертөнцийн өнгө, гэрлийг холино */
function blendWorld(
  scene: THREE.Scene,
  live: WorldColors,
  fog: THREE.Fog,
  lights: Lights,
  palettes: WorldColors[],
  worlds: readonly WorldSpec[],
  w: number,
  haze: number,
  p: FlowerParams,
) {
  const i = Math.floor(w);
  const j = Math.min(i + 1, worlds.length - 1);
  const f = w - i;
  const A = palettes[i];
  const B = palettes[j];
  const a = worlds[i];
  const b = worlds[j];

  live.inner.lerpColors(A.inner, B.inner, f);
  live.outer.lerpColors(A.outer, B.outer, f);
  fog.color.lerpColors(A.fog, B.fog, f);
  fog.near = lerp(FOG.near, HAZE.near, haze);
  fog.far = lerp(FOG.far, HAZE.far, haze);

  const { hemi, key, rim, rim2, fill } = lights;
  if (hemi) {
    hemi.color.lerpColors(A.sky, B.sky, f);
    hemi.groundColor.lerpColors(A.ground, B.ground, f);
    hemi.intensity = lerp(a.hemisphere.intensity, b.hemisphere.intensity, f);
  }
  if (key) {
    key.color.lerpColors(A.key, B.key, f);
    key.intensity = lerp(a.key.intensity, b.key.intensity, f) * p.keyIntensity;
  }
  const rimIntensity = lerp(a.rim.intensity, b.rim.intensity, f) * p.rimIntensity;
  if (rim) {
    rim.color.lerpColors(A.rim, B.rim, f);
    rim.intensity = rimIntensity;
  }
  if (rim2) {
    rim2.color.lerpColors(A.rim2, B.rim2, f);
    rim2.intensity = rimIntensity * 0.35;
  }
  if (fill) {
    fill.color.lerpColors(A.fill, B.fill, f);
    fill.intensity = lerp(a.fill.intensity, b.fill.intensity, f);
  }
  // Environment-ийн cubemap нэг удаа bake хийгдэнэ (neutral); ертөнц бүр зөвхөн хүчийг нь өөрчилнө
  scene.environmentIntensity = lerp(a.envIntensity, b.envIntensity, f) * p.envIntensity;
}
