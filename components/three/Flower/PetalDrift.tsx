"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getScrollVelocity } from "@/lib/scrollMotion";
import { lerp, mulberry32, smoothstep } from "./math";
import type { FlowerParams } from "./params";
import {
  createPetalGeometry,
  createPetalMaterial,
  createSharedPetalUniforms,
  palettes,
  type PetalUniforms,
  type SharedPetalUniforms,
} from "./petalMaterial";
import {
  createWindSim,
  fbm1,
  resetWindSim,
  sampleWind,
  stepWindSim,
  updateWindUniforms,
  type WindConfig,
  type WindSample,
} from "./wind";

/**
 * Scroll хийхэд дэлгэцийн гүн рүү урсах дэлбээний мөр.
 *
 * Нэг InstancedMesh, цэцгийн дэлбээтэй ижил shader (PETAL_DRIFT: seed, fade нь instance attribute).
 * Object pool: MAX слот нэг удаа үүсч, scroll-ийн хурдад пропорциональ тоогоор сул слот сэргэнэ.
 * Дэлбээ төрөх үеийнхээ камерын чиглэлээр гүн рүү урсаж, эргэлдэж (tumble), цэцэгтэй ижил
 * салхинд (sampleWind + scroll-ийн салхи) автагдана. Scroll зогсоход урсгал сулран, байгаа
 * дэлбээ аажмаар унаж бүдгэрнэ. Ойрын дэлбээ DOF мэт бүдэг, холынх жижгэрч алга болно.
 * Instance-ууд кадр бүр арнаас урагш эрэмбэлэгдэнэ (transparent, depthWrite-гүй).
 */

const MAX = 72;
/** Хамгийн хурдан scroll-ийн үед секундэд төрөх дэлбээ */
const SPAWN_RATE = 16;
/** Энэ хурдаас (px/frame) удаан scroll-д шинэ дэлбээ гарахгүй */
const SPAWN_THRESHOLD = 1.5;
/** Жижиг дэлбээнд цэцгийнхээс бүдүүн mesh хангалттай */
const SEGMENTS = 12;

/** Камераас гүн рүү (view depth) — эдгээр зайд fade, DOF, жижгэрэлт */
const NEAR_CLIP = 0.45;
const NEAR_SOFT = 3;
const FAR_START = 9;
const FAR_END = 13;

/** Дэлбээний локал орон зайд ёроол эх цэгт — эргэлт голоороо болохоор доош шилжүүлнэ */
const PIVOT = new THREE.Matrix4().makeTranslation(0, -0.45, 0);

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();
const _wind: WindSample = { x: 0, z: 0, magnitude: 0 };

function createPool() {
  return {
    alive: new Uint8Array(MAX),
    pos: new Float32Array(MAX * 3),
    vel: new Float32Array(MAX * 3),
    /** Төрөх үеийн камерын урагш чиглэл — гүн рүү урсах тэнхлэг */
    dir: new Float32Array(MAX * 3),
    rot: new Float32Array(MAX * 3),
    spin: new Float32Array(MAX * 3),
    age: new Float32Array(MAX),
    life: new Float32Array(MAX),
    seed: new Float32Array(MAX),
    size: new Float32Array(MAX),
    fade: new Float32Array(MAX),
    depth: new Float32Array(MAX),
    /** Амьд слотуудын арнаас урагш эрэмбэ */
    order: new Int32Array(MAX),
    count: 0,
    spawnAcc: 0,
    /** Scroll-ийн урсгалын хүч (0–1): хурдан өсөж, удаан сулрана */
    flow: 0,
    rand: mulberry32(11),
  };
}
type Pool = ReturnType<typeof createPool>;

type Props = {
  params: FlowerParams;
  wind: WindConfig;
  reducedMotion: boolean;
};

