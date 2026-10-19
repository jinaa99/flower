"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { FlowerSpec } from "@/data/flowerSpecs";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Flower } from "./Flower";
import { createJourneyState, type JourneyState } from "./journey";
import type { FlowerParams } from "./params";
import { PetalDrift } from "./PetalDrift";
import { ProductReveal } from "./ProductReveal";
import { getQuality, isMobileDevice, type Quality, type QualityTier } from "./quality";
import { ScrollRig } from "./ScrollRig";
import { defaultWindConfig, type WindConfig } from "./wind";
import { World } from "./World";

type Props = {
  /** Lab: нэг цэцэг. Нүүр (scrollDriven): аяллын дарааллаар бүх цэцэг */
  specs: readonly FlowerSpec[];
  params: FlowerParams;
  wind?: WindConfig;
  /** 0.5 сек тутам FPS-ийн текстийг дамжуулна (lab) — React state-гүйгээр DOM-д бичихэд */
  onStats?: (text: string) => void;
  /** Нүүр хуудас: OrbitControls-гүй, камер + цэцэг + ертөнц scrollMotion.hero-г дагана */
  scrollDriven?: boolean;
  /** false үед render зогсоно (дэлгэцэнд харагдахгүй байхад) */
  active?: boolean;
  /** Эхний кадрууд render хийгдсэний дараа нэг удаа (loader-ийг арилгахад) */
  onReady?: () => void;
  /**
   * Дэлгэрэнгүй хуудасны жижиг preview: zoom-гүй (wheel хуудсыг гүйлгэнэ), зөвхөн хэвтээ
   * эргэлт, touch дээр босоо swipe хуудсыг гүйлгэнэ.
   */
  preview?: boolean;
};

const CAMERA_POSITION = [0, 1.7, 5.0] as const;
const ORBIT_TARGET = [0, -0.15, 0] as const;
/** Анхны камерын polar өнцөг — preview энэ өндрөөс л эргэнэ */
const PREVIEW_POLAR = Math.atan2(CAMERA_POSITION[2], CAMERA_POSITION[1] - ORBIT_TARGET[1]);

