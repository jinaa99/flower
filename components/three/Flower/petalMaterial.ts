"use client";

import * as THREE from "three";
import type { Outline, PetalColors, PetalSpots } from "@/data/flowerSpecs";
import { createWindUniforms, windVertexPars } from "./wind";

/**
 * Дэлбээ / sepal / навчны нэгдсэн material.
 *
 * MeshPhysicalMaterial (sheen, PBR гэрэл, environment)-ийг onBeforeCompile-аар өргөтгөнө:
 * - vertex: PlaneGeometry-ийн uv-ээс дэлбээний хэлбэрийг гаргана (outline, cup, curl, ruffle),
 *   normal-ыг finite difference-ээр тооцно. Салхины нугаралт + flutter (wind.ts) мөн
 *   petalShape дотор орох тул normal нь хөдөлгөөнийг дагана.
 * - fragment: ёроол → үзүүр өнгөний gradient, судал, ёроолын сүүдэр, ар талын гэрлийн
 *   нэвтрэлт (thin-surface translucency).
 * - ethereal давхарга: Fresnel + нимгэн ирмэгийн гэрэлтэлт, ёроолын дотоод гэрэл (bloom-д
 *   барина), шүүдрийн дусал (cellular noise — normal товойж, гялбаа тусна).
 *
 * Бүх material нэг onBeforeCompile функцтэй тул нэг shader program-ыг хуваалцана —
 * ялгаа нь зөвхөн uniform-д.
 */

export const PETAL_SEGMENTS = 24;

/** Бүх дэлбээнд нэг geometry. Байрлалыг shader uv-ээс тооцдог тул plane-ийн хэмжээ хамаагүй. */
export function createPetalGeometry(segments = PETAL_SEGMENTS) {
  return new THREE.PlaneGeometry(1, 1, segments, segments);
}

export type PetalPalette = {
  base: THREE.Color;
  mid: THREE.Color;
  tip: THREE.Color;
  veinTint: THREE.Color;
  trans: THREE.Color;
  sheen: THREE.Color;
  /** 0 = дэлбээний сэвэлгэр судал, 1 = навчны гол + хажуу судал */
  leaf: number;
  /** x: хамгийн өргөн цэгийн exponent, y: үзүүрийн бөөрөнхий (бага = мохоо), z: ёроолын өргөн */
  shape: THREE.Vector3;
  /** Дэлбээний толбо (зэрлэг сараана) — amount 0 бол байхгүй */
  spot: THREE.Color;
  spotAmount: number;
};

/** FlowerSpec-ийн hex өнгө + outline → shader-ийн palette (дэлбээ, sepal, навч) */
export function createPalette(colors: PetalColors, outline: Outline, leaf = 0, spots?: PetalSpots): PetalPalette {
  const c = (hex: string) => new THREE.Color(hex);
  return {
    base: c(colors.base),
    mid: c(colors.mid),
    tip: c(colors.tip),
    veinTint: c(colors.veinTint),
    trans: c(colors.trans),
    sheen: c(colors.sheen),
    leaf,
    shape: new THREE.Vector3(...outline),
    spot: c(spots?.color ?? colors.base),
    spotAmount: spots?.amount ?? 0,
  };
}

/** Бүх material-д хуваалцах uniform-ууд (lab-аас нэг дор өөрчлөгдөнө). */
export function createSharedPetalUniforms() {
  return {
    uTranslucency: { value: 0.9 },
    uVeins: { value: 0.55 },
    /** Ирмэг + Fresnel гэрэлтэлт (emissive) */
    uGlow: { value: 0 },
    /** Дэлбээний ёроолын дотоод гэрэл */
    uHeart: { value: 0 },
    /** Шүүдрийн дуслын нягтрал (0 = байхгүй) */
    uDew: { value: 0 },
    /** Цэцгийн голын гүн сүүдэр (0–1): дотор талын дэлбээ бие биеэ халхална */
    uCavity: { value: 0 },
    /** Цэцгийн толгойн (дэлбээний ёроол) world байрлал — WindDriver кадр бүр бичнэ */
    uHeadCenter: { value: new THREE.Vector3() },
    ...createWindUniforms(),
  };
}
export type SharedPetalUniforms = ReturnType<typeof createSharedPetalUniforms>;

