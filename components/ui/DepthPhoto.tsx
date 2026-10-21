"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { FlowerPhoto } from "./FlowerPhoto";

/**
 * Бодит зургийг 2.5D болгоно: depth map-аар (scripts/depth-maps.ts) пиксел бүрийг ойр/холоор
 * нь шилжүүлж parallax үүсгэнэ — хулгана руу эргэх, touch төхөөрөмжид удаан хөвөх, scroll-оор
 * бага зэрэг хазайх. three.js-гүй, нэг fullscreen quad (WebGL1). Доор нь энгийн <img> (SSR, LCP,
 * WebGL-гүй, reduced motion) — canvas бэлэн болмогц дээр нь тодорно. Дэлгэцэнд харагдах үед л
 * render хийнэ (gsap.ticker — Lenis-тэй нэг цаг).
 */

type Props = {
  src: string;
  depth: string;
  alt: string;
  /** Анхны зургийн хэмжээ (харьцаа) */
  width: number;
  height: number;
  sizes: string;
  /** Ачаалах үеийн дэвсгэр өнгө */
  color?: string;
  /** Parallax-ийн хүч (зургийн өргөний хувь) */
  strength?: number;
  priority?: boolean;
  className?: string;
  /** true үед хөдөлгөөн зогсоно (давхарласан, харагдахгүй байгаа кадр) */
  paused?: boolean;
  /**
   * Гаднаас (scroll timeline) удирдах камерын байрлал (−1..1) — GSAP энэ object-ийг шууд tween хийнэ.
   * Өгвөл scroll нь гол хөдөлгөөн, хулгана/хөвөлт нь бага хэмжээгээр нэмэгдэнэ.
   */
  drive?: { x: number; y: number };
};

const vertex = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uOffset;
uniform float uAspect;
uniform float uImageAspect;
uniform float uZoom;
varying vec2 vUv;

vec2 cover(vec2 uv) {
  vec2 c = uv - 0.5;
  float s = uAspect / uImageAspect;
  if (s > 1.0) c.y /= s; else c.x *= s;
  return c / uZoom + 0.5;
}

void main() {
  vec2 uv = cover(vUv);
  // Давталттай parallax: шилжсэн цэгийн depth-ээр дахин засна — ирмэг урагдал багасна
  vec2 p = uv;
  for (int i = 0; i < 5; i++) {
    float d = texture2D(uDepth, p).r;
    p = uv + uOffset * (d - 0.45);
  }
  gl_FragColor = vec4(texture2D(uImage, clamp(p, 0.001, 0.999)).rgb, 1.0);
}`;

export function DepthPhoto({
  src,
  depth,
  alt,
  width,
  height,
  sizes,
  color,
  strength = 0.035,
  priority,
  className,
  paused = false,
  drive,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    // Утсанд нэмэлт WebGL context үүсгэхгүй (iOS-ийн санах ойн хязгаар) — энгийн зураг хангалттай
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (!el || !cv || reduced || touch) return;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uOffset = u("uOffset");
    const uAspect = u("uAspect");
    gl.uniform1i(u("uImage"), 0);
    gl.uniform1i(u("uDepth"), 1);
    gl.uniform1f(u("uImageAspect"), width / height);
    gl.uniform1f(u("uZoom"), 1 + strength * 1.6);

    // Pointer (−1..1) → damping-тэй offset; touch-д pointer байхгүй тул удаан Lissajous хөвөлт
    const state = { tx: 0, ty: 0, x: 0, y: 0, hover: false, visible: false, loaded: 0, time: 0 };
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let alive = true;
    const textures = [src, depth].map((url, unit) => {
      const texture = gl.createTexture();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (!alive) return;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        if (++state.loaded === 2) {
          draw();
          setReady(true);
        }
      };
      img.src = unit === 0 && isUnsplash(url) ? unsplashLoader({ src: url, width: 1600, quality: 80 }) : url;
      return texture;
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width: w, height: h } = el.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform1f(uAspect, w / h);
      if (state.loaded === 2) draw();
    };

    function draw() {
      gl!.uniform2f(uOffset, state.x * strength, state.y * strength);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    const tick = (_t: number, dt: number) => {
      if (!state.visible || pausedRef.current || state.loaded < 2) return;
      state.time += dt / 1000;
      // Scroll: элемент дэлгэцийн төвөөс дээш/доош байх тусам бага зэрэг хазайна
      const r = el.getBoundingClientRect();
      const scrollTilt = ((r.top + r.height / 2) / window.innerHeight - 0.5) * 0.6;
      let gx = state.tx;
      let gy = state.ty + scrollTilt;
      if (!state.hover) {
        const k = coarse ? 0.55 : 0.3;
        gx = Math.sin(state.time * 0.35) * k;
        gy = Math.sin(state.time * 0.27 + 1.2) * k * 0.6 + scrollTilt;
      }
      if (drive) {
        // Scroll-оор удирдсан камер + хулгана/хөвөлтийн бага хэмжээ (sticky тул scrollTilt тогтмол — хэрэглэхгүй)
        gx = drive.x + gx * 0.35;
        gy = drive.y + (gy - scrollTilt) * 0.35;
      }
      const f = 1 - Math.exp(-dt / 1000 / 0.35);
      state.x += (gx - state.x) * f;
      state.y += (gy - state.y) * f;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      state.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      state.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      state.hover = true;
    };
    const onLeave = () => {
      state.hover = false;
    };

    const io = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
    });
    io.observe(el);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      setReady(false);
    };
  }, [src, depth, width, height, strength, reduced, drive]);

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)} style={{ backgroundColor: color }}>
      <FlowerPhoto src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      <canvas
        ref={canvas}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-1000 ease-bloom",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

function createProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}
