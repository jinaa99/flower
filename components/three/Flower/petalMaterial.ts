"use client";

import * as THREE from "three";
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
 *
 * Бүх material нэг onBeforeCompile функцтэй тул нэг shader program-ыг хуваалцана —
 * ялгаа нь зөвхөн uniform-д.
 */

export const PETAL_SEGMENTS = 24;

/** Бүх дэлбээнд нэг geometry. Байрлалыг shader uv-ээс тооцдог тул plane-ийн хэмжээ хамаагүй. */
export function createPetalGeometry() {
  return new THREE.PlaneGeometry(1, 1, PETAL_SEGMENTS, PETAL_SEGMENTS);
}

export type PetalPalette = {
  base: THREE.Color;
  mid: THREE.Color;
  tip: THREE.Color;
  veinTint: THREE.Color;
  trans: THREE.Color;
  /** 0 = дэлбээний сэвэлгэр судал, 1 = навчны гол + хажуу судал */
  leaf: number;
  /** x: хамгийн өргөн цэгийн exponent, y: үзүүрийн бөөрөнхий (бага = мохоо), z: ёроолын өргөн */
  shape: THREE.Vector3;
};

const c = (hex: string) => new THREE.Color(hex);

export const palettes = {
  // ёроолд гүн blush → blush-300 → ivory үзүүр
  peony: {
    base: c("#B86E86"),
    mid: c("#E3A6B2"),
    tip: c("#F8F3EC"),
    veinTint: c("#E3A9B8"),
    trans: c("#FFD2D6"),
    leaf: 0,
    shape: new THREE.Vector3(1.6, 0.5, 0.14),
  },
  sepal: {
    base: c("#3E5A33"),
    mid: c("#56733F"),
    tip: c("#7A6A44"),
    veinTint: c("#6E8A55"),
    trans: c("#B5CF7A"),
    leaf: 1,
    shape: new THREE.Vector3(1.0, 0.8, 0.2),
  },
  leaf: {
    base: c("#2E4728"),
    mid: c("#3E5E33"),
    tip: c("#4D6C3B"),
    veinTint: c("#7E9C62"),
    trans: c("#A8C772"),
    leaf: 1,
    shape: new THREE.Vector3(0.76, 1.0, 0.04),
  },
} satisfies Record<string, PetalPalette>;

