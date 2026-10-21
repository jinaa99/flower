"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { getScrollVelocity } from "@/lib/scrollMotion";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

/**
 * Нүүрний «амьд» гэрэл зургийн тайз — НЭГ WebGL canvas (утсанд олон context үүсгэхгүй).
 * Бүлэг бүр бодит зураг + depth map:
 *  - bloom: зураг цэцгийн төвөөс дэлбээ хэлбэртэй, бага зэрэг мушгирсан маскаар «дэлбээлж» нээгдэнэ;
 *  - салхи: depth-ээр ойрын дэлбээнүүд л зөөлөн найгана (хол дэвсгэр хөдлөхгүй);
 *  - pan: камер гүнийн дагуу эргэлдэнэ (scroll + хулгана);
 *  - dive: цэцгийн гол руу ойртож (dolly — ойрын давхарга гадагш тэлнэ), дараагийн цэцэг дээр нь дэлбээлнэ;
 *  - урсах дэлбээ: өнгө нь зургаас өөрөөс нь, гүнээр (ойрынх нь том, бүдэг), scroll-ийн хурдыг дагана.
 * Хөдөлгөөний бүх утга (`motion[i]`) гаднаас — GSAP scroll timeline шууд tween хийнэ.
 */

export type StageChapter = {
  src: string;
  depth: string;
  width: number;
  height: number;
  /** Дэвсгэр (hex) — зураг ирмэгээрээ үүн рүү уусна */
  bg: string;
  /** Цэцгийн төв (зургийн 0–1 координат, y доошоо) */
  focus: readonly [number, number];
};

export type ChapterMotion = {
  /** 0 бол зурагдахгүй */
  visible: number;
  /** 0 = хаалттай, 1 = бүрэн нээгдсэн */
  bloom: number;
  /** 0–1: цэцгийн гол руу нэвтрэх */
  dive: number;
  panX: number;
  panY: number;
  /** Маскаас гадуурх дэвсгэрийн бүрхэлт (0 = доорх бүлэг харагдана) */
  bg: number;
  /** Урсах дэлбээний хэмжээ */
  petals: number;
};

export const createMotion = (first: boolean): ChapterMotion => ({
  visible: first ? 1 : 0,
  bloom: 0,
  dive: 0,
  panX: 0,
  panY: 0,
  bg: first ? 1 : 0,
  petals: 0.45,
});

