"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { lerp } from "./math";
import { createPalette, createPetalGeometry, createPetalMaterial, type SharedPetalUniforms } from "./petalMaterial";
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
/** Ёроолдоо нарийсна (дээд радиусын харьцаа) */
const TAPER = 0.68;
/** Ишний муруйн хэлбэрийг энэ уртад зохиосон — бусад урт пропорциональ сунана */
const BASE_LENGTH = 3.4;

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
  /** Ишний ёроол y = −spec.stem.length, үзүүр (толгой) y = 0 */
  spec: FlowerSpec;
  /** Навчны geometry-ийн segment */
  segments: number;
  shared: SharedPetalUniforms;
  sim: WindSim;
  wind: RefObject<WindConfig>;
  reducedMotion: boolean;
};

/**
 * Иш (CatmullRom → TubeGeometry, доошоо нарийсна) ба 2 навч. Толгойн хазайлттай дээд шүргэгчээ таарна.
 * Салхинд иш GPU дээр нугарч, навч нугаралтыг дагаж өөрийн spring-ээр хийсэнэ.
 */
export function Stem({ spec, segments, shared, sim, wind, reducedMotion }: Props) {
  const { headTilt, stem } = spec;
  const { curve, geometry, material } = useMemo(() => {
    const axis = new THREE.Vector3(0, -Math.cos(headTilt), -Math.sin(headTilt));
    const k = stem.length / BASE_LENGTH;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      axis.clone().multiplyScalar(0.45),
      new THREE.Vector3(0.05, -1.3 * k, -0.24),
      new THREE.Vector3(-0.04, -2.3 * k, -0.14),
      new THREE.Vector3(0.02, -stem.length, -0.02),
    ]);

    const geometry = new THREE.TubeGeometry(curve, TUBULAR, 1, RADIAL, false);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color(stem.top);
    const bottom = new THREE.Color(stem.bottom);
    const col = new THREE.Color();
    const center = new THREE.Vector3();
    const v = new THREE.Vector3();
    for (let i = 0; i <= TUBULAR; i++) {
      const t = i / TUBULAR;
      curve.getPointAt(t, center);
      const r = stem.radius * lerp(1, TAPER, t);
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
    material.userData.uniforms = { ...shared, uStemLength: { value: stem.length } };
    material.onBeforeCompile = onBeforeCompileStem;
    return { curve, geometry, material };
  }, [headTilt, stem, shared]);

  const leaves = useMemo(() => {
    const geometry = createPetalGeometry(segments);
    const palette = createPalette(spec.leaves.colors, spec.leaves.outline, 1);
    const items = spec.leaves.items.map((leaf) => {
      const { material, uniforms } = createPetalMaterial(palette, shared, leaf.seed);
      uniforms.uLength.value = leaf.length;
      uniforms.uWidth.value = leaf.width;
      uniforms.uCup.value = 0.35;
      uniforms.uCurl.value = leaf.curl;
      uniforms.uRuffle.value = 0.15;
      uniforms.uAO.value = 0.25;
      return { ...leaf, material, uniforms, flap: createFlap(1, leaf.seed), position: curve.getPointAt(leaf.at) };
    });
    return { geometry, items };
  }, [curve, spec.leaves, segments, shared]);

  const leafAnchors = useRef<(THREE.Group | null)[]>([]);
  const leafMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // Flower-ийн WindDriver энэ кадрын sim-ийг аль хэдийн алхуулсан (useFrame бүртгэлийн дараалал)
  useFrame((_, delta) => {
    const cfg = wind.current;
    const dt = Math.min(delta, 1 / 30);
    for (let i = 0; i < leaves.items.length; i++) {
      const leaf = leaves.items[i];
      const anchor = leafAnchors.current[i];
      const mesh = leafMeshes.current[i];
      if (anchor) applyStemSway(anchor, leaf.position, sim, cfg, stem.length);
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
              position-z={stem.radius * 0.6}
              rotation={[leaf.tilt, Math.PI, 0]}
              frustumCulled={false}
            />
          </group>
        </group>
      ))}
    </group>
  );
}
