"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Backdrop } from "./Backdrop";
import type { FlowerParams } from "./params";
import { Peony } from "./Peony";
import { ScrollRig } from "./ScrollRig";
import { defaultWindConfig, type WindConfig } from "./wind";

type Props = {
  params: FlowerParams;
  wind?: WindConfig;
  /** 0.5 сек тутам FPS-ийн текстийг дамжуулна (lab) — React state-гүйгээр DOM-д бичихэд */
  onStats?: (text: string) => void;
  /** Нүүр хуудас: OrbitControls-гүй, bloom + камер scrollMotion.hero-г дагана */
  scrollDriven?: boolean;
  /** false үед render зогсоно (дэлгэцэнд харагдахгүй байхад) */
  active?: boolean;
};

export default function FlowerScene({
  params,
  wind = defaultWindConfig,
  onStats,
  scrollDriven = false,
  active = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [dpr, setDpr] = useState(1.75);
  const bloom = useRef(params.bloom);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 1.7, 5.0], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
    >
      {/* FPS унавал нягтралыг бууруулна, сэргэвэл буцааж өсгөнө */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} flipflops={3} />
      <color attach="background" args={["#1E0F1A"]} />
      <Backdrop />

      <Lights params={params} />

      {/* Peony-гоос өмнө: useFrame нь түрүүлж бүртгэгдэж bloom-ийг тухайн кадрт шинэчилнэ */}
      {scrollDriven && <ScrollRig bloomRef={bloom} reducedMotion={reducedMotion} />}

      <group position-y={0.2}>
        <Peony params={params} wind={wind} reducedMotion={reducedMotion} bloom={scrollDriven ? bloom : undefined} />
      </group>

      {!scrollDriven && (
        <OrbitControls
          makeDefault
          target={[0, -0.15, 0]}
          enablePan={false}
          enableDamping
          minDistance={2.2}
          maxDistance={10}
          autoRotate={params.autoRotate && !reducedMotion}
          autoRotateSpeed={0.6}
        />
      )}

      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          intensity={params.glow}
          luminanceThreshold={params.glowThreshold}
          luminanceSmoothing={0.25}
          radius={0.72}
        />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.28} darkness={params.vignette} />
        {/* Film grain нь кадр бүр өөрчлөгддөг тул reduced motion үед унтраана */}
        <Noise blendFunction={BlendFunction.OVERLAY} opacity={reducedMotion ? 0 : params.grain} />
      </EffectComposer>

      {onStats && <FpsProbe onStats={onStats} />}
    </Canvas>
  );
}

function Lights({ params }: { params: FlowerParams }) {
  return (
    <>
      <hemisphereLight args={["#F6DDE0", "#3A1C30", 0.15]} />
      {/* Key: урд дээд зүүнээс зөөлөн дулаан */}
      <directionalLight position={[-3, 4, 4]} color="#FFF1E6" intensity={params.keyIntensity} />
      {/* Rim / back: ар талаас — дэлбээгээр нэвтэрч ирмэгийг гэрэлтүүлнэ */}
      <directionalLight position={[1.5, 2.2, -5]} color="#F9CFD6" intensity={params.rimIntensity} />
      <directionalLight position={[-2.5, 0.5, -4]} color="#E8B4BC" intensity={params.rimIntensity * 0.35} />
      {/* Доороос бага зэргийн plum fill */}
      <directionalLight position={[3, -1.5, 2]} color="#8A5A78" intensity={0.3} />

      <Environment resolution={128} frames={1} environmentIntensity={params.envIntensity}>
        <color attach="background" args={["#2A1424"]} />
        <Lightformer form="rect" color="#F8F3EC" intensity={2} position={[0, 5, 2]} scale={[8, 3, 1]} target />
        <Lightformer form="circle" color="#E8B4BC" intensity={1.6} position={[-5, 1, -3]} scale={4} target />
        <Lightformer form="rect" color="#C9A87C" intensity={0.8} position={[5, 0, 2]} scale={[2, 5, 1]} target />
      </Environment>
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
