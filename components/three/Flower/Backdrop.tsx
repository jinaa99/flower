"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

type Props = {
  /** Uniform-ууд эдгээрийг шууд заана — World кадр бүр өнгийг нь өөрчилнө */
  inner: THREE.Color;
  outer: THREE.Color;
};

/** Камераас үл хамаарах screen-space radial gradient: төвд inner, захаараа outer. */
export function Backdrop({ inner, outer }: Props) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uInner: { value: inner },
        uOuter: { value: outer },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.9999, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uInner;
        uniform vec3 uOuter;
        varying vec2 vUv;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void main() {
          // Цэцгийн ард (баруун дээд) өргөн зөөлөн гэрэл + жижиг халуун цөм
          vec2 p = (vUv - vec2(0.6, 0.58)) * vec2(1.0, 1.15);
          float d = length(p);
          float glow = 1.0 - smoothstep(0.0, 0.85, d);
          vec3 col = mix(uOuter, uInner, glow * glow);
          col += uInner * 1.1 * exp(-d * d * 10.0);
          // Зүүн доод буланд бүдэг хоёрдогч гэрэл — гүн мэдрэмж
          float d2 = length((vUv - vec2(0.08, 0.1)) * vec2(1.0, 1.3));
          col += uInner * 0.35 * exp(-d2 * d2 * 7.0);
          // 8-bit gradient-ийн banding-ийг арилгах dithering
          col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
    return { geometry, material };
  }, [inner, outer]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <mesh geometry={geometry} material={material} renderOrder={-1} frustumCulled={false} />;
}
