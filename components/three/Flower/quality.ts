"use client";

/**
 * Render-ийн чанарын түвшин. PerformanceMonitor FPS унахад түвшинг бууруулж, сэргэхэд өсгөнө.
 * Mobile (coarse pointer эсвэл нарийн дэлгэц) дээр түвшин бүр нэмэлт хязгаартай:
 * dpr ≤ 1.5, дэлбээний segment цөөн, урсах дэлбээ хагас, postprocessing хөнгөн.
 */
export type QualityTier = 0 | 1 | 2;

export type Quality = {
  dpr: number;
  /** Дэлбээ/навчны PlaneGeometry-ийн segment (shader хэлбэрийг гаргадаг тул нягтрал = гөлгөр байдал) */
  segments: number;
  /** Урсах дэлбээний pool-ийн хэмжээ */
  drift: number;
  /** Агаар мандал: bokeh дугуй, гэрлийн тоосонцрын тоо */
  bokeh: number;
  sparkles: number;
  multisampling: number;
  bloom: { enabled: boolean; levels: number; resolutionScale: number };
  grain: boolean;
  /** Бүтээгдэхүүний зургийн texture-ийн өргөн (px) */
  textureWidth: number;
  /** Key гэрлийн сүүдрийн map (px) — дэлбээ бие биен дээрээ сүүдэр тусгана */
  shadowMap: number;
};

const TIERS: Record<QualityTier, Quality> = {
  0: {
    dpr: 1,
    segments: 16,
    drift: 16,
    bokeh: 8,
    sparkles: 24,
    multisampling: 0,
    bloom: { enabled: false, levels: 4, resolutionScale: 0.5 },
    grain: false,
    textureWidth: 1080,
    shadowMap: 512,
  },
  1: {
    dpr: 1.25,
    segments: 26,
    drift: 28,
    bokeh: 12,
    sparkles: 40,
    multisampling: 0,
    bloom: { enabled: true, levels: 5, resolutionScale: 0.5 },
    grain: false,
    textureWidth: 1920,
    shadowMap: 1024,
  },
  2: {
    dpr: 1.75,
    segments: 44,
    drift: 40,
    bokeh: 16,
    sparkles: 60,
    multisampling: 4,
    bloom: { enabled: true, levels: 8, resolutionScale: 0.5 },
    grain: true,
    textureWidth: 1920,
    shadowMap: 2048,
  },
};

/** Mobile-ийн дээд хязгаар — аль ч түвшинд эдгээрээс давахгүй */
const MOBILE_CAP = { dpr: 1.5, segments: 22, drift: 20, bokeh: 10, sparkles: 30, levels: 5, textureWidth: 1080, shadowMap: 1024 } as const;

export function isMobileDevice() {
  return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
}

export function getQuality(tier: QualityTier, mobile: boolean): Quality {
  const q = TIERS[tier];
  const deviceDpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!mobile) return { ...q, dpr: Math.min(q.dpr, deviceDpr) };
  return {
    dpr: Math.min(q.dpr, MOBILE_CAP.dpr, deviceDpr),
    segments: Math.min(q.segments, MOBILE_CAP.segments),
    drift: Math.min(q.drift, MOBILE_CAP.drift),
    bokeh: Math.min(q.bokeh, MOBILE_CAP.bokeh),
    sparkles: Math.min(q.sparkles, MOBILE_CAP.sparkles),
    multisampling: 0,
    bloom: { ...q.bloom, levels: Math.min(q.bloom.levels, MOBILE_CAP.levels) },
    grain: false,
    textureWidth: Math.min(q.textureWidth, MOBILE_CAP.textureWidth),
    shadowMap: Math.min(q.shadowMap, MOBILE_CAP.shadowMap),
  };
}

/** WebGL2 (эсвэл WebGL1) context үүсгэж чадах эсэх — үгүй бол нүүр 3D-гүй хувилбар руу шилжинэ */
export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
