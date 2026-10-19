"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GOLDEN_ANGLE, lerp, mulberry32 } from "./math";

const STAMEN_COUNT = 90;
const PISTIL_COUNT = 5;
const INNER_RADIUS = 0.045;
const OUTER_RADIUS = 0.15;

const _obj = new THREE.Object3D();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/**
 * Цэцгийн гол: Vogel спираль (golden angle)-аар байрласан дохиур (filament + anther)
 * болон төвийн үрийн сав. Бүгд instanced — 3 draw call.
 */
export function Stamens() {
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
      filament: new THREE.MeshStandardMaterial({ color: "#EFD9A8", roughness: 0.6 }),
      anther: new THREE.MeshPhysicalMaterial({
        color: "#D9AE4E",
        roughness: 0.55,
        sheen: 0.6,
        sheenColor: new THREE.Color("#F3D58A"),
        emissive: new THREE.Color("#5A3A10"),
        emissiveIntensity: 0.25,
      }),
      pistil: new THREE.MeshPhysicalMaterial({ color: "#B97A86", roughness: 0.45, sheen: 0.5, sheenColor: new THREE.Color("#F6DDE0") }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const rand = mulberry32(42);
    for (let i = 0; i < STAMEN_COUNT; i++) {
      // Vogel спираль: r ∝ √i жигд нягтралтай
      const f = Math.sqrt((i + 0.5) / STAMEN_COUNT);
      const r = lerp(INNER_RADIUS, OUTER_RADIUS, f);
      const theta = i * GOLDEN_ANGLE;
      const lean = lerp(0.25, 0.85, f) + (rand() - 0.5) * 0.25;
      const height = lerp(0.15, 0.09, f) * (0.85 + rand() * 0.3);

      // Гадагш хазайсан чиглэл
      _dir.set(Math.cos(theta) * Math.sin(lean), Math.cos(lean), Math.sin(theta) * Math.sin(lean)).normalize();
      _obj.position.set(Math.cos(theta) * r, 0, Math.sin(theta) * r);
      _obj.quaternion.setFromUnitVectors(_up, _dir);
      _obj.scale.set(1, height, 1);
      _obj.updateMatrix();
      filaments.current!.setMatrixAt(i, _obj.matrix);

      _obj.position.addScaledVector(_dir, height);
      _obj.scale.set(0.011, 0.022, 0.011);
      _obj.updateMatrix();
      anthers.current!.setMatrixAt(i, _obj.matrix);
    }
    for (let i = 0; i < PISTIL_COUNT; i++) {
      const theta = (i / PISTIL_COUNT) * Math.PI * 2;
      _dir.set(Math.cos(theta) * 0.35, 1, Math.sin(theta) * 0.35).normalize();
      _obj.position.set(Math.cos(theta) * 0.018, 0.02, Math.sin(theta) * 0.018);
      _obj.quaternion.setFromUnitVectors(_up, _dir);
      _obj.scale.set(0.017, 0.045, 0.017);
      _obj.updateMatrix();
      pistils.current!.setMatrixAt(i, _obj.matrix);
    }
    for (const mesh of [filaments.current!, anthers.current!, pistils.current!]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, []);

  useLayoutEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  return (
    <group>
      <instancedMesh ref={filaments} args={[geometries.filament, materials.filament, STAMEN_COUNT]} />
      <instancedMesh ref={anthers} args={[geometries.anther, materials.anther, STAMEN_COUNT]} />
      <instancedMesh ref={pistils} args={[geometries.pistil, materials.pistil, PISTIL_COUNT]} />
    </group>
  );
}