function createOwnUniforms(palette: PetalPalette, seed: number) {
  return {
    uLength: { value: 1 },
    uWidth: { value: 0.9 },
    uCup: { value: 0.5 },
    uCurl: { value: 0 },
    uRuffle: { value: 0.5 },
    uAO: { value: 0 },
    /** Spring-ийн үзүүрийн хазайлт (x: хажуу, y: дотор/гадагш) — wind.ts stepFlap */
    uSway: { value: new THREE.Vector2() },
    uFlutter: { value: 0 },
    uSeed: { value: seed },
    // Хуулбар: material бүр өнгөө бие даан өөрчилж болно (PetalDrift цэцгээс цэцэгт шилжинэ)
    uShape: { value: palette.shape.clone() },
    uBaseColor: { value: palette.base.clone() },
    uMidColor: { value: palette.mid.clone() },
    uTipColor: { value: palette.tip.clone() },
    uVeinTint: { value: palette.veinTint.clone() },
    uTransColor: { value: palette.trans.clone() },
    uLeaf: { value: palette.leaf },
    uSpotColor: { value: palette.spot.clone() },
    uSpotAmount: { value: palette.spotAmount },
  };
}
export type PetalUniforms = ReturnType<typeof createOwnUniforms>;

const vertexPars = /* glsl */ `
${windVertexPars}
uniform vec2 uSway;
uniform float uFlutter;
uniform float uLength;
uniform float uWidth;
uniform float uCup;
uniform float uCurl;
uniform float uRuffle;
uniform float uSeed;
uniform vec3 uShape;
uniform vec3 uHeadCenter;
varying vec2 vPetalUv;
varying float vPetalSeed;
varying float vCavity;
// Энгийн дэлбээнд uSeed, урсах дэлбээнд (instanced) instance бүрийн seed
float petalSeed;
#ifdef PETAL_DRIFT
attribute vec2 aDrift; // x: seed, y: fade
varying float vDriftFade;
#endif

const float CURL_START = 0.38;

// Дэлбээний локал орон зай: ёроол нь эх цэгт, урт нь +Y, дотор (хотгор) тал нь +Z.
vec3 petalShape(vec2 st) {
  float xn = st.x * 2.0 - 1.0;
  // Бодит дэлбээний үзүүр жигд нум биш: зөөлөн долгиолсон, тэгш бус контур (дэлбээ бүрт өөр).
  // Ruffle-тай пропорциональ — цээнэд тод, сарнай/сараанад бараг үгүй. Outline хаалттай хэвээр;
  // зөвхөн уртыг өргөний дагуу өөр өөрөөр богиносгоно (үзүүрийг таслахгүй — нугалаас үүсгэхгүй).
  float v = clamp(st.y, 0.0, 1.0);
  float ph0 = petalSeed * 6.2831;
  float jag = uRuffle * (0.03 + 0.03 * sin(xn * 5.0 + ph0) + 0.006 * sin(xn * 11.0 + ph0 * 2.7));
  float L = uLength * (1.0 - jag * smoothstep(0.55, 1.0, v));

  // Outline: ёроолд нарийн (claw), uShape.x-ээр тодорхойлсон цэгт хамгийн өргөн, үзүүрт бөөрөнхий
  float prof = pow(max(sin(PI * pow(v, uShape.x)), 0.0), uShape.y);
  float halfW = 0.5 * uWidth * max(prof, uShape.z * (1.0 - v));
  float s = xn * halfW;

  // Cup: хөндлөн огтлолыг нумаар нугалж өргөнийг хадгална
  float k = uCup * 3.0 / max(uWidth, 1e-3);
  float th = s * k;
  float cx = abs(k) > 1e-4 ? sin(th) / k : s;
  float cz = abs(k) > 1e-4 ? (1.0 - cos(th)) / k : 0.0;

  // Ruffle: ирмэг болон үзүүрт л долгионтоно
  float edge = max(smoothstep(0.45, 1.0, abs(xn)), smoothstep(0.55, 1.0, v)) * smoothstep(0.1, 0.45, v);
  float ph = petalSeed * 6.2831;
  // Бага давтамжтай том долгион + ирмэгийн нарийн атираа. Өндөр давтамж нь segment-ийн
  // нягтралаас хэтэрвэл ирмэг шаантаг шиг харагддаг тул сулруулсан.
  float wave = sin(v * 13.0 + xn * 2.0 + ph) * 0.6
             + sin(v * 27.0 - xn * 5.0 + ph * 1.7) * 0.18
             + sin(xn * 15.0 + ph * 2.3) * 0.14 * smoothstep(0.6, 1.0, v);
  float rz = uRuffle * edge * wave * 0.1 * uWidth;

  // Curl: CURL_START-аас дээш нурууны шугам тогтмол муруйлтаар нугарна.
  // Эерэг = гадагш (-Z), сөрөг = дотогш (нахиа, төвийн дэлбээ бөмбөлөг болж хаагдана)
  float bend = max(v - CURL_START, 0.0) * L;
  float kc = uCurl * 2.4 / ((1.0 - CURL_START) * L);
  float a = kc * bend;
  float sy = min(v, CURL_START) * L;
  float sz = 0.0;
  if (abs(kc) > 1e-4) {
    sy += sin(a) / kc;
    sz = -(1.0 - cos(a)) / kc;
  } else {
    sy += bend;
  }
  vec3 nrm = vec3(0.0, sin(a), cos(a));

  // Салхи: ёроол тогтвортой, үзүүр рүү v^n жинтэй. Spring-ийн хазайлт (CPU) +
  // дэлбээгээр урсах 2 давтамжтай flutter (GPU), ирмэг нь илүү чичирнэ.
  float ww = pow(v, uBendWeight);
  float fl = windNoise(vec3(xn * 0.9 + petalSeed * 17.0, v * 1.6 - uWindTime * 1.3, uWindTime * 0.4 + petalSeed * 5.0)) * 0.7
           + windNoise(vec3(xn * 2.3 - petalSeed * 9.0, v * 3.1 - uWindTime * 2.1, uWindTime * 0.7)) * 0.3;
  float flap = uSway.y * ww + fl * uFlutter * uWindStrength * ww * (0.6 + 0.4 * abs(xn)) * L * 0.08;

  return vec3(cx + uSway.x * ww, sy, sz) + nrm * (cz + rz + flap);
}
`;

