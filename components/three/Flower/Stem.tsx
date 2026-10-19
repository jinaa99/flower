"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { lerp } from "./math";
import { createPetalGeometry, createPetalMaterial, palettes, type SharedPetalUniforms } from "./petalMaterial";
import {
  applyStemSway,
  createFlap,
  resetFlap,
  stepFlap,
  windVertexPars,
  type WindConfig,
  type WindSim,
} from "./wind";

const TUBULAR = 96;
const RADIAL = 10;
const RADIUS_TOP = 0.05;
const RADIUS_BOTTOM = 0.034;
/** Ишний ёроол y = −STEM_LENGTH, үзүүр (толгой) y = 0 */
export const STEM_LENGTH = 3.4;

const LEAVES = [
  { at: 0.36, azimuth: 1.15, tilt: 0.95, length: 1.15, width: 0.42, curl: 0.55, seed: 0.21 },
  { at: 0.6, azimuth: -1.7, tilt: 1.05, length: 1.0, width: 0.38, curl: 0.7, seed: 0.67 },
];

const stemVertexPars = /* glsl */ `
${windVertexPars}
uniform vec2 uStemBend;
uniform float uStemLength;
`;

/**
 * Үзүүрийн хазайлтыг h^n жингээр (wind.ts applyStemSway-тай ижил) тараана.
 * Дунд хэсэгт салхины чиглэлд жижиг чичиргээ — sin(πh) тул ёроол, толгой хөдлөхгүй.
 */
const stemBend = /* glsl */ `
#include <begin_vertex>
float stemH = clamp(1.0 + position.y / uStemLength, 0.0, 1.0);
transformed.xz += uStemBend * pow(stemH, uBendWeight);
float stemShiver = windNoise(vec3(position.y * 0.8, uWindTime * 1.7, 3.1)) * sin(PI * stemH);
transformed.xz += uWindDir.xz * stemShiver * uWindStrength * 0.006;
`;

type StemMaterial = THREE.MeshPhysicalMaterial & { userData: { uniforms: Record<string, THREE.IUniform> } };

function onBeforeCompileStem(this: StemMaterial, shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, this.userData.uniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${stemVertexPars}`)
    .replace("#include <begin_vertex>", stemBend);
}

type Props = {
  headTilt: number;
  shared: SharedPetalUniforms;
  sim: WindSim;
  wind: RefObject<WindConfig>;
  reducedMotion: boolean;
};

/**
 * Иш (CatmullRom → TubeGeometry, доошоо нарийсна) ба 2 навч. Толгойн хазайлттай дээд шүргэгчээ таарна.
 * Салхинд иш GPU дээр нугарч, навч нугаралтыг дагаж өөрийн spring-ээр хийсэнэ.
 */
export function Stem({ headTilt, shared, sim, wind, reducedMotion }: Props) {
  const { curve, geometry, material } = useMemo(() => {
    const axis = new THREE.Vector3(0, -Math.cos(headTilt), -Math.sin(headTilt));
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      axis.clone().multiplyScalar(0.45),
      new THREE.Vector3(0.05, -1.3, -0.24),
      new THREE.Vector3(-0.04, -2.3, -0.14),
      new THREE.Vector3(0.02, -STEM_LENGTH, -0.02),
    ]);

    const geometry = new THREE.TubeGeometry(curve, TUBULAR, 1, RADIAL, false);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color("#6E4A3F"); // peony-ийн иш дээд хэсэгтээ улаавтар
    const bottom = new THREE.Color("#4A6B3A");
    const col = new THREE.Color();
    const center = new THREE.Vector3();
    const v = new THREE.Vector3();
    for (let i = 0; i <= TUBULAR; i++) {
      const t = i / TUBULAR;
      curve.getPointAt(t, center);
      const r = lerp(RADIUS_TOP, RADIUS_BOTTOM, t);
      col.lerpColors(top, bottom, Math.min(t * 3.5, 1));
      for (let j = 0; j <= RADIAL; j++) {
        const idx = i * (RADIAL + 1) + j;
        v.fromBufferAttribute(pos, idx).sub(center).multiplyScalar(r).add(center);
        pos.setXYZ(idx, v.x, v.y, v.z);
        col.toArray(colors, idx * 3);
      }
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    const material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.5,
      sheen: 0.4,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#B9D49A"),
    }) as StemMaterial;
    material.userData.uniforms = { ...shared, uStemLength: { value: STEM_LENGTH } };
    material.onBeforeCompile = onBeforeCompileStem;
    return { curve, geometry, material };
  }, [headTilt, shared]);

  const leaves = useMemo(() => {
    const geometry = createPetalGeometry();
    const items = LEAVES.map((leaf) => {
      const { material, uniforms } = createPetalMaterial(palettes.leaf, shared, leaf.seed);
      uniforms.uLength.value = leaf.length;
      uniforms.uWidth.value = leaf.width;
      uniforms.uCup.value = 0.35;
      uniforms.uCurl.value = leaf.curl;
      uniforms.uRuffle.value = 0.15;
      uniforms.uAO.value = 0.25;
      return { ...leaf, material, uniforms, flap: createFlap(1, leaf.seed), position: curve.getPointAt(leaf.at) };
    });
    return { geometry, items };
  }, [curve, shared]);

  const leafAnchors = useRef<(THREE.Group | null)[]>([]);
  const leafMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // Peony-ийн WindDriver энэ кадрын sim-ийг аль хэдийн алхуулсан (useFrame бүртгэлийн дараалал)
  useFrame((_, delta) => {
    const cfg = wind.current;
    const dt = Math.min(delta, 1 / 30);
    for (let i = 0; i < leaves.items.length; i++) {
      const leaf = leaves.items[i];
      const anchor = leafAnchors.current[i];
      const mesh = leafMeshes.current[i];
      if (anchor) applyStemSway(anchor, leaf.position, sim, cfg, STEM_LENGTH);
      if (!mesh) continue;
      if (reducedMotion) resetFlap(leaf.flap, leaf.uniforms);
      else stepFlap(leaf.flap, mesh.matrixWorld, leaf.uniforms, sim, cfg, dt);
    }
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      leaves.geometry.dispose();
      leaves.items.forEach((l) => l.material.dispose());
    },
    [geometry, material, leaves],
  );

  return (
    <group>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      {leaves.items.map((leaf, i) => (
        <group
          key={i}
          ref={(g) => {
            leafAnchors.current[i] = g;
          }}
          position={leaf.position}
        >
          <group rotation-y={leaf.azimuth}>
            {/* Ry(π): дэлбээний +Z (дотор тал) ишийг харна; Rx(tilt): гадагш хазайна */}
            <mesh
              ref={(m) => {
                leafMeshes.current[i] = m;
              }}
              geometry={leaves.geometry}
              material={leaf.material}
              position-z={RADIUS_TOP * 0.6}
              rotation={[leaf.tilt, Math.PI, 0]}
              frustumCulled={false}
            />
          </group>
        </group>
      ))}
    </group>
  );
}
