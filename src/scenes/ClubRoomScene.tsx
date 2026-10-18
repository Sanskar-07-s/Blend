import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { UnifiedRoomModel } from "../components/3d/UnifiedRoomModel";
import { SceneLighting } from "../components/3d/SceneLighting";
import { ParticleField } from "../components/3d/ParticleField";
import { CameraController } from "../components/3d/CameraController";
import { DebugAnchorOverlay } from "../components/3d/DebugAnchorOverlay";
import { PostProcessingEffects } from "../components/3d/PostProcessingEffects";
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
  postProcessingEnabled?: boolean;
}

function RenderMetricsCollector() {
  useFrame(({ gl }) => {
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
  postProcessingEnabled = true,
}) => {
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
          antialias: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 1.5]}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.autoUpdate = false;
          gl.shadowMap.needsUpdate = true;
        }}
      >
        <RenderMetricsCollector />
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />

        <color attach="background" args={["#05030a"]} />

        <Environment preset="night" environmentIntensity={0.35} />

        <SceneLighting
          activeAccentColor={currentSection?.accentColor ?? "#8b5cf6"}
        />

        <ParticleField />

        <UnifiedRoomModel
          highlightedObjectName={highlightedObject}
          onPrewarmComplete={onPrewarmComplete}
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

        <PostProcessingEffects enabled={postProcessingEnabled} />
      </Canvas>
    </div>
  );
};

export default ClubRoomScene;