const vertexNormal = /* glsl */ `
#ifdef PETAL_DRIFT
petalSeed = aDrift.x;
vDriftFade = aDrift.y;
#else
petalSeed = uSeed;
#endif
vPetalSeed = petalSeed;
vec3 petalPos = petalShape(uv);
// Үзүүрт өргөн ~0 тул deriv-ийг арай доороос авна
vec2 uvN = vec2(uv.x, min(uv.y, 0.96));
const vec2 dUv = vec2(0.004, 0.0);
vec3 dU = petalShape(uvN + dUv.xy) - petalShape(uvN - dUv.xy);
vec3 dV = petalShape(uvN + dUv.yx) - petalShape(uvN - dUv.yx);
vec3 objectNormal = normalize(cross(dU, dV));
vPetalUv = uv;
`;

// Толгойн төвөөс хол байх тусам гэгээтэй — урсах дэлбээнд хамаарахгүй
const vertexCavity = /* glsl */ `
#ifdef PETAL_DRIFT
vCavity = 1.0;
#else
vCavity = smoothstep(0.04, 0.6, length((modelMatrix * vec4(transformed, 1.0)).xyz - uHeadCenter));
#endif
`;

const fragmentPars = /* glsl */ `
uniform vec3 uBaseColor;
uniform vec3 uMidColor;
uniform vec3 uTipColor;
uniform vec3 uVeinTint;
uniform vec3 uTransColor;
uniform float uVeins;
uniform float uTranslucency;
uniform float uAO;
uniform float uLeaf;
uniform float uGlow;
uniform float uHeart;
uniform float uDew;
uniform float uCavity;
uniform vec3 uSpotColor;
uniform float uSpotAmount;
varying vec2 vPetalUv;
varying float vPetalSeed;
varying float vCavity;
#ifdef PETAL_DRIFT
varying float vDriftFade;
#endif

// Өнгөний органик толбо — дэлбээ бүр хэвлэсэн мэт жигд биш
float petalNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 dewHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Шүүдэр: xy — дуслын төвөөс (радиусаар хэвийнчилсэн) хазайлт, z — дусал дотор эсэх (0–1)
vec3 dewDrop(vec2 uv, float seed) {
  vec2 g = uv * vec2(5.0, 8.0) + seed * 31.0;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  vec3 best = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = dewHash(cell + o);
      // Нүднүүдийн зөвхөн хэсэгт нь дусал — uDew нягтрал
      if (h.x > uDew) continue;
      float r = mix(0.16, 0.34, h.y);
      vec2 d = (o + 0.2 + 0.6 * dewHash(cell + o + 7.3) - f) / r;
      float inside = 1.0 - smoothstep(0.82, 1.0, length(d));
      if (inside > best.z) best = vec3(d, inside);
    }
  }
  return best;
}

float veinLine(float coord, float width) {
  float d = abs(fract(coord) - 0.5);
  float aa = fwidth(coord);
  return smoothstep(0.5 - width - aa, 0.5, d);
}
`;

