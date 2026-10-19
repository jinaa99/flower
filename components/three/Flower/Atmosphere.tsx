"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "./math";

/**
 * Цэцгийн эргэн тойрны агаар: (1) bokeh — фокусаас гадуурх гэрлийн зөөлөн дугуйнууд,
 * (2) гэрлийн тоосонцор — цэцгийн ойр анивчих жижиг цэгүүд. Хоёулаа нэг THREE.Points,
 * additive blending, bloom-д барина. Хөдөлгөөн бүхэлдээ GPU-д (uTime) — CPU кадр бүр
 * зөвхөн uniform бичнэ. Reduced motion: uTime тогтмол, статик.
 */

type Props = {
  /** Bokeh-ийн тоо (чанарын түвшнээр) */
  bokeh: number;
  sparkles: number;
  /** Хүч (params.bokeh / params.sparkles) — 0 бол харагдахгүй */
  bokehIntensity: number;
  sparkleIntensity: number;
  reducedMotion: boolean;
};

const PALETTE = ["#E8B4BC", "#D9577E", "#FF8FB4", "#C9A87C", "#B83A6B", "#F6DDE0"].map((h) => new THREE.Color(h));

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uViewport;
  attribute vec4 aMotion; // xyz: хөвөх амплитуд, w: фаз
  attribute vec3 aColor;
  attribute vec2 aSize;   // x: хэмжээ (world), y: 0 = bokeh, 1 = тоосонцор
  varying vec3 vColor;
  varying float vKind;
  varying float vAlpha;

  void main() {
    float t = uTime * mix(0.12, 0.35, aSize.y) + aMotion.w * 6.2831;
    vec3 p = position;
    // Удаан дээш хөвж, тойрог дагуу найгана; дээд хязгаараас доошоо эргэн орно
    p.y = mod(p.y + uTime * mix(0.035, 0.07, aSize.y) + 4.0, 8.0) - 4.0;
    p += aMotion.xyz * vec3(sin(t), sin(t * 0.7 + 1.3), cos(t * 0.9));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(-mv.z, 0.05);
    gl_Position = projectionMatrix * mv;

    // Перспектив хэмжээ; камерт хэт ойр (dive) бол томрохоос сэргийлж тасална
    float px = aSize.x * uViewport * uPixelRatio / dist;
    gl_PointSize = clamp(px, 1.0, 90.0 * uPixelRatio);

    // Ойрхон, захын цэгүүд бүдэгрэнэ; тоосонцор анивчина
    float near = smoothstep(0.35, 1.4, dist);
    float twinkle = aSize.y > 0.5 ? 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.2 + aMotion.w * 40.0), 3.0) : 1.0;
    vAlpha = near * twinkle;
    vColor = aColor;
    vKind = aSize.y;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uBokeh;
  uniform float uSparkle;
  varying vec3 vColor;
  varying float vKind;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float r = length(c);
    if (r > 1.0) discard;
    float a;
    if (vKind < 0.5) {
      // Bokeh: зөөлөн бүдэг диск + маш сул хүрээ (фокусаас гадуурх гэрэл)
      float disk = 1.0 - smoothstep(0.7, 1.0, r);
      float ring = smoothstep(0.55, 0.9, r) * disk;
      a = (disk * exp(-r * r * 1.6) * 0.2 + ring * 0.05) * uBokeh;
    } else {
      // Тоосонцор: хурц төв + зөөлөн гэрэл + нарийн од туяа
      float core = exp(-r * r * 18.0);
      float halo = exp(-r * r * 3.0) * 0.25;
      float rays = (exp(-abs(c.x) * 22.0) + exp(-abs(c.y) * 22.0)) * (1.0 - r) * 0.35;
      a = (core + halo + rays) * uSparkle;
    }
    gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
  }
`;

export function Atmosphere({ bokeh, sparkles, bokehIntensity, sparkleIntensity, reducedMotion }: Props) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(19);
    const n = bokeh + sparkles;
    const position = new Float32Array(n * 3);
    const motion = new Float32Array(n * 4);
    const color = new Float32Array(n * 3);
    const sizes = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const isSparkle = i >= bokeh;
      // Bokeh: цэцгийн ард, хажуугаар өргөн бүсэд. Тоосонцор: цэцгийн ойр бөмбөрцөг бүрхүүлд
      const theta = rand() * Math.PI * 2;
      const radius = isSparkle ? 0.7 + rand() * 2.2 : 2.5 + rand() * 6;
      position[i * 3] = Math.cos(theta) * radius;
      position[i * 3 + 1] = (rand() - 0.5) * 8;
      position[i * 3 + 2] = isSparkle ? Math.sin(theta) * radius : -1.5 - rand() * 7 + Math.sin(theta) * 1.5;
      const amp = isSparkle ? 0.12 : 0.35;
      motion.set([amp * rand(), amp * rand(), amp * rand(), rand()], i * 4);
      const c = PALETTE[Math.floor(rand() * PALETTE.length)];
      color.set([c.r, c.g, c.b], i * 3);
      sizes.set([isSparkle ? 0.012 + rand() * 0.02 : 0.12 + rand() * 0.32, isSparkle ? 1 : 0], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aMotion", new THREE.BufferAttribute(motion, 4));
    g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [bokeh, sparkles]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uViewport: { value: 1 },
          uBokeh: { value: 1 },
          uSparkle: { value: 1 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // Пикселийн хэмжээ = world хэмжээ × (дэлгэцийн өндөр / (2·tan(fov/2))) / зай
  // Uniform-уудыг mesh-ээр дамжуулж бичнэ (hook-д дамжуулсан утгыг шууд mutate хийхгүй)
  const uniforms = () => (points.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;

  useLayoutEffect(() => {
    const u = uniforms();
    if (!u) return;
    u.uPixelRatio.value = dpr;
    u.uViewport.value = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }, [material, size.height, dpr, camera.fov]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const u = uniforms();
    if (!u) return;
    if (!reducedMotion) u.uTime.value += Math.min(delta, 0.1);
    u.uBokeh.value = bokehIntensity;
    u.uSparkle.value = sparkleIntensity;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}
