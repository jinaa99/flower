"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { GOLDEN_ANGLE, lerp, mulberry32 } from "./math";

const _obj = new THREE.Object3D();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/**
 * Цэцгийн гол: Vogel спираль (golden angle)-аар байрласан дохиур (filament + anther)
 * болон төвийн үрийн сав. Бүгд instanced — 3 draw call. Тоо, хэмжээ, өнгө нь spec.center-ээс
 * (цээнэ — 90 богино дохиур, сараана — 6 урт дохиур + урт үрийн сав гэх мэт).
 */
export function Stamens({ center }: { center: FlowerSpec["center"] }) {
  const { stamens: S, pistil: P } = center;
  const filaments = useRef<THREE.InstancedMesh>(null);
  const anthers = useRef<THREE.InstancedMesh>(null);
  const pistils = useRef<THREE.InstancedMesh>(null);

  const geometries = useMemo(() => {
    const filament = new THREE.CylinderGeometry(0.0025, 0.004, 1, 5, 1, true).translate(0, 0.5, 0);
    const anther = new THREE.SphereGeometry(1, 8, 6);
    const pistil = new THREE.SphereGeometry(1, 12, 10);
    return { filament, anther, pistil };
  }, []);

  const materials = useMemo(
    () => ({
      filament: new THREE.MeshStandardMaterial({ color: S.filament, roughness: 0.6 }),
      anther: new THREE.MeshPhysicalMaterial({
        color: S.anther,
        roughness: 0.55,
        sheen: 0.6,
        sheenColor: new THREE.Color("#F3D58A"),
      }),
      pistil: new THREE.MeshPhysicalMaterial({ color: P.color, roughness: 0.45, sheen: 0.5, sheenColor: new THREE.Color("#F6DDE0") }),
    }),
    [S.filament, S.anther, P.color],
  );

  useLayoutEffect(() => {
    const rand = mulberry32(42);
    for (let i = 0; i < S.count; i++) {
      // Vogel спираль: r ∝ √i жигд нягтралтай
      const f = Math.sqrt((i + 0.5) / S.count);
      const r = lerp(S.radius[0], S.radius[1], f);
      const theta = i * GOLDEN_ANGLE;
      const lean = lerp(S.lean[0], S.lean[1], f) + (rand() - 0.5) * 0.25;
      const height = lerp(S.height[0], S.height[1], f) * (0.85 + rand() * 0.3);

      // Гадагш хазайсан чиглэл
      _dir.set(Math.cos(theta) * Math.sin(lean), Math.cos(lean), Math.sin(theta) * Math.sin(lean)).normalize();
      _obj.position.set(Math.cos(theta) * r, 0, Math.sin(theta) * r);
      _obj.quaternion.setFromUnitVectors(_up, _dir);
      _obj.scale.set(1, height, 1);
      _obj.updateMatrix();
      filaments.current?.setMatrixAt(i, _obj.matrix);

      _obj.position.addScaledVector(_dir, height);
      _obj.scale.set(S.antherSize[0], S.antherSize[1], S.antherSize[0]);
      _obj.updateMatrix();
      anthers.current?.setMatrixAt(i, _obj.matrix);
    }
    for (let i = 0; i < P.count; i++) {
      const theta = (i / P.count) * Math.PI * 2;
      // Нэг үрийн сав (сараана) босоо, олон бол гадагш бага зэрэг хазайна
      const splay = P.count > 1 ? 0.35 : 0;
      _dir.set(Math.cos(theta) * splay, 1, Math.sin(theta) * splay).normalize();
      _obj.position.set(Math.cos(theta) * P.spread, 0.02, Math.sin(theta) * P.spread);
      _obj.quaternion.setFromUnitVectors(_up, _dir);
      _obj.scale.set(P.size[0], P.size[1], P.size[0]);
      _obj.updateMatrix();
      pistils.current?.setMatrixAt(i, _obj.matrix);
    }
    for (const mesh of [filaments.current, anthers.current, pistils.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [S, P]);

  useLayoutEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  return (
    <group>
      {S.count > 0 && (
        <>
          <instancedMesh ref={filaments} args={[geometries.filament, materials.filament, S.count]} receiveShadow />
          <instancedMesh ref={anthers} args={[geometries.anther, materials.anther, S.count]} castShadow receiveShadow />
        </>
      )}
      {P.count > 0 && <instancedMesh ref={pistils} args={[geometries.pistil, materials.pistil, P.count]} castShadow receiveShadow />}
    </group>
  );
}