const fragmentColor = /* glsl */ `
float pv = vPetalUv.y;
float pxn = vPetalUv.x * 2.0 - 1.0;

vec3 petalCol = mix(uBaseColor, uMidColor, smoothstep(0.0, 0.4, pv));
petalCol = mix(petalCol, uTipColor, smoothstep(0.3, 0.88, pv));

// Дэлбээ: ёроолоос сэвэлгэр нарийн судал. Навч: гол судал + хажуугийн судал.
// Судал: цөөн, зөөлөн, ёроолоос сэвэлгэр — нарийн давтамжтай бол даавуу мэт харагддаг
float petalVein = veinLine(pxn * 9.0 + 0.3 * sin(pv * 7.0 + vPetalSeed * 40.0 + pxn * 2.0), 0.12);
float midrib = 1.0 - smoothstep(0.0, 0.03 + fwidth(pxn), abs(pxn));
float lateral = veinLine((pv - abs(pxn) * 0.45) * 9.0, 0.04) * smoothstep(0.03, 0.08, abs(pxn));
float vein = mix(petalVein, max(midrib, lateral * 0.7), uLeaf);
vein *= uVeins * (1.0 - smoothstep(0.75, 1.0, pv));
petalCol = mix(petalCol, petalCol * uVeinTint / max(uMidColor, vec3(1e-3)), vein * 0.6);

// Дэлбээ бүрийн бага зэргийн ялгаа, гадаргуугийн зөөлөн толбо, ёроолын хуурамч ambient occlusion
petalCol *= 0.92 + 0.14 * fract(vPetalSeed * 7.13);
float mottle = petalNoise(vPetalUv * vec2(5.0, 9.0) + vPetalSeed * 23.0) * 0.6
             + petalNoise(vPetalUv * vec2(13.0, 21.0) - vPetalSeed * 11.0) * 0.4;
petalCol *= 0.9 + 0.2 * mottle * (1.0 - uLeaf * 0.5);

// Толбо (Lilium martagon): дэлбээний доод хагаст, ирмэгээс хол
if (uSpotAmount > 0.0) {
  vec2 sg = vPetalUv * vec2(6.0, 15.0) + vPetalSeed * 13.0;
  vec2 sc = floor(sg);
  vec2 sh = dewHash(sc);
  float sr = mix(0.1, 0.24, sh.y);
  float sd = length(fract(sg) - (0.25 + 0.5 * dewHash(sc + 3.1)));
  float spot = (1.0 - smoothstep(sr - fwidth(sd), sr, sd)) * step(sh.x, uSpotAmount);
  spot *= smoothstep(0.06, 0.18, pv) * (1.0 - smoothstep(0.42, 0.62, pv)) * (1.0 - smoothstep(0.55, 0.85, abs(pxn)));
  petalCol = mix(petalCol, uSpotColor, spot * 0.9);
}
petalCol *= mix(1.0, 0.3 + 0.7 * smoothstep(0.0, 0.5, pv), uAO);
// Голын гүн: дотор давхарга, дэлбээний ёроол халхлагдана (навчинд үгүй)
petalCol *= mix(1.0, mix(0.45, 1.0, vCavity), uCavity * (1.0 - uLeaf));

diffuseColor.rgb *= petalCol;
#ifdef PETAL_DRIFT
diffuseColor.a *= vDriftFade;
#endif
`;