export function PetalDrift({ params, wind, reducedMotion }: Props) {
  const paramsRef = useRef(params);
  const windRef = useRef(wind);
  useLayoutEffect(() => {
    paramsRef.current = params;
    windRef.current = wind;
  });

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pool = useMemo(() => createPool(), []);
  // sampleWind нь цагаас л хамаарах тул Peony-гийн sim-тэй ижил салхи
  const sim = useMemo(() => createWindSim(), []);
  const shared = useMemo(() => createSharedPetalUniforms(), []);

  const { geometry, drift, material, uniforms } = useMemo(() => {
    const geometry = createPetalGeometry(SEGMENTS);
    const drift = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 2), 2).setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aDrift", drift);
    const { material, uniforms } = createPetalMaterial(palettes.peony, shared, 0, { drift: true });
    // Унасан дэлбээ: дунд зэргийн хотгор, үзүүр бага зэрэг гадагш
    uniforms.uLength.value = 1;
    uniforms.uWidth.value = 0.85;
    uniforms.uCup.value = 0.55;
    uniforms.uCurl.value = 0.3;
    uniforms.uRuffle.value = 0.7;
    uniforms.uAO.value = 0.15;
    return { geometry, drift, material, uniforms };
  }, [shared]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
  }, []);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = paramsRef.current;
    const cfg = windRef.current;
    const dt = Math.min(delta, 1 / 30);

    updateMaterial(shared, uniforms, material, p, cfg);

    // Reduced motion: урсах дэлбээ огт гарахгүй
    if (reducedMotion) {
      clear(pool, mesh);
      resetWindSim(sim);
      updateWindUniforms(shared, sim, cfg);
      return;
    }

    const velocity = getScrollVelocity();
    stepWindSim(sim, cfg, dt, velocity);
    updateWindUniforms(shared, sim, cfg);

    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    emit(pool, camera, velocity, cfg, dt);

    if (pool.count === 0 && mesh.count === 0) return;
    simulate(pool, sim.time, sim.scrollX, sim.scrollZ, cfg, camera.position, dt);
    write(pool, mesh, drift);
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, MAX]} frustumCulled={false} />;
}

function updateMaterial(
  shared: SharedPetalUniforms,
  uniforms: PetalUniforms,
  material: THREE.MeshPhysicalMaterial,
  p: FlowerParams,
  cfg: WindConfig,
) {
  shared.uTranslucency.value = p.translucency;
  shared.uVeins.value = p.veins;
  material.sheen = p.sheen;
  uniforms.uFlutter.value = cfg.flutter * 1.4;
}

function clear(pool: Pool, mesh: THREE.InstancedMesh) {
  if (pool.count === 0 && mesh.count === 0) return;
  pool.alive.fill(0);
  pool.count = 0;
  mesh.count = 0;
}

/** Scroll-ийн хурдад пропорциональ тоогоор сул слот сэргээнэ; scroll зогсвол шинэ дэлбээ гарахгүй. */
function emit(pool: Pool, camera: THREE.Camera, velocity: number, cfg: WindConfig, dt: number) {
  const speed = Math.min(1, Math.abs(velocity) / cfg.scrollMaxVelocity);
  pool.flow = THREE.MathUtils.damp(pool.flow, speed, speed > pool.flow ? 6 : 1.2, dt);

  if (Math.abs(velocity) <= SPAWN_THRESHOLD) {
    pool.spawnAcc = 0;
    return;
  }
  pool.spawnAcc += SPAWN_RATE * speed * dt;
  while (pool.spawnAcc >= 1) {
    pool.spawnAcc -= 1;
    if (!spawn(pool, camera)) {
      pool.spawnAcc = 0;
      return;
    }
  }
}

/** Сул слотыг камерын харах орон зайд, камераас бага зэрэг урд сэргээнэ. Pool дүүрсэн бол false. */
function spawn(pool: Pool, camera: THREE.Camera) {
  const i = pool.alive.indexOf(0);
  if (i < 0) return false;
  const r = pool.rand;

  const perspective = camera instanceof THREE.PerspectiveCamera;
  const fov = perspective ? camera.fov : 30;
  const aspect = perspective ? camera.aspect : 1;
  const d = lerp(1.6, 4.2, r());
  const halfH = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * d;
  const x = (r() * 2 - 1) * halfH * aspect * 1.1;
  const y = lerp(-0.9, 1.1, r()) * halfH;
  _pos.copy(camera.position).addScaledVector(_fwd, d).addScaledVector(_right, x).addScaledVector(_up, y);

  const i3 = i * 3;
  pool.pos[i3] = _pos.x;
  pool.pos[i3 + 1] = _pos.y;
  pool.pos[i3 + 2] = _pos.z;
  // Урсах чиглэл: камерын урагш + бага зэргийн тархалт
  _pos.copy(_fwd).addScaledVector(_right, (r() - 0.5) * 0.3).addScaledVector(_up, (r() - 0.5) * 0.2).normalize();
  pool.dir[i3] = _pos.x;
  pool.dir[i3 + 1] = _pos.y;
  pool.dir[i3 + 2] = _pos.z;
  const v0 = lerp(0.8, 2.6, pool.flow);
  pool.vel[i3] = _pos.x * v0;
  pool.vel[i3 + 1] = _pos.y * v0;
  pool.vel[i3 + 2] = _pos.z * v0;
  for (let a = 0; a < 3; a++) {
    pool.rot[i3 + a] = r() * Math.PI * 2;
    pool.spin[i3 + a] = (r() < 0.5 ? -1 : 1) * lerp(0.5, 1.7, r());
  }

  pool.age[i] = 0;
  pool.life[i] = lerp(4.5, 7, r());
  pool.seed[i] = r();
  pool.size[i] = lerp(0.12, 0.2, r());
  pool.fade[i] = 0;
  pool.alive[i] = 1;
  pool.count++;
  return true;
}

