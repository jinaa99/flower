"use client";

import * as THREE from "three";
import { lerp, smoothstep } from "./math";

/**
 * Салхины физик.
 *
 * CPU (цөөн скаляр, хямд): олон давтамжтай салхины noise + gust, ишний 2D spring-damper,
 * дэлбээ/sepal/навч бүрийн spring-damper (өөр фаз, lag, толгойн хурдатгалын инерц).
 * GPU (vertex shader): ишний нугаралт ба дэлбээний нугаралт + simplex flutter-ийг
 * uniform-оор (uWindDir, uWindStrength, uWindTime, uStemBend, uSway…) тооцно.
 *
 * Scroll-ийн хурд нэмэлт салхи болж ордог тул доош scroll → нэг тал руу налж,
 * дээш scroll → эсрэг тал руу, зогсоход spring-ээр зөөлөн буцна.
 */

/** Салхины бүх хүч, spring-ийн тогтмол нэг дор. /lab хуудас эдгээрийг удирдана. */
export type WindConfig = {
  // Салхи
  /** Тогтмол зөөлөн сэвшээ (хэмжээсгүй, ~0–1) */
  strength: number;
  /** Үндсэн чиглэл, градус (0 = +X, 90 = +Z) */
  direction: number;
  /** Noise-ийн хэлбэлзэл: хүч, чиглэлийн тогтворгүй байдал */
  turbulence: number;
  /** Сэвшээний noise-ийн хурд (Hz орчим) */
  frequency: number;
  /** Үе үеийн хүчтэй салхины нэмэлт хүч */
  gustStrength: number;
  /** Gust хэр олон ирэх (бага = ховор) */
  gustFrequency: number;
  // Иш
  stemMass: number;
  stemStiffness: number;
  stemDamping: number;
  /** Салхины хүчийг ишний хүч болгох коэффициент */
  stemResponse: number;
  /** Нугаралтын жин h^n — ёроол хөдлөхгүй, үзүүр хамгийн их (иш ба дэлбээнд) */
  bendWeight: number;
  // Дэлбээ
  petalMass: number;
  petalStiffness: number;
  petalDamping: number;
  petalResponse: number;
  /** Дотор давхаргын хөдөлгөөн гаднатай харьцуулахад (0–1) */
  innerPetalMotion: number;
  /** Дэлбээ салхинаас хэр хоцрох (сек) */
  petalLag: number;
  /** GPU дээрх өндөр давтамжтай чичиргээ (flutter) */
  flutter: number;
  // Scroll
  /** Хамгийн хурдан scroll-ийн үеийн нэмэлт салхи */
  scrollInfluence: number;
  /** Доош scroll-ийн үед налах чиглэл, градус (дээш бол эсрэг) */
  scrollDirection: number;
  /** Энэ хурд (px/frame)-аас дээш scroll ижил нөлөөтэй */
  scrollMaxVelocity: number;
};

export const defaultWindConfig: WindConfig = {
  // Намуухан сэвшээ: цэцэг амьд боловч «анимэйшн хийгдсэн» мэт биш
  strength: 0.22,
  direction: 20,
  turbulence: 0.5,
  frequency: 0.2,
  gustStrength: 0.5,
  gustFrequency: 0.1,
  stemMass: 1,
  stemStiffness: 12,
  stemDamping: 2.6,
  stemResponse: 1.6,
  bendWeight: 2,
  petalMass: 0.12,
  petalStiffness: 22,
  petalDamping: 0.9,
  petalResponse: 0.9,
  innerPetalMotion: 0.35,
  petalLag: 0.35,
  flutter: 0.32,
  scrollInfluence: 1.2,
  scrollDirection: 0,
  scrollMaxVelocity: 45,
};

export type WindControl = { key: keyof WindConfig; label: string; min: number; max: number; step: number };