// roughnessmap_fragment нь normal-оос өмнө — дуслыг тэнд нэг удаа тооцно
const fragmentDewRoughness = /* glsl */ `
vec3 dew = vec3(0.0);
#ifndef PETAL_DRIFT
if (uDew > 0.0) dew = dewDrop(vPetalUv, vPetalSeed);
// Камер дэлбээнд ойртоход (dive) дусал хэт томорч харагдахаас сэргийлж бүдгэрүүлнэ
dew.z *= smoothstep(0.5, 1.4, length(vViewPosition));
roughnessFactor = mix(roughnessFactor, 0.04, dew.z);
#endif
`;

const fragmentDewNormal = /* glsl */ `
#ifndef PETAL_DRIFT
{
  // uv-ийн тангенс орчин (screen-space derivative) — дуслыг бөмбөлөг мэт товойлгоно.
  // Derivative-ийг салаалахаас өмнө (uniform control flow)
  vec3 q0 = dFdx(-vViewPosition);
  vec3 q1 = dFdy(-vViewPosition);
  vec2 st0 = dFdx(vPetalUv);
  vec2 st1 = dFdy(vPetalUv);
  if (dew.z > 0.0) {
    vec3 q1perp = cross(q1, normal);
    vec3 q0perp = cross(normal, q0);
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max(dot(T, T), dot(B, B));
    float sc = det == 0.0 ? 0.0 : inversesqrt(det);
    vec2 bulge = clamp(dew.xy, -1.0, 1.0);
    vec3 dropN = normalize(T * sc * bulge.x * 1.6 + B * sc * bulge.y * 1.6 + normal * sqrt(max(1.0 - dot(bulge, bulge), 0.05)));
    normal = normalize(mix(normal, dropN, dew.z));
  }
}
#endif
`;

const fragmentTranslucency = /* glsl */ `
{
  // Нимгэн гадаргуу: ар талаас тусах гэрэл дэлбээгээр нэвтэрч, ирмэг/үзүүр (хамгийн нимгэн) илүү гэрэлтэнэ
  // Нимгэн гадаргуугаар нэвтэрсэн гэрэл нь дэлбээний өөрийн өнгөөр (trans нь зөвхөн бага зэрэг дулаацуулна).
  // Өнгийг урдаас тусах diffuse гэрэл авч явна — нэвтрэлт нь ар талаас гэрэлтэх үед л.
  float thin = 0.85 + 0.15 * max(smoothstep(0.6, 1.0, abs(pxn)), smoothstep(0.6, 1.0, pv));
  vec3 transAlbedo = diffuseColor.rgb * mix(vec3(1.0), uTransColor, 0.45) * thin * uTranslucency;
  #if NUM_DIR_LIGHTS > 0
  for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
    vec3 Ld = directionalLights[i].direction;
    float back = saturate(dot(-geometryNormal, Ld));
    vec3 H = normalize(Ld + geometryNormal * 0.3);
    float fwd = pow(saturate(dot(geometryViewDir, -H)), 4.0);
    // Гүн дэх дэлбээгээр гэрэл бараг нэвтрэхгүй — нэвтрэлт гадна ирмэгт л тодорно
    reflectedLight.directDiffuse += transAlbedo * directionalLights[i].color * (back * 0.3 + fwd * 0.22) * mix(0.25, 1.0, vCavity);
    #ifndef PETAL_DRIFT
    // Шүүдрийн гялбаа: хурц specular — bloom-оор од мэт гэрэлтэнэ
    if (dew.z > 0.0) {
      float spark = pow(saturate(dot(reflect(-geometryViewDir, normal), Ld)), 90.0);
      totalEmissiveRadiance += directionalLights[i].color * spark * dew.z * 3.5;
    }
    #endif
  }
  #endif

  // Ethereal: ирмэг (нимгэн) ба Fresnel гэрэлтэлт + ёроолын дотоод гэрэл. Навчинд сул.
  float leafDim = mix(1.0, 0.18, uLeaf);
  float fres = pow(1.0 - saturate(abs(dot(geometryNormal, geometryViewDir))), 4.0);
  float rimEdge = smoothstep(0.7, 1.0, abs(pxn)) * smoothstep(0.15, 0.55, pv) + smoothstep(0.82, 1.0, pv) * 0.6;
  // Ханасан ягаан туяа (цагаан болж «сүүн» харагдахаас сэргийлнэ)
  vec3 glowTint = mix(uMidColor, uTransColor, 0.35) * mix(vec3(1.0), uBaseColor / max(uMidColor, vec3(1e-3)), 0.3);
  totalEmissiveRadiance += glowTint * (fres * 0.9 + rimEdge * 0.2) * uGlow * leafDim;
  float heart = (1.0 - smoothstep(0.0, 0.42, pv)) * (1.0 - uLeaf);
  totalEmissiveRadiance += mix(uTransColor, vec3(1.0, 0.86, 0.62), 0.35) * heart * heart * uHeart;
}
`;

