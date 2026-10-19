"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { journeyLength, scrollMotion, STAGE } from "@/lib/scrollMotion";
import type { JourneyState } from "./journey";
import { clamp01, lerp } from "./math";

/** Цэцгийн толгойноос бага зэрэг доош — дэлбээлсэн толгой дэлгэцийн төвөөс дээгүүр, header-т тулахгүй */
const TARGET = new THREE.Vector3(0, 0.2, 0);

/** Шатны эхэн → dive: зөөлөн тойрч (azimuth), бага зэрэг доошилж, ойртоно */
const ORBIT = {
  azimuth: [-0.55, 0.4],
  elevation: [0.36, 0.22],
  distance: [6.6, 5.7],
} as const;

const DIVE = { fov: 40, near: 0.04 } as const;
/** Гарц: камер шинэ ертөнцөд энэ үржвэртэй зайнаас, бага зэрэг эргэлдэн ойртож ирнэ */
const EMERGE = { distance: 1.8, azimuth: -0.6 } as const;

/** Damping-ийн хурд (1/сек) — их байх тусам scroll-ийг ойр дагана */
const DAMPING = 3.2;
/** Нарийн (босоо) дэлгэцэнд дэлбээлсэн толгой өргөнөөрөө багтахаар камерыг холдуулна */
const FIT_ASPECT = 0.85;
/** Цэцгийг гарчгаас холдуулах view offset (дэлгэцийн хувь) */
const OFFSET_LANDSCAPE = 0.14;
const OFFSET_PORTRAIT = 0.16;

const _target = new THREE.Vector3();
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type Props = {
  specs: readonly FlowerSpec[];
  journey: JourneyState;
  /** Цэцэг бүрийн bloom — Flower кадр бүр уншина */
  blooms: readonly RefObject<number>[];
  /** Цэцэг бүрийн толгойн world байрлал (Flower бичнэ) — dive үед салхиар найгах толгойг дагана */
  foci: readonly THREE.Vector3[];
  /** Цэцэг бүрийн гадна group — харагдах эсэх, гарч ирэх хөдөлгөөн */
  groups: RefObject<(THREE.Group | null)[]>;
  /** Шат солигдох үед (FlowerScene одоогийн + дараагийн цэцгийг mount хийнэ) */
  onStage: (stage: number) => void;
  reducedMotion: boolean;
};

/**
 * Аяллын scroll progress-ийг (scrollMotion.hero) damping-тэй дагаж, P = stage + local болгоно.
 * Шат доторх камерын бүх зам (orbit → цэцгийн гол руу dive, FOV, view offset), dissolve,
 * гарцыг нэг paused GSAP timeline тодорхойлно — timeline.progress(local).
 * Гарц: зураг голоосоо нээгдэж, ард нь дараагийн ертөнц мананцараас тодорч, шинэ нахиа
 * доороос ургаж гарна, камер холоос эргэлдэн ойртоно. Scrub тул буцаахад бүгд урвуу явна.
 * Reduced motion: эхний цэцэг бүрэн дэлбээлсэн, хөдөлгөөнгүй камер.
 */
