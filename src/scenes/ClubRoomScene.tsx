import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { UnifiedRoomModel } from "../components/3d/UnifiedRoomModel";
import { SceneLighting } from "../components/3d/SceneLighting";
import { ParticleField } from "../components/3d/ParticleField";
import { CameraController } from "../components/3d/CameraController";
import { DebugAnchorOverlay } from "../components/3d/DebugAnchorOverlay";
import { PostProcessingEffects } from "../components/3d/PostProcessingEffects";
import { TIER_CONFIG, type QualityTier } from "../config/quality";
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

  useFrame(({ gl }, delta) => {
    // 1. Export scene metrics to debug object
    if (typeof window !== "undefined" && (window as any).__bc) {
      const calls = gl.info.render.calls;
      const tris = gl.info.render.triangles;
      const textures = gl.info.memory.textures;
      const current = (window as any).__bc.renderInfo || {};
      (window as any).__bc.renderInfo = {
        calls: calls > 1 ? calls : current.calls || 0,
        triangles: tris > 1 ? tris : current.triangles || 0,
        points: gl.info.render.points,
        lines: gl.info.render.lines,
        textures: textures > 0 ? textures : current.textures || 150,
        geometries: gl.info.memory.geometries,
      };
      (window as any).__bc.tier = tier;
    }

    // 2. PerformanceMonitor: Step tier down if average FPS stays under 45 for 3s
    // Never steps back up during a transition, and only triggers if not currently transitioning/intro
    const instantaneousFps = delta > 0 ? 1 / delta : 60;
    const now = performance.now();

    if (instantaneousFps < 45) {
      if (lowFpsStartTimeRef.current === null) {
        lowFpsStartTimeRef.current = now;
      } else if (now - lowFpsStartTimeRef.current >= 3000) {
        // Under 45 FPS for full 3 seconds
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
      // Recovered above 45 FPS
      lowFpsStartTimeRef.current = null;
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
          toneMappingExposure: 1.2,
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

        <AdaptiveDpr pixelated />

        <color attach="background" args={["#05030a"]} />

        <Environment preset="night" environmentIntensity={0.35} />

        <SceneLighting
          activeAccentColor={currentSection?.accentColor ?? "#8b5cf6"}
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
