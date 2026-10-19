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
        void main() {
          float d = length((vUv - vec2(0.55, 0.6)) * vec2(1.0, 1.15));
          float glow = 1.0 - smoothstep(0.0, 0.75, d);
          gl_FragColor = vec4(mix(uOuter, uInner, glow * glow), 1.0);
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
