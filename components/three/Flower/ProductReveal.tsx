"use client";

import { useFrame } from "@react-three/fiber";
import { getImageProps } from "next/image";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";
import { BlendFunction, Effect } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { JourneyState } from "./journey";

/**
 * Dissolve: камер цэцгийн голд хүрэх үед дэлгэц дүүргэсэн дэлбээний render-ийг
 * бүтээгдэхүүний бодит зураг руу уусгана (uIn). Гарцад зураг өөрөө голоосоо ижил
 * хэлбэрээр нээгдэж, ард нь дараагийн цэцгийн ертөнц харагдана (uOut) — нэг цэцгийн
 * голоор нэвтэрч дараагийн ертөнц рүү гарах мэт. EffectComposer дотор fullscreen quad pass.
 *
 * Mask = дэлбээний radial хэлбэр (5 далбаатай, радиусаараа мушгирсан rose curve —
 * цээнэний давхарга мэт) + fbm noise. Ууссан фронт төвөөс гадагш тэлж, ирмэг нь
 * blush гэрлээр зөөлөн гэрэлтэнэ. Зураг 1.12 → 1 томруулалтаар «тогтож», гарцад 1 → 1.2
 * руу камер руу ойртоно. Цаг (time) ашиглахгүй — scroll-оор scrub хийхэд тодорхой, урвуу буцна.
 */
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uIn;
  uniform float uOut;
  uniform float uImageAspect;
  uniform float uHasMap;
  uniform vec3 uEdge;
  uniform vec3 uFallback;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amp * valueNoise(p);
      p = p * 2.03 + 17.1;
      amp *= 0.5;
    }
    return sum;
  }

  // object-fit: cover + төв рүү томруулалт
  vec2 coverUv(vec2 uv, float zoom) {
    vec2 c = uv - 0.5;
    float s = aspect / uImageAspect;
    if (s > 1.0) c.y /= s;
    else c.x *= s;
    return c / zoom + 0.5;
  }

  const float SOFT = 0.07;

  // Фронт төвөөс гадагш тэлнэ: x — нээгдсэн хэсэг (0–1), y — фронтын туузан гэрэл
  vec2 front(float field, float progress, float maxField) {
    float f = mix(-0.22, maxField, progress);
    float reveal = 1.0 - smoothstep(f - SOFT, f, field);
    float edge = clamp(1.0 - abs(field - (f - SOFT * 0.5)) / (SOFT * 0.5), 0.0, 1.0);
    return vec2(reveal, edge * edge * (1.0 - progress));
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    if (uIn <= 0.0 || uOut >= 1.0) {
      outputColor = inputColor;
      return;
    }

    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float r = length(p);
    float a = atan(p.y, p.x);

    // Дэлбээний хэлбэр: 5 далбаа, радиусаараа мушгирна → далбаан дээр фронт түрүүлж тэлнэ
    float lobes = 0.5 + 0.5 * cos(5.0 * a + r * 6.0);
    float shape = r * (1.0 - 0.32 * lobes);
    // Өнцгийг cos/sin-ээр — atan-ийн ±π дээрх үсрэлт noise-д зураас үүсгэхгүй
    float n = fbm(p * 3.2 + vec2(cos(a), sin(a)) * 0.35);
    float field = shape + (n - 0.5) * 0.38;
    float maxField = 0.5 * length(vec2(aspect, 1.0)) + 0.2 + SOFT;

    vec2 fin = front(field, uIn, maxField);
    // Гарц: эсрэг чиглэлд мушгирсан хэлбэр — орохоос өөр хээгээр нээгдэнэ
    vec2 fout = uOut > 0.0 ? front(r * (1.0 - 0.32 * (0.5 + 0.5 * cos(5.0 * a - r * 6.0))) + (n - 0.5) * 0.38, uOut, maxField) : vec2(0.0);
    float photoMask = fin.x * (1.0 - fout.x);

    float settle = uIn * uIn * (3.0 - 2.0 * uIn);
    float zoom = mix(1.12, 1.0, settle) * mix(1.0, 1.2, uOut * uOut);
    vec3 photo = uHasMap > 0.5 ? texture2D(uMap, coverUv(uv, zoom)).rgb : uFallback;

    vec3 color = mix(inputColor.rgb, photo, photoMask) + uEdge * (fin.y + fout.y) * 0.55;
    outputColor = vec4(color, inputColor.a);
  }