export const windGroups: { title: string; controls: WindControl[] }[] = [
  {
    title: "Сэвшээ · gust",
    controls: [
      { key: "strength", label: "Сэвшээ", min: 0, max: 1, step: 0.01 },
      { key: "direction", label: "Чиглэл (°)", min: 0, max: 360, step: 1 },
      { key: "turbulence", label: "Turbulence", min: 0, max: 1.5, step: 0.01 },
      { key: "frequency", label: "Давтамж", min: 0.02, max: 1, step: 0.01 },
      { key: "gustStrength", label: "Gust хүч", min: 0, max: 1.5, step: 0.01 },
      { key: "gustFrequency", label: "Gust давтамж", min: 0.01, max: 0.5, step: 0.01 },
    ],
  },
  {
    title: "Иш · spring",
    controls: [
      { key: "stemMass", label: "Mass", min: 0.2, max: 4, step: 0.01 },
      { key: "stemStiffness", label: "Stiffness", min: 2, max: 40, step: 0.1 },
      { key: "stemDamping", label: "Damping", min: 0.2, max: 10, step: 0.01 },
      { key: "stemResponse", label: "Салхины нөлөө", min: 0, max: 5, step: 0.01 },
      { key: "bendWeight", label: "Bend weight", min: 1, max: 4, step: 0.01 },
    ],
  },
  {
    title: "Дэлбээ · spring",
    controls: [
      { key: "petalMass", label: "Mass", min: 0.03, max: 0.5, step: 0.005 },
      { key: "petalStiffness", label: "Stiffness", min: 4, max: 60, step: 0.1 },
      { key: "petalDamping", label: "Damping", min: 0.05, max: 4, step: 0.01 },
      { key: "petalResponse", label: "Салхины нөлөө", min: 0, max: 3, step: 0.01 },
      { key: "innerPetalMotion", label: "Дотор давхарга", min: 0, max: 1, step: 0.01 },
      { key: "petalLag", label: "Lag (сек)", min: 0, max: 1.5, step: 0.01 },
      { key: "flutter", label: "Flutter", min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    title: "Scroll",
    controls: [
      { key: "scrollInfluence", label: "Нөлөө", min: 0, max: 3, step: 0.01 },
      { key: "scrollDirection", label: "Налах чиглэл (°)", min: 0, max: 360, step: 1 },
      { key: "scrollMaxVelocity", label: "Max хурд (px/frame)", min: 5, max: 150, step: 1 },
    ],
  },
];

/* ───────────────────────── CPU: noise ───────────────────────── */

const DEG = Math.PI / 180;

function hash1(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** 1D gradient noise, ойролцоогоор [-1, 1] */
function noise1(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const a = (hash1(i) * 2 - 1) * f;
  const b = (hash1(i + 1) * 2 - 1) * (f - 1);
  return (a + (b - a) * f * f * (3 - 2 * f)) * 2;
}

/** 3 octave — удаан долгион дээр жижиг хэлбэлзэл */
export function fbm1(x: number, seed: number) {
  return (
    noise1(x + seed * 31.7) * 0.6 + noise1(x * 2.17 + seed * 13.1) * 0.27 + noise1(x * 4.53 + seed * 7.3) * 0.13
  );
}

export type WindSample = { x: number; z: number; magnitude: number };

/** t хугацааны салхи (хэвтээ XZ вектор). Цэвэр функц — lag-тай дэлбээ өнгөрсөн t-г асууж болно. */
export function sampleWind(t: number, cfg: WindConfig, out: WindSample) {
  const breeze = cfg.strength * Math.max(0, 1 + cfg.turbulence * 0.6 * fbm1(t * cfg.frequency, 1));
  // fbm босгоос дээш гарах үед л gust — ховор, зөөлөн эхэлж зөөлөн дуусна
  const gustEnvelope = smoothstep(0.2, 0.65, fbm1(t * cfg.gustFrequency, 2));
  const gust = cfg.gustStrength * gustEnvelope * (0.8 + 0.2 * fbm1(t * 1.9, 3));
  const angle = cfg.direction * DEG + fbm1(t * cfg.frequency * 0.4, 4) * 0.45 * cfg.turbulence;
  const m = breeze + gust;
  out.x = Math.cos(angle) * m;
  out.z = Math.sin(angle) * m;
  out.magnitude = m;
  return out;
}

/* ───────────────────────── CPU: spring-damper ───────────────────────── */

export type Spring2 = { x: number; z: number; vx: number; vz: number; ax: number; az: number };

const createSpring2 = (): Spring2 => ({ x: 0, z: 0, vx: 0, vz: 0, ax: 0, az: 0 });

function resetSpring2(s: Spring2) {
  s.x = s.z = s.vx = s.vz = s.ax = s.az = 0;
}

const MAX_STEP = 1 / 120;

/** m·a = F − k·x − c·v. Semi-implicit Euler, тогтвортой байхаар ≤1/120 сек-ийн алхмаар хуваана. */
function integrateSpring(s: Spring2, fx: number, fz: number, m: number, k: number, c: number, dt: number) {
  const n = Math.max(1, Math.ceil(dt / MAX_STEP));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.ax = (fx - k * s.x - c * s.vx) / m;
    s.az = (fz - k * s.z - c * s.vz) / m;
    s.vx += s.ax * h;
    s.vz += s.az * h;
    s.x += s.vx * h;
    s.z += s.vz * h;
  }
}

/* ───────────────────────── Нийт симуляц ───────────────────────── */

export function createWindSim() {
  return {
    time: 0,
    /** GPU flutter-ийн цаг — салхи хүчтэй үед хурдан урсана */
    windTime: 0,
    wind: { x: 0, z: 0, magnitude: 0 } as WindSample,
    /** Scroll-оос үүдсэн нэмэлт салхи (XZ) */
    scrollX: 0,
    scrollZ: 0,
    /** Шейдер дэх flutter-ийн нийт хүч */
    energy: 0,
    /** Ишний үзүүрийн хазайлт (XZ, world units) */
    stem: createSpring2(),
  };
}
export type WindSim = ReturnType<typeof createWindSim>;

export function stepWindSim(sim: WindSim, cfg: WindConfig, dt: number, scrollVelocity: number) {
  sim.time += dt;
  sampleWind(sim.time, cfg, sim.wind);

  // Доош scroll (+) → scrollDirection руу, дээш (−) → эсрэг тал руу. Бага зэрэг шүүж жигд болгоно.
  const target = Math.max(-1, Math.min(1, scrollVelocity / cfg.scrollMaxVelocity)) * cfg.scrollInfluence;
  const a = cfg.scrollDirection * DEG;
  const smoothing = 1 - Math.exp(-dt * 10);
  sim.scrollX += (Math.cos(a) * target - sim.scrollX) * smoothing;
  sim.scrollZ += (Math.sin(a) * target - sim.scrollZ) * smoothing;

  const fx = (sim.wind.x + sim.scrollX) * cfg.stemResponse;
  const fz = (sim.wind.z + sim.scrollZ) * cfg.stemResponse;
  integrateSpring(sim.stem, fx, fz, cfg.stemMass, cfg.stemStiffness, cfg.stemDamping, dt);

  sim.energy = sim.wind.magnitude + Math.hypot(sim.scrollX, sim.scrollZ) * 0.5;
  sim.windTime += dt * (0.4 + sim.energy);
}

export function resetWindSim(sim: WindSim) {
  sim.wind.x = sim.wind.z = sim.wind.magnitude = 0;
  sim.scrollX = sim.scrollZ = sim.energy = 0;
  resetSpring2(sim.stem);
}

/* ───────────────────────── Ишний нугаралт ───────────────────────── */

/**
 * Иш дээрх y өндөр дэх хазайлт ба налуу. Шейдерийн нугаралттай яг ижил томъёо:
 * offset = bend · h^n, h = 1 + y / length (ёроол y = −length, үзүүр y = 0).
 */
export function applyStemSway(obj: THREE.Object3D, base: THREE.Vector3, sim: WindSim, cfg: WindConfig, length: number) {
  const h = Math.max(0, Math.min(1, 1 + base.y / length));
  const n = cfg.bendWeight;
  const w = h ** n;
  const slope = (n * h ** (n - 1)) / length;
  const { x, z } = sim.stem;
  obj.position.set(base.x + x * w, base.y, base.z + z * w);
  // +X руу налах → дээд тэнхлэг +X рүү (Rz сөрөг); +Z руу → Rx эерэг
  obj.rotation.set(Math.atan(z * slope), 0, -Math.atan(x * slope));
}

/* ───────────────────────── Дэлбээ / навчны spring ───────────────────────── */

export type Flap = Spring2 & {
  /** 0 = дотор / хатуу (sepal), 1 = гадна давхарга / навч */
  outer: number;
  /** Өөрийн фаз */
  seed: number;
};

export const createFlap = (outer: number, seed: number): Flap => ({ ...createSpring2(), outer, seed });

type FlapUniforms = { uSway: { value: THREE.Vector2 }; uFlutter: { value: number } };

const _axisX = new THREE.Vector3();
const _axisZ = new THREE.Vector3();
const _lagged: WindSample = { x: 0, z: 0, magnitude: 0 };
const MAX_SWAY = 0.2;

/**
 * Нэг дэлбээний spring: хоцорсон (lag) салхи + өөрийн фазтай flick + толгойн хурдатгалын
 * инерц (−m·a) → дэлбээний локал X (хажуу) ба Z (дотор/гадагш) тэнхлэгт проекцлоно.
 * `matrixWorld` нь өмнөх кадрынх — нэг кадрын хоцрогдол мэдрэгдэхгүй.
 */
export function stepFlap(
  f: Flap,
  matrixWorld: THREE.Matrix4,
  u: FlapUniforms,
  sim: WindSim,
  cfg: WindConfig,
  dt: number,
) {
  const gain = lerp(cfg.innerPetalMotion, 1, f.outer);
  sampleWind(sim.time - cfg.petalLag * (0.35 + 0.65 * f.seed) * lerp(0.6, 1, f.outer), cfg, _lagged);

  const m = cfg.petalMass;
  const wx = (_lagged.x + sim.scrollX) * cfg.petalResponse - m * sim.stem.ax;
  const wz = (_lagged.z + sim.scrollZ) * cfg.petalResponse - m * sim.stem.az;
  const flick = fbm1(sim.time * 1.3 + f.seed * 97, 5) * _lagged.magnitude * 0.5 * cfg.petalResponse;

  _axisX.setFromMatrixColumn(matrixWorld, 0).normalize();
  _axisZ.setFromMatrixColumn(matrixWorld, 2).normalize();
  const fx = (wx * _axisX.x + wz * _axisX.z) * gain;
  const fz = (wx * _axisZ.x + wz * _axisZ.z + flick) * gain;

  // Гадна дэлбээ зөөлөн, дотор (жижиг, хатуу) дэлбээ хатуу
  const k = cfg.petalStiffness * lerp(1.6, 1, f.outer);
  integrateSpring(f, fx, fz, m, k, cfg.petalDamping, dt);

  u.uSway.value.set(Math.max(-MAX_SWAY, Math.min(MAX_SWAY, f.x)), Math.max(-MAX_SWAY, Math.min(MAX_SWAY, f.z)));
  u.uFlutter.value = cfg.flutter * gain;
}

export function resetFlap(f: Flap, u: FlapUniforms) {
  resetSpring2(f);
  u.uSway.value.set(0, 0);
  u.uFlutter.value = 0;
}

/* ───────────────────────── GPU ───────────────────────── */

/** Салхины shared uniform-ууд (petal / stem material бүгд хуваалцана). */
export function createWindUniforms() {
  return {
    uWindTime: { value: 0 },
    uWindStrength: { value: 0 },
    uWindDir: { value: new THREE.Vector3(1, 0, 0) },
    uBendWeight: { value: defaultWindConfig.bendWeight },
    uStemBend: { value: new THREE.Vector2() },
  };
}
export type WindUniforms = ReturnType<typeof createWindUniforms>;

export function updateWindUniforms(u: WindUniforms, sim: WindSim, cfg: WindConfig) {
  u.uWindTime.value = sim.windTime;
  u.uWindStrength.value = sim.energy;
  u.uBendWeight.value = cfg.bendWeight;
  u.uStemBend.value.set(sim.stem.x, sim.stem.z);
  const dx = sim.wind.x + sim.scrollX;
  const dz = sim.wind.z + sim.scrollZ;
  if (dx * dx + dz * dz > 1e-8) u.uWindDir.value.set(dx, 0, dz).normalize();
}

/** Uniform зарлалт + 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT). */
export const windVertexPars = /* glsl */ `
uniform float uWindTime;
uniform float uWindStrength;
uniform vec3 uWindDir;
uniform float uBendWeight;

vec3 windMod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 windMod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 windPermute(vec4 x) { return windMod289(((x * 34.0) + 1.0) * x); }
vec4 windTaylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float windNoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = windMod289(i);
  vec4 p = windPermute(windPermute(windPermute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = windTaylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;
