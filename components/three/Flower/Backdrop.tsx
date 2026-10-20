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
          // Кино мэт: цэцгийн ард (баруун дээд) зөөлөн гэрлийн тойрог, бусад нь бараг хар.
          // Халуун цөм биш — өргөн, намуухан. Доод хэсэг шал мэт улам бараан.
          vec2 p = (vUv - vec2(0.64, 0.6)) * vec2(1.0, 1.25);
          float d = length(p);
          float pool = exp(-d * d * 4.2);
          vec3 col = mix(uOuter, uInner, pool);
          col += uInner * 0.28 * exp(-d * d * 16.0);
          col *= mix(0.72, 1.0, smoothstep(0.0, 0.5, vUv.y));
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