export default function FlowerScene({
  specs,
  params,
  wind = defaultWindConfig,
  onStats,
  scrollDriven = false,
  active = true,
  onReady,
  preview = false,
}: Props) {
  const reducedMotion = useReducedMotion();
  // Chunk зөвхөн client-д ачаалагдана (ssr: false) тул window-ийг шууд уншиж болно
  const [mobile] = useState(isMobileDevice);
  const [tier, setTier] = useState<QualityTier>(2);
  const quality = useMemo(() => getQuality(tier, mobile), [tier, mobile]);
  // Shader-ууд compileAsync-аар бэлэн болтол render хийхгүй (main thread-ийг блоклохгүй)
  const [compiled, setCompiled] = useState(false);
  // Эхний кадрууд гарсны дараа л дараагийн цэцгийг mount хийнэ — эхний ачааллыг хөнгөлнө
  const [rendered, setRendered] = useState(false);
  const handleReady = useCallback(() => {
    setRendered(true);
    onReady?.();
  }, [onReady]);
  const journey = useMemo(() => createJourneyState(), []);
  // Одоогийн шат — зөвхөн энэ болон дараагийн цэцэг mount (бусад нь unmount → dispose)
  const [stage, setStage] = useState(0);
  const worlds = useMemo(() => (scrollDriven ? specs : specs.slice(0, 1)).map((s) => s.world), [specs, scrollDriven]);
  const images = useMemo(() => specs.map((s) => s.image), [specs]);

  return (
    <Canvas
      frameloop={active && compiled ? "always" : "never"}
      dpr={quality.dpr}
      camera={{ position: CAMERA_POSITION, fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
    >
      {/* FPS унавал чанарын түвшинг нэгээр бууруулна, сэргэвэл өсгөнө; олон дахин хэлбэлзвэл хамгийн бага түвшинд тогтоно */}
      <PerformanceMonitor
        onDecline={() => setTier((t) => (t > 0 ? ((t - 1) as QualityTier) : t))}
        onIncline={() => setTier((t) => (t < 2 ? ((t + 1) as QualityTier) : t))}
        onFallback={() => setTier(0)}
        flipflops={4}
      />
      <color attach="background" args={[specs[0].world.background.outer]} />
      <World worlds={worlds} params={params} journey={scrollDriven ? journey : undefined} />

      {scrollDriven ? (
        <Journey
          specs={specs}
          journey={journey}
          stage={stage}
          onStage={setStage}
          mountNext={rendered}
          segments={quality.segments}
          params={params}
          wind={wind}
          reducedMotion={reducedMotion}
        />
      ) : (
        <group position-y={0.2}>
          <Flower
            key={specs[0].slug}
            spec={specs[0]}
            segments={quality.segments}
            params={params}
            wind={wind}
            reducedMotion={reducedMotion}
          />
        </group>
      )}

      {/* Цэцгийн дараа: камер (ScrollRig) энэ кадрт байрлалаа авсан байна */}
      <PetalDrift
        key={quality.drift}
        count={quality.drift}
        specs={scrollDriven ? specs : specs.slice(0, 1)}
        journey={scrollDriven ? journey : undefined}
        params={params}
        wind={wind}
        reducedMotion={reducedMotion}
      />

      {!scrollDriven && (
        <OrbitControls
          makeDefault
          target={ORBIT_TARGET}
          enablePan={false}
          enableZoom={!preview}
          enableDamping
          minDistance={2.2}
          maxDistance={10}
          minPolarAngle={preview ? PREVIEW_POLAR : 0}
          maxPolarAngle={preview ? PREVIEW_POLAR : Math.PI}
          autoRotate={params.autoRotate && !reducedMotion}
          autoRotateSpeed={0.6}
        />
      )}
      {preview && <VerticalTouchScroll />}

      <Effects quality={quality} params={params} reducedMotion={reducedMotion}>
        {/* Tone mapping-ийн дараа: бүтээгдэхүүний зураг өнгөө хадгална */}
        {scrollDriven && (
          <ProductReveal images={images} stage={stage} journey={journey} textureWidth={quality.textureWidth} />
        )}
      </Effects>

      <Precompile onDone={() => setCompiled(true)} />
      <ReadySignal onReady={handleReady} />
      {onStats && <FpsProbe onStats={onStats} />}
    </Canvas>
  );
}

type EffectsProps = {
  quality: Quality;
  params: FlowerParams;
  reducedMotion: boolean;
  /** ToneMapping-ийн дараа, Vignette-ээс өмнө орох effect */
  children: React.ReactNode;
};

/**
 * Postprocessing — чанарын түвшнээр хөнгөрнө: high = MSAA + бүтэн bloom + grain,
 * medium (mobile) = MSAA-гүй, bloom-ийн mip түвшин цөөн, grain-гүй, low = bloom-гүй.
 */
function Effects({ quality, params, reducedMotion, children }: EffectsProps) {
  const { bloom } = quality;
  return (
    <EffectComposer multisampling={quality.multisampling}>
      {bloom.enabled && (
        <Bloom
          mipmapBlur
          levels={bloom.levels}
          resolutionScale={bloom.resolutionScale}
          intensity={params.glow}
          luminanceThreshold={params.glowThreshold}
          luminanceSmoothing={0.25}
          radius={0.72}
        />
      )}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      {children}
      <Vignette offset={0.28} darkness={params.vignette} />
      {/* Film grain нь кадр бүр өөрчлөгддөг тул reduced motion үед унтраана */}
      {quality.grain && !reducedMotion && <Noise blendFunction={BlendFunction.OVERLAY} opacity={params.grain} />}
    </EffectComposer>
  );
}

/**
 * Scene-ийн бүх material-ийг KHR_parallel_shader_compile-аар (compileAsync) урьдчилан compile
 * хийнэ — эхний render дээр синхрон compile/link хийж main thread-ийг секундээр блоклохгүй.
 * traverseVisible ашигладаг тул энэ үед цэцгүүд visible байх ёстой (Journey).
 */
function Precompile({ onDone }: { onDone: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const done = useRef(onDone);
  useLayoutEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => alive && done.current());
    return () => {
      alive = false;
    };
  }, [gl, scene, camera]);
  return null;
}

