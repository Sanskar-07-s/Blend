import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { UnifiedRoomModel } from "../components/3d/UnifiedRoomModel";
import { SceneLighting } from "../components/3d/SceneLighting";
import { ParticleField } from "../components/3d/ParticleField";
import { CameraController } from "../components/3d/CameraController";
import { DebugAnchorOverlay } from "../components/3d/DebugAnchorOverlay";
import { PostProcessingEffects } from "../components/3d/PostProcessingEffects";
import { TIER_CONFIG, type QualityTier } from "../config/quality";
import { getActivePalette } from "../config/palette";
import type { NavState, AnchorsData } from "../hooks/useSceneNavigation";
import type { SectionItem } from "../data/sections";

interface ClubRoomSceneProps {
  navState: NavState;
  isGoingOverview?: boolean;
  currentSection: SectionItem;
  overviewCamera: { position: [number, number, number]; target: [number, number, number] };
  anchors: AnchorsData | null;
  highlightedObject: string | null;
  isDebugOpen: boolean;
  onTransitionComplete: (state: "overview" | "section") => void;
  onPrewarmComplete?: () => void;
  reducedMotion?: boolean;
  tier?: QualityTier;
  onDegradeTier?: () => void;
  isPaused?: boolean;
}

function RenderMetricsCollector({
  navState,
  tier,
  onDegradeTier,
}: {
  navState: NavState;
  tier: QualityTier;
  onDegradeTier?: () => void;
}) {
  const lowFpsStartTimeRef = useRef<number | null>(null);

  useFrame(({ gl, scene, camera }, delta) => {
    const instantaneousFps = delta > 0 ? 1 / delta : 60;
    const now = performance.now();

    // 1. Export scene metrics to debug object (zero-allocation in useFrame)
    if (typeof window !== "undefined" && (window as any).__bc) {
      const calls = gl.info.render.calls;
      const tris = gl.info.render.triangles;
      const textures = gl.info.memory.textures;
      let rInfo = (window as any).__bc.renderInfo;
      if (!rInfo) {
        rInfo = (window as any).__bc.renderInfo = {
          calls: 0,
          triangles: 0,
          points: 0,
          lines: 0,
          textures: 0,
          geometries: 0,
        };
      }
      if (calls > 1) rInfo.calls = calls;
      if (tris > 1) rInfo.triangles = tris;
      rInfo.points = gl.info.render.points;
      rInfo.lines = gl.info.render.lines;
      if (textures > 0) rInfo.textures = textures;
      (window as any).__bc.tier = tier;
      (window as any).__bc.fps = Math.round(instantaneousFps * 10) / 10;
      if (!(window as any).__bc.frameTimes) {
        (window as any).__bc.frameTimes = [];
      }
      if (delta > 0 && delta < 0.5) {
        const ft = (window as any).__bc.frameTimes;
        ft.push(delta * 1000);
        if (ft.length > 120) ft.shift();
      }
      (window as any).__gl = gl;
      (window as any).__scene = scene;
      (window as any).__camera = camera;
    }

    // 2. PerformanceMonitor: Step tier down if average FPS stays under 45 for 3s
    if (instantaneousFps < 45) {
      if (lowFpsStartTimeRef.current === null) {
        lowFpsStartTimeRef.current = now;
      } else if (now - lowFpsStartTimeRef.current >= 3000) {
        if (
          tier !== "low" &&
          navState !== "transitioning" &&
          navState !== "intro" &&
          onDegradeTier
        ) {
          lowFpsStartTimeRef.current = null;
          onDegradeTier();
        }
      }
    } else {
      lowFpsStartTimeRef.current = null;
    }
  });

  return null;
}

function ShadowController({ shadows }: { shadows: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = shadows;
    gl.shadowMap.autoUpdate = false;
    if (shadows) {
      gl.shadowMap.needsUpdate = true;
    }
  }, [shadows, gl]);

  useFrame(() => {
    if (!shadows && gl.shadowMap.enabled) {
      gl.shadowMap.enabled = false;
    }
  });

  return null;
}

export const ClubRoomScene: React.FC<ClubRoomSceneProps> = ({
  navState,
  isGoingOverview = false,
  currentSection,
  overviewCamera,
  anchors,
  highlightedObject,
  isDebugOpen,
  onTransitionComplete,
  onPrewarmComplete,
  reducedMotion = false,
  tier = "high",
  onDegradeTier,
  isPaused = false,
}) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.high;
  const palette = getActivePalette();
  const isIdle = (navState === "overview" || navState === "section") && !isGoingOverview;

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas
        camera={{
          fov: 48,
          near: 0.1,
          far: 80,
          position: overviewCamera.position,
        }}
        gl={{
          antialias: config.antialias,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={config.dpr}
        shadows={config.shadows}
        frameloop={isPaused ? "never" : "always"}
        onCreated={({ gl }) => {
          if (config.shadows) {
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = true;
          }
        }}
      >
        <ShadowController shadows={config.shadows} />

        <RenderMetricsCollector
          navState={navState}
          tier={tier}
          onDegradeTier={onDegradeTier}
        />

        <PerformanceMonitor
          onDecline={() => {
            if (navState !== "transitioning" && navState !== "intro") {
              onDegradeTier?.();
            }
          }}
          threshold={0.75}
        />

        <color attach="background" args={[palette.background]} />
        {palette.fogEnabled && (
          <fog attach="fog" args={[palette.background, palette.fogNear, palette.fogFar]} />
        )}

        <Environment preset="apartment" environmentIntensity={0.55} />

        <SceneLighting
          navState={navState}
          currentSection={currentSection}
          shadows={config.shadows}
        />

        <ParticleField count={config.particles} />

        <UnifiedRoomModel
          navState={navState}
          overviewCamera={overviewCamera}
          highlightedObjectName={highlightedObject}
          onPrewarmComplete={onPrewarmComplete}
          onIntroComplete={() => onTransitionComplete("overview")}
          reducedMotion={reducedMotion}
          modelUrl={config.modelUrl}
          introDurationMultiplier={config.introDurationMultiplier}
          onDegradeTier={onDegradeTier}
        />

        <Preload all />

        {isDebugOpen && (
          <DebugAnchorOverlay
            anchors={anchors}
            activeSectionId={currentSection?.id}
          />
        )}

        <CameraController
          navState={navState}
          isGoingOverview={isGoingOverview}
          currentSection={currentSection}
          overviewCamera={overviewCamera}
          onTransitionComplete={onTransitionComplete}
          reducedMotion={reducedMotion}
        />

        <PostProcessingEffects
          enabled={config.bloom}
          halfRes={config.bloomHalfRes}
        />
      </Canvas>
    </div>
  );
};

export default ClubRoomScene;