/** Бүх material-д хуваалцах uniform-ууд (lab-аас нэг дор өөрчлөгдөнө). */
export function createSharedPetalUniforms() {
  return {
    uTranslucency: { value: 0.9 },
    uVeins: { value: 0.55 },
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
    uShape: { value: palette.shape },
    uBaseColor: { value: palette.base },
    uMidColor: { value: palette.mid },
    uTipColor: { value: palette.tip },
    uVeinTint: { value: palette.veinTint },
    uTransColor: { value: palette.trans },
    uLeaf: { value: palette.leaf },
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
varying vec2 vPetalUv;

const float CURL_START = 0.38;

// Дэлбээний локал орон зай: ёроол нь эх цэгт, урт нь +Y, дотор (хотгор) тал нь +Z.
vec3 petalShape(vec2 st) {
  float v = clamp(st.y, 0.0, 1.0);
  float xn = st.x * 2.0 - 1.0;

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
  float ph = uSeed * 6.2831;
  float wave = sin(v * 19.0 + xn * 2.0 + ph) * 0.55
             + sin(v * 37.0 - xn * 7.0 + ph * 1.7) * 0.25
             + sin(xn * 21.0 + ph * 2.3) * 0.35 * smoothstep(0.6, 1.0, v);
  float rz = uRuffle * edge * wave * 0.1 * uWidth;

  // Curl: CURL_START-аас дээш нурууны шугам тогтмол муруйлтаар нугарна.
  // Эерэг = гадагш (-Z), сөрөг = дотогш (нахиа, төвийн дэлбээ бөмбөлөг болж хаагдана)
  float L = uLength;
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
  float fl = windNoise(vec3(xn * 0.9 + uSeed * 17.0, v * 1.6 - uWindTime * 1.3, uWindTime * 0.4 + uSeed * 5.0)) * 0.7
           + windNoise(vec3(xn * 2.3 - uSeed * 9.0, v * 3.1 - uWindTime * 2.1, uWindTime * 0.7)) * 0.3;
  float flap = uSway.y * ww + fl * uFlutter * uWindStrength * ww * (0.6 + 0.4 * abs(xn)) * L * 0.08;

  return vec3(cx + uSway.x * ww, sy, sz) + nrm * (cz + rz + flap);
}
`;

const vertexNormal = /* glsl */ `
vec3 petalPos = petalShape(uv);
// Үзүүрт өргөн ~0 тул deriv-ийг арай доороос авна
vec2 uvN = vec2(uv.x, min(uv.y, 0.96));
const vec2 dUv = vec2(0.004, 0.0);
vec3 dU = petalShape(uvN + dUv.xy) - petalShape(uvN - dUv.xy);
vec3 dV = petalShape(uvN + dUv.yx) - petalShape(uvN - dUv.yx);
vec3 objectNormal = normalize(cross(dU, dV));
vPetalUv = uv;
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
uniform float uSeed;
uniform float uLeaf;
varying vec2 vPetalUv;

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
float petalVein = veinLine(pxn * 16.0 + 0.35 * sin(pv * 11.0 + uSeed * 40.0 + pxn * 3.0), 0.05);
float midrib = 1.0 - smoothstep(0.0, 0.03 + fwidth(pxn), abs(pxn));
float lateral = veinLine((pv - abs(pxn) * 0.45) * 9.0, 0.04) * smoothstep(0.03, 0.08, abs(pxn));
float vein = mix(petalVein, max(midrib, lateral * 0.7), uLeaf);
vein *= uVeins * (1.0 - smoothstep(0.75, 1.0, pv));
petalCol = mix(petalCol, petalCol * uVeinTint / max(uMidColor, vec3(1e-3)), vein * 0.6);

// Дэлбээ бүрийн бага зэргийн ялгаа + ёроолын хуурамч ambient occlusion
petalCol *= 0.94 + 0.12 * fract(uSeed * 7.13);
petalCol *= mix(1.0, 0.3 + 0.7 * smoothstep(0.0, 0.5, pv), uAO);

diffuseColor.rgb *= petalCol;
`;

const fragmentTranslucency = /* glsl */ `
{
  // Нимгэн гадаргуу: ар талаас тусах гэрэл дэлбээгээр нэвтэрч, ирмэг/үзүүр (хамгийн нимгэн) илүү гэрэлтэнэ
  float thin = 0.55 + 0.45 * max(smoothstep(0.5, 1.0, abs(pxn)), smoothstep(0.5, 1.0, pv));
  vec3 transAlbedo = diffuseColor.rgb * uTransColor * thin * uTranslucency;
  #if NUM_DIR_LIGHTS > 0
  for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
    vec3 Ld = directionalLights[i].direction;
    float back = saturate(dot(-geometryNormal, Ld));
    vec3 H = normalize(Ld + geometryNormal * 0.3);
    float fwd = pow(saturate(dot(geometryViewDir, -H)), 4.0);
    reflectedLight.directDiffuse += transAlbedo * directionalLights[i].color * (back * 0.4 + fwd * 0.8);
  }
  #endif
}
`;

type WithUniforms = THREE.MeshPhysicalMaterial & { userData: { uniforms: Record<string, THREE.IUniform> } };

// Module-level функц — toString() бүх material-д ижил тул program cache хуваалцана.
function onBeforeCompile(this: WithUniforms, shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, this.userData.uniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${vertexPars}`)
    .replace("#include <beginnormal_vertex>", vertexNormal)
    .replace("#include <begin_vertex>", "vec3 transformed = petalPos;");
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\n${fragmentPars}`)
    .replace("#include <color_fragment>", `#include <color_fragment>\n${fragmentColor}`)
    .replace("#include <lights_fragment_end>", `#include <lights_fragment_end>\n${fragmentTranslucency}`);
}

export function createPetalMaterial(palette: PetalPalette, shared: SharedPetalUniforms, seed: number) {
  const uniforms = createOwnUniforms(palette, seed);
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: palette.leaf ? 0.6 : 0.62,
    metalness: 0,
    specularIntensity: palette.leaf ? 0.4 : 0.12,
    sheen: 0.7,
    sheenRoughness: 0.45,
    sheenColor: palette.leaf ? new THREE.Color("#C9D9A8") : new THREE.Color("#F3D3D8"),
    side: THREE.DoubleSide,
  }) as WithUniforms;
  material.userData.uniforms = { ...uniforms, ...shared };
  material.onBeforeCompile = onBeforeCompile;
  return { material, uniforms };
}