/** Хөдөлгөөн, fade, гүн; амьд слотуудыг `order`-д арнаас урагш эрэмбэлнэ. */
function simulate(
  pool: Pool,
  time: number,
  scrollX: number,
  scrollZ: number,
  cfg: WindConfig,
  cam: THREE.Vector3,
  dt: number,
) {
  const flow = pool.flow;
  // Scroll-ийн үед гүн рүү хурдан урсана, зогсоход бараг зогсож зөөлөн унана
  const forward = lerp(0.12, 3.4, flow);
  const fall = lerp(0.32, 0.1, flow);
  const drag = 1 - Math.exp(-dt * 1.6);
  let n = 0;

  for (let i = 0; i < MAX; i++) {
    if (!pool.alive[i]) continue;
    const i3 = i * 3;
    const s = pool.seed[i];
    const age = (pool.age[i] += dt);
    const life = pool.life[i];

    // Дэлбээ бүр салхийг өөр мөчид мэдэрнэ — нэг жигд биш, давалгаалан хөдөлнө
    sampleWind(time - 0.3 - s * 0.8, cfg, _wind);
    const wx = (_wind.x + scrollX) * 0.7;
    const wz = (_wind.z + scrollZ) * 0.7;
    const t = time * 0.45 + s * 37;

    const tx = pool.dir[i3] * forward + wx + fbm1(t, 6) * 0.35;
    const ty = pool.dir[i3 + 1] * forward - fall + fbm1(t, 7) * 0.22;
    const tz = pool.dir[i3 + 2] * forward + wz + fbm1(t, 8) * 0.35;
    pool.vel[i3] += (tx - pool.vel[i3]) * drag;
    pool.vel[i3 + 1] += (ty - pool.vel[i3 + 1]) * drag;
    pool.vel[i3 + 2] += (tz - pool.vel[i3 + 2]) * drag;
    const px = (pool.pos[i3] += pool.vel[i3] * dt);
    const py = (pool.pos[i3 + 1] += pool.vel[i3 + 1] * dt);
    const pz = (pool.pos[i3 + 2] += pool.vel[i3 + 2] * dt);

    const tumble = dt * (0.45 + flow * 0.9 + _wind.magnitude * 0.6);
    pool.rot[i3] += pool.spin[i3] * tumble;
    pool.rot[i3 + 1] += pool.spin[i3 + 1] * tumble;
    pool.rot[i3 + 2] += pool.spin[i3 + 2] * tumble;

    const depth = (px - cam.x) * _fwd.x + (py - cam.y) * _fwd.y + (pz - cam.z) * _fwd.z;
    if (age >= life || depth > FAR_END || depth < 0) {
      pool.alive[i] = 0;
      pool.count--;
      continue;
    }

    pool.fade[i] =
      smoothstep(0, 0.5, age) *
      (1 - smoothstep(life - 1.6, life, age)) *
      // Камерт ойр: near plane-д хүрэхээс өмнө алга болж, ойр зай DOF мэт бүдэг
      smoothstep(NEAR_CLIP, 1, depth) *
      lerp(0.3, 1, smoothstep(1.2, NEAR_SOFT, depth)) *
      (1 - smoothstep(FAR_START, FAR_END, depth));
    pool.depth[i] = depth;

    // Insertion sort (холоос ойр руу) — кадраас кадрт бараг эрэмбэлэгдсэн хэвээр тул O(n)
    let b = n - 1;
    while (b >= 0 && pool.depth[pool.order[b]] < depth) {
      pool.order[b + 1] = pool.order[b];
      b--;
    }
    pool.order[b + 1] = i;
    n++;
  }
}

function write(pool: Pool, mesh: THREE.InstancedMesh, drift: THREE.InstancedBufferAttribute) {
  const n = pool.count;
  for (let k = 0; k < n; k++) {
    const i = pool.order[k];
    const i3 = i * 3;
    // Холын дэлбээ перспективээс гадна бага зэрэг жижгэрнэ
    const size = pool.size[i] * lerp(1, 0.7, smoothstep(NEAR_SOFT, FAR_END, pool.depth[i]));
    _pos.set(pool.pos[i3], pool.pos[i3 + 1], pool.pos[i3 + 2]);
    _quat.setFromEuler(_euler.set(pool.rot[i3], pool.rot[i3 + 1], pool.rot[i3 + 2]));
    _matrix.compose(_pos, _quat, _scale.setScalar(size)).multiply(PIVOT);
    mesh.setMatrixAt(k, _matrix);
    drift.setXY(k, pool.seed[i], pool.fade[i]);
  }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  drift.needsUpdate = true;
}