/** Material бүр өөрийн (+ хуваалцсан) uniform-уудыг userData-д хадгална — compile үед shader-т холбогдоно */
const uniformsOf = (m: THREE.Material) => m.userData.uniforms as Record<string, THREE.IUniform>;

// Module-level функц — toString() бүх material-д ижил тул program cache хуваалцана.
function onBeforeCompile(this: THREE.Material, shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, uniformsOf(this));
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${vertexPars}`)
    .replace("#include <beginnormal_vertex>", vertexNormal)
    .replace("#include <begin_vertex>", "vec3 transformed = petalPos;")
    .replace("#include <project_vertex>", `#include <project_vertex>\n${vertexCavity}`);
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\n${fragmentPars}`)
    .replace("#include <color_fragment>", `#include <color_fragment>\n${fragmentColor}`)
    .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${fragmentDewRoughness}`)
    .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${fragmentDewNormal}`)
    .replace("#include <lights_fragment_end>", `#include <lights_fragment_end>\n${fragmentTranslucency}`);
}

// Сүүдрийн depth pass: ижил хэлбэр (petalShape) — дэлбээ бие биен дээрээ бодит сүүдэр тусгана
function onBeforeCompileDepth(this: THREE.Material, shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, uniformsOf(this));
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${vertexPars}`)
    .replace("#include <begin_vertex>", "petalSeed = uSeed;\nvec3 transformed = petalShape(uv);");
}

/**
 * `drift`: InstancedMesh-ийн урсах дэлбээ — seed ба fade нь `aDrift` instance attribute-аас,
 * transparent (instance-ууд CPU дээр арнаас урагш эрэмбэлэгдэнэ).
 */
export function createPetalMaterial(
  palette: PetalPalette,
  shared: SharedPetalUniforms,
  seed: number,
  { drift = false }: { drift?: boolean } = {},
) {
  const uniforms = createOwnUniforms(palette, seed);
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: palette.leaf ? 0.6 : 0.62,
    metalness: 0,
    specularIntensity: palette.leaf ? 0.4 : 0.12,
    sheen: 0.7,
    sheenRoughness: 0.45,
    sheenColor: palette.sheen.clone(),
    side: THREE.DoubleSide,
    transparent: drift,
    depthWrite: !drift,
  });
  if (drift) material.defines = { PETAL_DRIFT: "" };
  material.userData.uniforms = { ...uniforms, ...shared };
  material.onBeforeCompile = onBeforeCompile;

  // Урсах дэлбээ сүүдэр тусгахгүй
  const depthMaterial = drift
    ? undefined
    : new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  if (depthMaterial) {
    depthMaterial.userData.uniforms = material.userData.uniforms;
    depthMaterial.onBeforeCompile = onBeforeCompileDepth;
  }
  return { material, uniforms, depthMaterial };
}
