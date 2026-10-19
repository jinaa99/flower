"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp01, easeInOutCubic, GOLDEN_ANGLE, lerp, mulberry32, smoothstep } from "./math";
import type { FlowerParams } from "./params";
import {
  createPetalGeometry,
  createPetalMaterial,
  createSharedPetalUniforms,
  palettes,
  type PetalUniforms,
  type SharedPetalUniforms,
} from "./petalMaterial";
import { Stamens } from "./Stamens";
import { Stem } from "./Stem";

/** Толгой камер руу бага зэрэг хазайна — дэлбээний дотор тал харагдана */
export const HEAD_TILT = 0.5;

/** Гадна давхарга bloom=0-д, хамгийн дотор давхарга bloom=STAGGER-т нээгдэж эхэлнэ */
const STAGGER = 0.45;
const SEPAL_COUNT = 5;

type PetalSpec = {
  /** 0 = хамгийн дотор давхарга, 1 = гадна */
  t: number;
  azimuth: number;
  len: number;
  wid: number;
  tilt: number;
  seed: number;
};

/** Давхарга (whorl) бүрийн дэлбээг golden angle-аар үргэлжилсэн индексээр байрлуулна. */
function layoutPetals(whorls: number): PetalSpec[] {
  const rand = mulberry32(7);
  const specs: PetalSpec[] = [];
  let index = 0;
  for (let w = 0; w < whorls; w++) {
    const t = whorls > 1 ? w / (whorls - 1) : 1;
    // Дотроос гадагш 5 → 8 дэлбээ, хамгийн гадна 6 том «guard» дэлбээ
    const count = w === whorls - 1 ? 6 : Math.round(lerp(5, 8, t));
    for (let k = 0; k < count; k++, index++) {
      specs.push({
        t,
        azimuth: index * GOLDEN_ANGLE + (rand() - 0.5) * 0.12,
        len: 1 + (rand() - 0.5) * 0.14,
        wid: 1 + (rand() - 0.5) * 0.12,
        tilt: (rand() - 0.5) * 0.12,
        seed: rand(),
      });
    }
  }
  return specs;
}

type Props = { params: FlowerParams; reducedMotion: boolean };