/**
 * OrbitControls нь canvas-д `touch-action: none` тавьдаг — preview-д хэвтээ чирэлт эргүүлж,
 * босоо swipe хуудсыг гүйлгэх ёстой. OrbitControls-ийн effect-ийн дараа ажиллана (дараах sibling).
 */
function VerticalTouchScroll() {
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    canvas.style.setProperty("touch-action", "pan-y");
  }, [canvas]);
  return null;
}

/** Shader compile + эхний render дууссаны дараа (3 кадр) нэг удаа дуудна */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const callback = useRef(onReady);
  useLayoutEffect(() => {
    callback.current = onReady;
  });
  useFrame(() => {
    if (frames.current > 3) return;
    if (++frames.current === 3) callback.current();
  });
  return null;
}

type JourneyProps = {
  specs: readonly FlowerSpec[];
  journey: JourneyState;
  stage: number;
  onStage: (stage: number) => void;
  /** false үед зөвхөн одоогийн цэцэг (эхний ачаалал), true үед дараагийнх нь мөн */
  mountNext: boolean;
  segments: number;
  params: FlowerParams;
  wind: WindConfig;
  reducedMotion: boolean;
};

/**
 * Нүүрний аялал: зөвхөн одоогийн болон дараагийн цэцэг mount хийгдэнэ — дараагийнх нь
 * гарцын үед нахиа байдлаар гарч ирнэ. Шат ахихад өмнөх цэцэг unmount болж geometry,
 * material нь dispose хийгдэнэ. Petal shader program бүх цэцэгт нэг тул шинэ цэцэг
 * mount хийхэд shader дахин compile хийгдэхгүй.
 */
function Journey({ specs, journey, stage, onStage, mountNext, segments, params, wind, reducedMotion }: JourneyProps) {
  const blooms = useMemo<RefObject<number>[]>(() => specs.map(() => ({ current: 0 })), [specs]);
  const foci = useMemo(() => specs.map(() => new THREE.Vector3(0, 0.2, 0)), [specs]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const setGroup = useCallback((i: number) => (g: THREE.Group | null) => void (groups.current[i] = g), []);

  return (
    <>
      {/* Цэцгүүдээс өмнө: useFrame нь түрүүлж бүртгэгдэж bloom, харагдах байдлыг тухайн кадрт шинэчилнэ */}
      <ScrollRig
        specs={specs}
        journey={journey}
        blooms={blooms}
        foci={foci}
        groups={groups}
        onStage={onStage}
        reducedMotion={reducedMotion}
      />
      {specs.map((spec, i) =>
        i === stage || (mountNext && i === stage + 1) ? (
          <group key={spec.slug} position-y={0.2}>
            {/* Анх visible — Precompile харагдах объектуудыг л compile хийнэ; ScrollRig эхний кадраас удирдана */}
            <group ref={setGroup(i)}>
              <Flower
                spec={spec}
                params={params}
                wind={wind}
                reducedMotion={reducedMotion}
                bloom={blooms[i]}
                focus={foci[i]}
                segments={segments}
              />
            </group>
          </group>
        ) : null,
      )}
    </>
  );
}

function FpsProbe({ onStats }: { onStats: (text: string) => void }) {
  const acc = useRef({ frames: 0, time: 0, worst: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.frames++;
    a.time += delta;
    if (delta > a.worst) a.worst = delta;
    if (a.time < 0.5) return;
    onStats(
      `${Math.round(a.frames / a.time)} fps · ${((a.time / a.frames) * 1000).toFixed(1)} ms · max ${(a.worst * 1000).toFixed(1)} ms`,
    );
    a.frames = 0;
    a.time = 0;
    a.worst = 0;
  });
  return null;
}