type Props = {
  chapters: StageChapter[];
  motion: ChapterMotion[];
  /** Одоогийн бүлэг — энэ болон хөрш бүлгийн зургийг л ачаална */
  current: number;
  /** Дэлгэцэнд харагдахгүй үед зогсоно */
  active: boolean;
  onReady?: () => void;
  onFail?: () => void;
  className?: string;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const PHOTO_FRAG = `
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uRes;
uniform vec4 uPanel;
uniform vec2 uFeather;
uniform float uImageAspect;
uniform vec2 uFocus;
uniform float uBloom;
uniform float uDive;
uniform float uTime;
uniform float uBg;
uniform vec2 uPan;
uniform vec3 uBgColor;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 size = uPanel.zw - uPanel.xy;
  vec2 p = (vUv - uPanel.xy) / size;
  float pa = size.x * uRes.x / (size.y * uRes.y);
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
  float feather = smoothstep(0.0, uFeather.x, p.x) * smoothstep(0.0, uFeather.y, p.y);

  float b = clamp(uBloom, 0.0, 1.0);
  float eb = 1.0 - pow(1.0 - b, 3.0);
  float dv = clamp(uDive, 0.0, 1.0);
  float ed = dv * dv * (3.0 - 2.0 * dv);

  // Панелийн координат (төвөөс, y доошоо) → зургийн uv: cover, цэцгийн төв рүү төвлөрнө
  vec2 c = vec2(p.x - 0.5, 0.5 - p.y);
  vec2 ext = vec2(1.0);
  if (pa > uImageAspect) ext.y = uImageAspect / pa; else ext.x = pa / uImageAspect;
  float zoom = 1.06 * mix(1.0, 3.0, ed) * mix(1.24, 1.0, eb);
  vec2 halfExt = ext * 0.5 / zoom;
  vec2 center = clamp(uFocus, halfExt, 1.0 - halfExt);
  vec2 fc = (uFocus - center) * zoom / ext;

  // Дэлбээлэх үед цэцгийн төвийг тойрон бага зэрэг мушгирч задарна
  float ang = (1.0 - eb) * 0.32;
  vec2 rc = c - fc;
  rc = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * rc;
  vec2 cc = rc + fc;
  vec2 uv = center + cc * ext / zoom;

  // Салхи: зөвхөн ойрын (depth өндөр) давхарга найгана; dive үед ойрынх нь гадагш тэлнэ
  float d0 = texture2D(uDepth, uv).r;
  vec2 sway = vec2(noise(uv * 3.2 + vec2(uTime * 0.16, uTime * 0.09)), noise(uv * 3.2 + vec2(5.2 - uTime * 0.12, uTime * 0.15))) - 0.5;
  sway *= 0.012 * d0 * d0;
  vec2 off = uPan * 0.032 + cc * ed * 0.07;
  vec2 q = uv;
  for (int i = 0; i < 3; i++) {
    float d = texture2D(uDepth, q).r;
    q = uv + off * (d - 0.45) + sway;
  }
  vec3 col = texture2D(uImage, clamp(q, 0.001, 0.999)).rgb;

  // Дэлбээлэлтийн маск: 5 дэлбээтэй, радиусаараа мушгирсан хэлбэр + органик ирмэг
  float mask = 1.0;
  if (b < 0.999) {
    vec2 dvec = rc * vec2(pa, 1.0);
    float r = length(dvec);
    float th = atan(dvec.y, dvec.x);
    float lobes = 0.78 + 0.22 * pow(abs(cos(2.5 * th + r * 5.0 - b * 2.4)), 0.7);
    float edge = (noise(vec2(th * 2.2, r * 7.0) + uTime * 0.05) - 0.5) * 0.16;
    // Радиус шугаман (зөөлөн эхлэл/төгсгөлтэй) — дунд үедээ дэлбээний хэлбэр тод харагдана
    float rb = b * b * (3.0 - 2.0 * b);
    float R = 1.95 * rb * (lobes + edge);
    mask = 1.0 - smoothstep(R - 0.14, R, r);
    // Нээгдэж буй ирмэгт нимгэн дэлбээгээр нэвтэрсэн гэрэл мэт бага зэрэг гэгээ
    col += col * smoothstep(R - 0.22, R - 0.04, r) * mask * 0.28 * (1.0 - eb);
  }

  // Dive: захаас харанхуйлж, нүд цэцгийн гол руу төвлөрнө
  col *= mix(1.0, clamp(1.0 - 0.7 * length(c), 0.0, 1.0), ed);

  // Мушгирах/томруулах үед зургийн өөрийн ирмэг кадрт орж ирвэл хатуу зураас биш, дэвсгэрт уусна
  vec2 ie = smoothstep(vec2(0.0), vec2(0.03), q) * smoothstep(vec2(1.0), vec2(0.97), q);
  float a = inside * feather * mask * ie.x * ie.y;
  float alpha = a + uBg * (1.0 - a);
  vec3 rgb = col * a + uBgColor * uBg * (1.0 - a);
  rgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(rgb, alpha);
}`;

const PETAL_VERT = `
attribute vec4 aSeed;
attribute vec2 aSpin;
uniform float uTime;
uniform float uFall;
uniform float uPx;
uniform float uAmount;
uniform vec2 uRes;
varying float vRot;
varying float vBlur;
varying float vAlpha;
varying float vTone;
void main() {
  float near = aSeed.w * aSeed.w * aSeed.w;
  float speed = aSeed.z * mix(0.6, 1.6, near);
  float t = uTime * speed + uFall * mix(0.4, 1.4, near);
  float x = fract(aSeed.x + t * 0.025 + sin(t * 0.9 + aSeed.x * 20.0) * 0.015);
  float y = fract(aSeed.y - t * 0.04);
  gl_Position = vec4(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = mix(12.0, 96.0, near) * uPx;
  vRot = aSpin.x + t * aSpin.y;
  vBlur = near;
  vTone = fract(aSeed.x * 7.31 + aSeed.y * 3.17);
  float edgeFade = smoothstep(0.0, 0.08, y) * smoothstep(1.0, 0.9, y);
  vAlpha = uAmount * edgeFade * mix(1.0, 0.75, near);
}`;

const PETAL_FRAG = `
precision mediump float;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
varying float vRot;
varying float vBlur;
varying float vAlpha;
varying float vTone;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float s = sin(vRot), c = cos(vRot);
  q = mat2(c, -s, s, c) * q;
  // Дэлбээ: нэг үзүүр нь мохоо, нөгөө нь нарийн, бага зэрэг муруй
  float y = q.y;
  float w = 0.5 * sqrt(max(0.0, 1.0 - y * y)) * (0.75 + 0.25 * y) ;
  float x = q.x + 0.12 * (1.0 - y * y);
  float soft = mix(0.05, 0.4, vBlur);
  float a = smoothstep(w, w - soft, abs(x)) * smoothstep(1.0, 1.0 - soft, abs(y));
  vec3 col = vTone < 0.33 ? uC0 : (vTone < 0.66 ? uC1 : uC2);
  // Үзүүр рүү гэгээтэй, голын судалтай — гэрэлд нэвтэрсэн нимгэн дэлбээ
  col *= 0.85 + 0.35 * (0.5 + 0.5 * y) - 0.1 * abs(x) / max(w, 0.05);
  col = mix(col, vec3(1.0), 0.08 * (0.5 + 0.5 * y));
  float alpha = a * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

type Loaded = { image: WebGLTexture; depth: WebGLTexture; aspect: number; colors: [number, number, number][] };

export function BloomStage({ chapters, motion, current, active, onReady, onFail, className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ load: (i: number) => void } | null>(null);
  const activeRef = useRef(active);
  const callbacks = useRef({ onReady, onFail });
  useEffect(() => {
    activeRef.current = active;
    callbacks.current = { onReady, onFail };
  });

  useEffect(() => {
    const cv = canvas.current!;
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      callbacks.current.onFail?.();
      return;
    }
    const photo = program(gl, VERT, PHOTO_FRAG);
    const petal = program(gl, PETAL_VERT, PETAL_FRAG);
    if (!photo || !petal) {
      callbacks.current.onFail?.();
      return;
    }
    const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    // Урсах дэлбээ: ихэнх нь жижиг, алс; цөөхөн нь том, ойр (бүдэг)
    const PETALS = coarse ? 18 : 36;
    const seeds = new Float32Array(PETALS * 4);
    const spins = new Float32Array(PETALS * 2);
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < PETALS; i++) {
      seeds.set([rand(), rand(), 0.6 + rand() * 0.8, rand()], i * 4);
      spins.set([rand() * 6.28, (rand() - 0.5) * 1.6], i * 2);
    }
    const seedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const spinBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spinBuf);
    gl.bufferData(gl.ARRAY_BUFFER, spins, gl.STATIC_DRAW);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const loaded = new Map<number, Loaded>();
    const loading = new Set<number>();
    let alive = true;
    let readySent = false;
    const state = { time: 0, fall: 0, px: 0, py: 0, tx: 0, ty: 0, w: 1, h: 1, dpr: 1 };

    const texture = (img: HTMLImageElement) => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      return t;
    };

    const load = (i: number) => {
      const ch = chapters[i];
      if (!ch || loaded.has(i) || loading.has(i)) return;
      loading.add(i);
      const width = coarse ? 1280 : 2000;
      const urls = [isUnsplash(ch.src) ? unsplashLoader({ src: ch.src, width, quality: 80 }) : ch.src, ch.depth];
      Promise.all(urls.map((u) => loadImage(u)))
        .then(([img, depth]) => {
          if (!alive) return;
          loaded.set(i, {
            image: texture(img),
            depth: texture(depth),
            aspect: ch.width / ch.height,
            colors: petalColors(img, ch.focus),
          });
          if (i === 0 && !readySent) {
            readySent = true;
            callbacks.current.onReady?.();
          }
        })
        .catch(() => i === 0 && callbacks.current.onFail?.())
        .finally(() => loading.delete(i));
    };
    // Хөрш бүлгүүдийг урьдчилан, бусдыг хойшлуулж
    api.current = { load };
    load(0);
    load(1);

    const resize = () => {
      state.dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
      const r = cv.getBoundingClientRect();
      state.w = r.width;
      state.h = r.height;
      cv.width = Math.max(1, Math.round(r.width * state.dpr));
      cv.height = Math.max(1, Math.round(r.height * state.dpr));
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      state.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      state.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const pu = uniforms(gl, photo, ["uImage", "uDepth", "uRes", "uPanel", "uFeather", "uImageAspect", "uFocus", "uBloom", "uDive", "uTime", "uBg", "uPan", "uBgColor"]);
    const tu = uniforms(gl, petal, ["uTime", "uFall", "uPx", "uAmount", "uRes", "uC0", "uC1", "uC2"]);
    const aPos = gl.getAttribLocation(photo, "aPos");
    const aSeed = gl.getAttribLocation(petal, "aSeed");
    const aSpin = gl.getAttribLocation(petal, "aSpin");
    const bgColors = chapters.map((c) => hexToRgb(c.bg));

    const tick = (_t: number, dt: number) => {
      if (!activeRef.current) return;
      const sec = Math.min(dt, 64) / 1000;
      state.time += sec;
      // Scroll хурдтай үед дэлбээ хурдан унана (Lenis хурд)
      state.fall += Math.min(Math.abs(getScrollVelocity()) * 0.004, 0.08);
      const k = 1 - Math.exp(-sec / 0.4);
      state.px += (state.tx * 0.35 - state.px) * k;
      state.py += (state.ty * 0.35 - state.py) * k;

      const portrait = state.h > state.w;
      // Хэвтээ: баруун 64% (зүүн ирмэг уусна). Босоо: дээд 60% (доод ирмэг уусна).
      const panel = portrait ? [0, 0.4, 1, 1] : [0.36, 0, 1, 1];
      const feather = portrait ? [0.0001, 0.32] : [0.34, 0.0001];

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(photo);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(pu.uRes, state.w, state.h);
      gl.uniform4f(pu.uPanel, panel[0], panel[1], panel[2], panel[3]);
      gl.uniform2f(pu.uFeather, feather[0], feather[1]);
      gl.uniform1f(pu.uTime, state.time);
      gl.uniform1i(pu.uImage, 0);
      gl.uniform1i(pu.uDepth, 1);

      let top = -1;
      for (let i = 0; i < chapters.length; i++) {
        const m = motion[i];
        const tex = loaded.get(i);
        if (!m || m.visible <= 0 || !tex) continue;
        top = i;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex.image);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tex.depth);
        gl.uniform1f(pu.uImageAspect, tex.aspect);
        gl.uniform2f(pu.uFocus, chapters[i].focus[0], chapters[i].focus[1]);
        gl.uniform1f(pu.uBloom, m.bloom);
        gl.uniform1f(pu.uDive, m.dive);
        gl.uniform1f(pu.uBg, m.bg);
        gl.uniform2f(pu.uPan, m.panX + state.px, m.panY + state.py);
        const bg = bgColors[i];
        gl.uniform3f(pu.uBgColor, bg[0], bg[1], bg[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.disableVertexAttribArray(aPos);

      // Дээд бүлгийн өнгөөр урсах дэлбээ
      const m = top >= 0 ? motion[top] : null;
      const tex = top >= 0 ? loaded.get(top) : null;
      if (m && tex && m.petals > 0.01) {
        gl.useProgram(petal);
        gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
        gl.enableVertexAttribArray(aSeed);
        gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, spinBuf);
        gl.enableVertexAttribArray(aSpin);
        gl.vertexAttribPointer(aSpin, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(tu.uTime, state.time);
        gl.uniform1f(tu.uFall, state.fall);
        gl.uniform1f(tu.uPx, state.dpr * Math.min(state.w, state.h) / 900);
        gl.uniform1f(tu.uAmount, m.petals * Math.min(m.bloom * 1.4, 1));
        gl.uniform2f(tu.uRes, state.w, state.h);
        const [c0, c1, c2] = tex.colors;
        gl.uniform3f(tu.uC0, c0[0], c0[1], c0[2]);
        gl.uniform3f(tu.uC1, c1[0], c1[1], c1[2]);
        gl.uniform3f(tu.uC2, c2[0], c2[1], c2[2]);
        gl.drawArrays(gl.POINTS, 0, PETALS);
        gl.disableVertexAttribArray(aSeed);
        gl.disableVertexAttribArray(aSpin);
      }
    };
    gsap.ticker.add(tick);

    return () => {
      alive = false;
      api.current = null;
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      loaded.forEach((t) => {
        gl.deleteTexture(t.image);
        gl.deleteTexture(t.depth);
      });
      [quad, seedBuf, spinBuf].forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(photo);
      gl.deleteProgram(petal);
    };
  }, [chapters, motion]);

  // Одоогийн ба хөрш бүлгийн зургийг ачаална
  useEffect(() => {
    api.current?.load(current);
    api.current?.load(current + 1);
    api.current?.load(current - 1);
  }, [current]);

  return <canvas ref={canvas} aria-hidden className={cn("absolute inset-0 size-full", className)} />;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Урсах дэлбээний 3 өнгө — зургийн цэцгийн төвийн орчмоос хамгийн ханасан, гэгээтэй пикселүүд
 * (дэвсгэрийн ногоон/хар биш, цэцгийн өөрийн өнгө).
 */
function petalColors(img: HTMLImageElement, focus: readonly [number, number]): [number, number, number][] {
  const N = 48;
  const cv = document.createElement("canvas");
  cv.width = N;
  cv.height = N;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const fallback: [number, number, number][] = [
    [0.93, 0.72, 0.76],
    [0.85, 0.55, 0.62],
    [0.97, 0.88, 0.86],
  ];
  if (!ctx) return fallback;
  try {
    ctx.drawImage(img, 0, 0, N, N);
    const data = ctx.getImageData(0, 0, N, N).data;
    const px: { c: [number, number, number]; score: number; l: number }[] = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dx = x / N - focus[0];
        const dy = y / N - focus[1];
        if (dx * dx + dy * dy > 0.06) continue;
        const i = (y * N + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        // Ногоон (иш, навч) ба хэт бараан пикселийг алгасна
        if (max < 0.25 || (g > r && g > b)) continue;
        px.push({ c: [r, g, b], score: (max - min) * 0.6 + l, l });
      }
    }
    if (px.length < 6) return fallback;
    px.sort((a, b) => b.score - a.score);
    const pick = (q: number) => px[Math.min(px.length - 1, Math.floor(px.length * q))].c;
    return [pick(0.04), pick(0.15), pick(0.32)];
  } catch {
    return fallback;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function uniforms(gl: WebGLRenderingContext, p: WebGLProgram, names: string[]) {
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) as Record<string, WebGLUniformLocation | null>;
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const v = compile(gl.VERTEX_SHADER, vs);
  const f = compile(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}