`;

class DissolveEffect extends Effect {
  constructor() {
    super("ProductDissolve", fragmentShader, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([
        ["uMap", new THREE.Uniform(null)],
        ["uIn", new THREE.Uniform(0)],
        ["uOut", new THREE.Uniform(0)],
        ["uImageAspect", new THREE.Uniform(1)],
        ["uHasMap", new THREE.Uniform(0)],
        // Uniform өнгө linear орон зайд (THREE.Color hex-ийг sRGB-ээс хөрвүүлнэ)
        ["uEdge", new THREE.Uniform(new THREE.Color("#F6DDE0"))],
        ["uFallback", new THREE.Uniform(new THREE.Color("#3A1C30"))],
      ]),
    });
  }
}

type Props = {
  /** Цэцэг бүрийн бүтээгдэхүүний зураг (/public/images), аяллын дарааллаар */
  images: readonly string[];
  /** Одоогийн шат — энэ болон дараагийн зургийг л санах ойд байлгана */
  stage: number;
  /** ScrollRig кадр бүр бичнэ */
  journey: JourneyState;
  /** Texture-ийн өргөн (px) — чанарын түвшин / mobile-оор */
  textureWidth: number;
};

/**
 * Хэрэгтэй өргөнөөр (WebP/AVIF): Unsplash-ийн зургийг Unsplash CDN-ээс шууд (hotlink),
 * local зургийг Next image optimizer-ээр — srcSet-ийн 1x нь `width`-ээс багагүй хамгийн ойрын өргөн.
 */
function textureUrl(src: string, width: number) {
  if (isUnsplash(src)) return unsplashLoader({ src, width, quality: 75 });
  const { props } = getImageProps({ src, alt: "", width, height: Math.round(width / 1.5) });
  return props.srcSet?.split(", ")[0]?.split(" ")[0] ?? props.src;
}

function syncUniforms(effect: DissolveEffect, journey: JourneyState, texture: THREE.Texture | undefined) {
  const u = effect.uniforms;
  u.get("uIn")!.value = journey.dissolveIn;
  u.get("uOut")!.value = journey.dissolveOut;
  const img = texture?.image as HTMLImageElement | undefined;
  const ready = !!img && img.width > 0;
  u.get("uMap")!.value = ready ? texture : null;
  u.get("uHasMap")!.value = ready ? 1 : 0;
  if (ready) u.get("uImageAspect")!.value = img.width / img.height;
}

export function ProductReveal({ images, stage, journey, textureWidth }: Props) {
  const effect = useMemo(() => new DissolveEffect(), []);
  const cache = useRef(new Map<string, THREE.Texture>());
  const urls = useMemo(() => images.map((src) => textureUrl(src, textureWidth)), [images, textureWidth]);

  // Одоогийн + дараагийн шатны зургийг ачаалж, бусдыг dispose хийнэ.
  // Suspense-гүй — зураг ирэхээс өмнө цэцэг хүлээлгүй харагдана (fallback өнгө).
  useEffect(() => {
    const textures = cache.current;
    const wanted = new Set(urls.slice(stage, stage + 2));
    for (const [src, texture] of textures) {
      if (wanted.has(src)) continue;
      texture.dispose();
      textures.delete(src);
    }
    const loader = new THREE.TextureLoader();
    for (const src of wanted) {
      if (textures.has(src)) continue;
      const texture = loader.load(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      textures.set(src, texture);
    }
  }, [urls, stage]);

  useEffect(() => {
    const textures = cache.current;
    return () => {
      textures.forEach((t) => t.dispose());
      textures.clear();
    };
  }, []);
  useEffect(() => () => effect.dispose(), [effect]);

  // Гарцын үед ч одоогийн шатны зураг (харагдах цэцэг нь дараагийнх)
  useFrame(() => syncUniforms(effect, journey, cache.current.get(urls[journey.stage])));

  return <primitive object={effect} dispose={null} />;
}
