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
  multisampling: number;
  bloom: { enabled: boolean; levels: number; resolutionScale: number };
  grain: boolean;
  /** Бүтээгдэхүүний зургийн texture-ийн өргөн (px) */
  textureWidth: number;
};

const TIERS: Record<QualityTier, Quality> = {
  0: {
    dpr: 1,
    segments: 12,
    drift: 24,
    multisampling: 0,
    bloom: { enabled: false, levels: 4, resolutionScale: 0.5 },
    grain: false,
    textureWidth: 1080,
  },
  1: {
    dpr: 1.25,
    segments: 16,
    drift: 48,
    multisampling: 0,
    bloom: { enabled: true, levels: 5, resolutionScale: 0.5 },
    grain: false,
    textureWidth: 1920,
  },
  2: {
    dpr: 1.75,
    segments: 24,
    drift: 72,
    multisampling: 4,
    bloom: { enabled: true, levels: 8, resolutionScale: 0.5 },
    grain: true,
    textureWidth: 1920,
  },
};

/** Mobile-ийн дээд хязгаар — аль ч түвшинд эдгээрээс давахгүй */
const MOBILE_CAP = { dpr: 1.5, segments: 16, drift: 36, levels: 5, textureWidth: 1080 } as const;

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
    multisampling: 0,
    bloom: { ...q.bloom, levels: Math.min(q.bloom.levels, MOBILE_CAP.levels) },
    grain: false,
    textureWidth: Math.min(q.textureWidth, MOBILE_CAP.textureWidth),
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
