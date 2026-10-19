"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { getScrollVelocity } from "@/lib/scrollMotion";
import { clamp01, easeInOutCubic, GOLDEN_ANGLE, lerp, mulberry32, smoothstep } from "./math";
import type { FlowerParams } from "./params";
import {
  createPalette,
  createPetalGeometry,
  createPetalMaterial,
  createSharedPetalUniforms,
  PETAL_SEGMENTS,
  type PetalUniforms,
  type SharedPetalUniforms,
} from "./petalMaterial";
import { Stamens } from "./Stamens";
import { Stem } from "./Stem";
import {
  applyStemSway,
  createFlap,
  createWindSim,
  resetFlap,
  resetWindSim,
  stepFlap,
  stepWindSim,
  updateWindUniforms,
  type WindConfig,
  type WindSim,
} from "./wind";

type PetalSpec = FlowerSpec["petals"];
type SepalSpec = NonNullable<FlowerSpec["sepals"]>;

type PetalLayout = {
  /** 0 = хамгийн дотор давхарга, 1 = гадна */
  t: number;
  azimuth: number;
  len: number;
  wid: number;
  tilt: number;
  seed: number;
};

/**
 * Давхарга (whorl) бүрийн дэлбээг байрлуулна. spiral: golden angle-аар үргэлжилсэн индекс
 * (цээнэ, сарнай). whorled: давхарга бүр жигд тархаж, дараагийнх нь хагас алхмаар шилжинэ
 * (алтанзул, сараана — 3 + 3).
 */
function layoutPetals(P: PetalSpec): PetalLayout[] {
  const rand = mulberry32(7);
  const specs: PetalLayout[] = [];
  const whorls = P.counts.length;
  let index = 0;
  for (let w = 0; w < whorls; w++) {
    const t = whorls > 1 ? w / (whorls - 1) : 1;
    const count = P.counts[w];
    for (let k = 0; k < count; k++, index++) {
      const azimuth =
        P.arrangement === "spiral" ? index * GOLDEN_ANGLE : ((k + (w % 2) * 0.5) / count) * Math.PI * 2;
      specs.push({
        t,
        azimuth: azimuth + (rand() - 0.5) * P.jitter,
        len: 1 + (rand() - 0.5) * 0.14,
        wid: 1 + (rand() - 0.5) * 0.12,
        tilt: (rand() - 0.5) * 0.12,
        seed: rand(),
      });
    }
  }
  return specs;
}

type Props = {
  spec: FlowerSpec;
  params: FlowerParams;
  wind: WindConfig;
  reducedMotion: boolean;
  /** Өгвөл params.bloom-ийн оронд кадр бүр эндээс уншина (scroll-driven нүүр хуудас) */
  bloom?: RefObject<number>;
  /** Өгвөл толгойн world байрлалыг кадр бүр энд бичнэ (ScrollRig камерын dive-д дагана) */
  focus?: THREE.Vector3;
  /** Дэлбээ/навчны geometry-ийн segment — чанарын түвшнээр (quality.ts) */
  segments?: number;
};

const TIP = new THREE.Vector3();

/**
 * FlowerSpec-ээр удирдагдах цэцэг: дэлбээний давхарга, sepal, гол хэсэг, иш, навч.
 * Дэлбээ бүр нэг shader program хуваалцана (petalMaterial) — ялгаа нь зөвхөн uniform-д.
 */