export function Peony({ params, reducedMotion }: Props) {
  // useFrame нь хамгийн сүүлийн параметрийг ref-ээс уншина
  const paramsRef = useRef(params);
  useLayoutEffect(() => {
    paramsRef.current = params;
  });

  const root = useRef<THREE.Group>(null);
  const petalMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const sepalMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const stamens = useRef<THREE.Group>(null);

  const shared = useMemo(() => createSharedPetalUniforms(), []);
  const petalGeometry = useMemo(() => createPetalGeometry(), []);

  const petals = useMemo(
    () =>
      layoutPetals(params.whorls).map((spec) => ({
        spec,
        ...createPetalMaterial(palettes.peony, shared, spec.seed),
      })),
    [params.whorls, shared],
  );

  const sepals = useMemo(
    () =>
      Array.from({ length: SEPAL_COUNT }, (_, i) => ({
        azimuth: (i / SEPAL_COUNT) * Math.PI * 2 + 0.3,
        ...createPetalMaterial(palettes.sepal, shared, i * 0.137),
      })),
    [shared],
  );

  const receptacle = useMemo(
    () => ({
      geometry: new THREE.SphereGeometry(1, 24, 16),
      material: new THREE.MeshPhysicalMaterial({
        color: "#557243",
        roughness: 0.5,
        sheen: 0.4,
        sheenColor: new THREE.Color("#B9D49A"),
      }),
    }),
    [],
  );

  useEffect(() => () => petals.forEach((p) => p.material.dispose()), [petals]);
  useEffect(
    () => () => {
      sepals.forEach((s) => s.material.dispose());
      petalGeometry.dispose();
      receptacle.geometry.dispose();
      receptacle.material.dispose();
    },
    [sepals, petalGeometry, receptacle],
  );

  useFrame(({ clock }) => {
    const p = paramsRef.current;
    updateShared(shared, p);

    for (let i = 0; i < petals.length; i++) {
      const mesh = petalMeshes.current[i];
      if (mesh) updatePetal(mesh, petals[i], p);
    }

    // Sepal нахиаг тэврэх → хамгийн түрүүнд доош нээгдэнэ
    const sepalProgress = easeInOutCubic(clamp01(p.bloom / 0.5));
    for (let i = 0; i < sepals.length; i++) {
      const mesh = sepalMeshes.current[i];
      if (mesh) updateSepal(mesh, sepals[i].uniforms, sepalProgress);
    }

    // Гол хэсэг дотор давхарга нээгдэх үед л ургаж гарна
    if (stamens.current) stamens.current.scale.setScalar(lerp(0.35, 1, smoothstep(0.35, 0.95, p.bloom)));

    // Зөөлөн найгалт — reduced motion үед статик
    if (root.current) {
      const time = clock.elapsedTime;
      root.current.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.45) * 0.025;
      root.current.rotation.x = reducedMotion ? 0 : Math.sin(time * 0.31 + 1.3) * 0.015;
    }
  });

  return (
    <group ref={root}>
      <group rotation-x={HEAD_TILT}>
        {petals.map(({ spec, material }, i) => (
          <group key={i} rotation-y={spec.azimuth}>
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
          position-y={-0.06}
          scale={[0.13, 0.1, 0.13]}
        />
        <group ref={stamens} position-y={0.005}>
          <Stamens />
        </group>
      </group>
      <Stem headTilt={HEAD_TILT} shared={shared} />
    </group>
  );
}

/**
 * Давхаргын байрлал (t) ба bloom-оос дэлбээний хэлбэр, хазайлтыг тооцно.
 * Нахиа: үзүүр дотогш эргэсэн (сөрөг curl) бөмбөлөг. Нээгдэхэд гадна давхарга
 * хэвтээ болж үзүүрээрээ гадагш эргэнэ, дотор давхарга босоо, хотгор хэвээр үлдэнэ.
 */
function updatePetal(
  mesh: THREE.Mesh,
  { spec: s, uniforms: u, material }: { spec: PetalSpec; uniforms: PetalUniforms; material: THREE.MeshPhysicalMaterial },
  p: FlowerParams,
) {
  const t = s.t;
  const start = (1 - t) * STAGGER;
  const prog = easeInOutCubic(clamp01((p.bloom - start) / (1 - STAGGER)));

  const size = lerp(0.46, 1, t ** 0.8) * lerp(0.72, 1, prog);
  const radius = lerp(0.02, 0.1, t);

  const tiltBud = lerp(0.12, 0.3, t);
  const tiltOpen = lerp(0.28, 1.35, t ** 1.3);
  mesh.position.set(0, -t * 0.05, radius);
  // Ry(π): дэлбээний дотор тал (+Z) төв тэнхлэг рүү харна; Rx: гадагш хазайна
  mesh.rotation.set(lerp(tiltBud, tiltOpen, prog) + s.tilt, Math.PI, 0);

  u.uLength.value = p.length * s.len * size;
  u.uWidth.value = p.width * s.wid * lerp(0.8, 1.05, t) * size;
  u.uCup.value = lerp(0.75, Math.min(p.cupAmount * lerp(1.7, 1, t), 1.2), prog);
  u.uCurl.value = lerp(-0.8, p.curlAmount * lerp(-0.7, 1, t), prog);
  u.uRuffle.value = p.ruffle * lerp(1.4, 0.8, t) * lerp(0.35, 1, prog);
  u.uAO.value = lerp(0.8, 0.2, t);
  material.sheen = p.sheen;
}

function updateSepal(mesh: THREE.Mesh, u: PetalUniforms, progress: number) {
  mesh.position.set(0, -0.07, 0.085);
  mesh.rotation.set(lerp(0.12, 1.75, progress), Math.PI, 0);
  u.uLength.value = 0.5;
  u.uWidth.value = 0.34;
  u.uCup.value = lerp(0.9, 0.55, progress);
  u.uCurl.value = lerp(-0.55, 0.35, progress);
  u.uRuffle.value = 0.1;
  u.uAO.value = 0.3;
}

function updateShared(shared: SharedPetalUniforms, p: FlowerParams) {
  shared.uTranslucency.value = p.translucency;
  shared.uVeins.value = p.veins;
}