export function ScrollRig({ specs, journey, blooms, foci, groups, onStage, reducedMotion }: Props) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const total = journeyLength(specs.length);
  const progress = useRef(scrollMotion.hero * total);
  const distanceScale = useRef(1);
  const stageRef = useRef(-1);

  // Timeline-ий tween-үүд энэ object-ийг шууд mutate хийнэ — кадр бүр шинэ object үүсэхгүй.
  // Сувгууд хэвийн (0–1); геометр нь spec-ээс (толгойн хазайлт, dive-ийн зай) кадр бүр тооцогдоно.
  const rig = useMemo(
    () => ({ orbit: 0, diveAngle: 0, diveDistance: 0, fit: 1, follow: 0, fov: 30, near: 0.1, dissolve: 0, exit: 0 }),
    [],
  );

  const timeline = useMemo(() => {
    const S = STAGE;
    const dive = S.diveEnd - S.diveStart;
    // Байрлал, үргэлжлэх хугацаа нь шат доторх progress-ийн хувь (нийт = 1)
    return gsap
      .timeline({ paused: true, defaults: { ease: "none" } })
      .to(rig, { orbit: 1, duration: S.diveStart }, 0)
      .to(rig, { diveAngle: 1, duration: dive, ease: "sine.inOut" }, S.diveStart)
      // Зайг log орон зайд — ойртолт тогтмол хурдтай мэдрэгдэнэ
      .to(rig, { diveDistance: 1, duration: dive, ease: "sine.in" }, S.diveStart)
      .to(rig, { fit: 0, follow: 1, duration: dive * 0.6, ease: "sine.inOut" }, S.diveStart)
      .to(rig, { fov: DIVE.fov, duration: dive, ease: "sine.inOut" }, S.diveStart)
      // Дотор дэлбээ камерт ойртох үед л near-ийг багасгана (depth нарийвчлалыг хэмнэнэ)
      .to(rig, { near: DIVE.near, duration: dive * 0.4 }, S.diveStart + dive * 0.5)
      .to(rig, { dissolve: 1, duration: S.dissolveEnd - S.dissolveStart, ease: "power1.inOut" }, S.dissolveStart)
      .to(rig, { exit: 1, duration: 1 - S.exitStart, ease: "power1.inOut" }, S.exitStart)
      .set({}, {}, 1);
  }, [rig]);

  useEffect(() => () => void timeline.kill(), [timeline]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    distanceScale.current = Math.max(1, FIT_ASPECT / (size.width / size.height));
    return () => {
      camera.clearViewOffset();
      camera.fov = 30;
      camera.near = 0.1;
      camera.updateProjectionMatrix();
    };
  }, [camera, size]);

  // Камерыг useFrame-ийн state-ээс авч өөрчилнө (hook-ийн утгыг mutate хийхгүй)
  useFrame(({ camera, size }, delta) => {
    const n = specs.length;
    const goal = scrollMotion.hero * total;
    let P: number = STAGE.diveStart;
    if (!reducedMotion) {
      P = THREE.MathUtils.damp(progress.current, goal, DAMPING, Math.min(delta, 1 / 30));
      // Хязгаарт ойртоод мөнхөд «мөлхөхгүй»
      if (Math.abs(P - goal) < 1e-4) P = goal;
    }
    progress.current = P;

    const stage = Math.min(Math.floor(P), n - 1);
    timeline.progress(clamp01(P - stage));
    if (stage !== stageRef.current) {
      stageRef.current = stage;
      onStage(stage);
    }

    const exiting = rig.exit > 0 && stage < n - 1;
    const shown = exiting ? stage + 1 : stage;
    const spec = specs[shown];
    const emerge = exiting ? easeOutCubic(rig.exit) : 1;

    writeJourney(journey, stage, shown, rig.dissolve, exiting ? rig.exit : 0);
    writeBlooms(blooms, stage, exiting ? 1 : clamp01((P - stage) / STAGE.bloomEnd));
    placeFlowers(groups.current, shown, emerge);

    // Камер: гарцын үед шинэ шатны эхлэлийн байрлал, холоос эргэлдэн ойртоно
    const fit = exiting ? 1 : rig.fit;
    const follow = exiting ? 0 : rig.follow;
    const orbit = exiting ? 0 : rig.orbit;
    const diveAngle = exiting ? 0 : rig.diveAngle;
    const diveDistance = exiting ? 0 : rig.diveDistance;

    const orbitAz = lerp(ORBIT.azimuth[0], ORBIT.azimuth[1], orbit) + EMERGE.azimuth * (1 - emerge);
    const orbitEl = lerp(ORBIT.elevation[0], ORBIT.elevation[1], orbit);
    const orbitLog =
      lerp(Math.log(ORBIT.distance[0]), Math.log(ORBIT.distance[1]), orbit) + Math.log(spec.camera.distance);
    const azimuth = lerp(orbitAz, 0, diveAngle);
    const elevation = lerp(orbitEl, Math.PI / 2 - spec.headTilt, diveAngle);
    const d =
      Math.exp(lerp(orbitLog, Math.log(spec.camera.dive), diveDistance)) *
      lerp(1, distanceScale.current, fit) *
      lerp(EMERGE.distance, 1, emerge);

    _target.lerpVectors(TARGET, foci[shown], follow);
    camera.position.set(
      _target.x + d * Math.cos(elevation) * Math.sin(azimuth),
      _target.y + d * Math.sin(elevation),
      _target.z + d * Math.cos(elevation) * Math.cos(azimuth),
    );
    camera.lookAt(_target);

    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = exiting ? 30 : rig.fov;
    camera.near = exiting ? 0.1 : rig.near;
    // Хэвтээ дэлгэцэнд цэцэг баруун тийш (зүүн талд гарчиг), босоо дэлгэцэнд дээш (доор гарчиг).
    // Dive үед offset 0 руу буурч цэцгийн гол дэлгэцийн төвд ирнэ. setViewOffset нь projection-ийг шинэчилнэ.
    const { width: w, height: h } = size;
    if (w >= h) camera.setViewOffset(w, h, -w * OFFSET_LANDSCAPE * fit, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * OFFSET_PORTRAIT * fit, w, h);
  });

  return null;
}

function writeJourney(journey: JourneyState, stage: number, shown: number, dissolve: number, exit: number) {
  journey.stage = stage;
  journey.shown = shown;
  journey.dissolveIn = dissolve;
  journey.dissolveOut = exit;
  journey.world = stage + exit;
  journey.haze = exit > 0 ? 1 - exit : 0;
}

/** Одоогийн цэцгийн bloom; дараагийнх нь гарч ирэх хүртлээ нахиа */
function writeBlooms(blooms: readonly RefObject<number>[], stage: number, bloom: number) {
  blooms[stage].current = bloom;
  if (stage + 1 < blooms.length) blooms[stage + 1].current = 0;
}

/** Зөвхөн харагдаж буй цэцэг render хийгдэнэ; шинэ нахиа доороос томорч ургана */
function placeFlowers(groups: (THREE.Group | null)[], shown: number, emerge: number) {
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (!g) continue;
    g.visible = i === shown;
    if (i !== shown) continue;
    g.scale.setScalar(lerp(0.55, 1, emerge));
    g.position.y = lerp(-0.7, 0, emerge);
  }
}