export function Flower({ spec, params, wind, reducedMotion, bloom: bloomRef, focus, segments = PETAL_SEGMENTS }: Props) {
  // useFrame нь хамгийн сүүлийн параметрийг ref-ээс уншина
  const paramsRef = useRef(params);
  const windRef = useRef(wind);
  useLayoutEffect(() => {
    paramsRef.current = params;
    windRef.current = wind;
  });

  const head = useRef<THREE.Group>(null);
  const petalMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const sepalMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const stamens = useRef<THREE.Group>(null);

  const shared = useMemo(() => createSharedPetalUniforms(), []);
  const sim = useMemo(() => createWindSim(), []);
  const petalGeometry = useMemo(() => createPetalGeometry(segments), [segments]);

  const petals = useMemo(() => {
    const palette = createPalette(spec.petals.colors, spec.petals.outline);
    return layoutPetals(spec.petals).map((layout) => ({
      layout,
      flap: createFlap(layout.t, layout.seed),
      ...createPetalMaterial(palette, shared, layout.seed),
    }));
  }, [spec.petals, shared]);

  const sepals = useMemo(() => {
    const S = spec.sepals;
    if (!S) return [];
    const palette = createPalette(S.colors, S.outline, 1);
    return Array.from({ length: S.count }, (_, i) => ({
      azimuth: (i / S.count) * Math.PI * 2 + 0.3,
      // Sepal хатуу — дотор давхаргын хөдөлгөөнтэй тэнцүү
      flap: createFlap(0, (i * 0.137 + 0.31) % 1),
      ...createPetalMaterial(palette, shared, i * 0.137),
    }));
  }, [spec.sepals, shared]);

  const receptacle = useMemo(
    () => ({
      geometry: new THREE.SphereGeometry(1, 24, 16),
      material: new THREE.MeshPhysicalMaterial({
        color: spec.center.receptacle.color,
        roughness: 0.5,
        sheen: 0.4,
        sheenColor: new THREE.Color("#B9D49A"),
      }),
    }),
    [spec.center.receptacle.color],
  );

  useEffect(() => () => petals.forEach((p) => p.material.dispose()), [petals]);
  useEffect(() => () => sepals.forEach((s) => s.material.dispose()), [sepals]);
  useEffect(
    () => () => {
      receptacle.geometry.dispose();
      receptacle.material.dispose();
    },
    [receptacle],
  );
  useEffect(() => () => petalGeometry.dispose(), [petalGeometry]);

  useFrame((_, delta) => {
    const p = paramsRef.current;
    const cfg = windRef.current;
    const dt = Math.min(delta, 1 / 30);
    const bloom = bloomRef ? bloomRef.current : p.bloom;
    updateShared(shared, p);

    for (let i = 0; i < petals.length; i++) {
      const mesh = petalMeshes.current[i];
      if (!mesh) continue;
      updatePetal(mesh, petals[i], spec.petals, p, bloom);
      if (reducedMotion) resetFlap(petals[i].flap, petals[i].uniforms);
      else stepFlap(petals[i].flap, mesh.matrixWorld, petals[i].uniforms, sim, cfg, dt);
    }

    // Sepal нахиаг тэврэх → хамгийн түрүүнд доош нээгдэнэ
    if (spec.sepals) {
      const sepalProgress = easeInOutCubic(clamp01(bloom / 0.5));
      for (let i = 0; i < sepals.length; i++) {
        const mesh = sepalMeshes.current[i];
        if (!mesh) continue;
        updateSepal(mesh, sepals[i].uniforms, spec.sepals, sepalProgress);
        if (reducedMotion) resetFlap(sepals[i].flap, sepals[i].uniforms);
        else stepFlap(sepals[i].flap, mesh.matrixWorld, sepals[i].uniforms, sim, cfg, dt);
      }
    }

    // Гол хэсэг дотор давхарга нээгдэх үед л ургаж гарна
    if (stamens.current) stamens.current.scale.setScalar(lerp(0.35, 1, smoothstep(0.35, 0.95, bloom)));
  });

  const r = spec.center.receptacle.size;

  return (
    <group>
      {/* Эхний хүүхэд байх ёстой: useFrame нь Stem болон Flower-ийнхээс өмнө бүртгэгдэж sim-ийг алхуулна */}
      <WindDriver
        sim={sim}
        wind={windRef}
        shared={shared}
        head={head}
        focus={focus}
        stemLength={spec.stem.length}
        reducedMotion={reducedMotion}
      />
      {/* Толгой ишний үзүүрийг дагаж хазайна */}
      <group ref={head}>
        <group rotation-x={spec.headTilt}>
          {petals.map(({ layout, material }, i) => (
            <group key={i} rotation-y={layout.azimuth}>
              <mesh
                ref={(m) => {
                  petalMeshes.current[i] = m;
                }}
                geometry={petalGeometry}
                material={material}
                frustumCulled={false}
              />
            </group>
          ))}
          {sepals.map(({ azimuth, material }, i) => (
            <group key={i} rotation-y={azimuth}>
              <mesh
                ref={(m) => {
                  sepalMeshes.current[i] = m;
                }}
                geometry={petalGeometry}
                material={material}
                frustumCulled={false}
              />
            </group>
          ))}
          <mesh
            geometry={receptacle.geometry}
            material={receptacle.material}
            position-y={-r * 0.46}
            scale={[r, r * 0.77, r]}
          />
          <group ref={stamens} position-y={0.005}>
            <Stamens center={spec.center} />
          </group>
        </group>
      </group>
      <Stem
        spec={spec}
        segments={segments}
        shared={shared}
        sim={sim}
        wind={windRef}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}

type WindDriverProps = {
  sim: WindSim;
  wind: RefObject<WindConfig>;
  shared: SharedPetalUniforms;
  head: RefObject<THREE.Group | null>;
  focus?: THREE.Vector3;
  stemLength: number;
  reducedMotion: boolean;
};

/** Кадр бүр салхи + ишний spring-ийг алхуулж, GPU uniform болон толгойн байрлалыг шинэчилнэ. */
function WindDriver({ sim, wind, shared, head, focus, stemLength, reducedMotion }: WindDriverProps) {
  useFrame((_, delta) => {
    const cfg = wind.current;
    // reduced motion: салхигүй статик төлөв
    if (reducedMotion) resetWindSim(sim);
    else stepWindSim(sim, cfg, Math.min(delta, 1 / 30), getScrollVelocity());
    updateWindUniforms(shared, sim, cfg);
    if (!head.current) return;
    applyStemSway(head.current, TIP, sim, cfg, stemLength);
    if (focus) head.current.getWorldPosition(focus);
  });
  return null;
}

/**
 * Давхаргын байрлал (t) ба bloom-оос дэлбээний хэлбэр, хазайлтыг spec-ийн bud → open
 * муруйгаар тооцно. Гадна давхарга түрүүлж (stagger), дотор давхарга сүүлд нээгдэнэ.
 */
function updatePetal(
  mesh: THREE.Mesh,
  { layout: s, uniforms: u, material }: { layout: PetalLayout; uniforms: PetalUniforms; material: THREE.MeshPhysicalMaterial },
  P: PetalSpec,
  p: FlowerParams,
  bloom: number,
) {
  const t = s.t;
  const start = (1 - t) * P.stagger;
  const prog = easeInOutCubic(clamp01((bloom - start) / (1 - P.stagger)));

  const size = lerp(P.size[0], P.size[1], t ** P.sizeCurve) * lerp(P.budSize, 1, prog);
  const radius = lerp(P.radius[0], P.radius[1], t);

  const tiltBud = lerp(P.tiltBud[0], P.tiltBud[1], t);
  const tiltOpen = lerp(P.tiltOpen[0], P.tiltOpen[1], t ** P.tiltCurve);
  mesh.position.set(0, -t * P.drop, radius);
  // Ry(π): дэлбээний дотор тал (+Z) төв тэнхлэг рүү харна; Rx: гадагш хазайна
  mesh.rotation.set(lerp(tiltBud, tiltOpen, prog) + s.tilt, Math.PI, 0);

  u.uLength.value = P.length * p.length * s.len * size;
  u.uWidth.value = P.width * p.width * s.wid * lerp(P.widthScale[0], P.widthScale[1], t) * size;
  u.uCup.value = lerp(P.cupBud, Math.min(lerp(P.cupOpen[0], P.cupOpen[1], t) * p.cupAmount, 1.2), prog);
  u.uCurl.value = lerp(P.curlBud, lerp(P.curlOpen[0], P.curlOpen[1], t) * p.curlAmount, prog);
  u.uRuffle.value = lerp(P.ruffle[0], P.ruffle[1], t) * p.ruffle * lerp(P.ruffleBud, 1, prog);
  u.uAO.value = lerp(P.ao[0], P.ao[1], t);
  material.sheen = p.sheen;
}

function updateSepal(mesh: THREE.Mesh, u: PetalUniforms, S: SepalSpec, progress: number) {
  mesh.position.set(0, -0.07, 0.085);
  mesh.rotation.set(lerp(0.12, S.tiltOpen, progress), Math.PI, 0);
  u.uLength.value = S.length;
  u.uWidth.value = S.width;
  u.uCup.value = lerp(0.9, 0.55, progress);
  u.uCurl.value = lerp(-0.55, 0.35, progress);
  u.uRuffle.value = 0.1;
  u.uAO.value = 0.3;
}

function updateShared(shared: SharedPetalUniforms, p: FlowerParams) {
  shared.uTranslucency.value = p.translucency;
  shared.uVeins.value = p.veins;
}
