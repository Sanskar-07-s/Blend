import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
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
  currentSection: SectionItem;
  overviewCamera: { position: [number, number, number]; target: [number, number, number] };
  anchors: AnchorsData | null;
  highlightedObject: string | null;
  isDebugOpen: boolean;
  onTransitionComplete: (state: "overview" | "section") => void;
  reducedMotion?: boolean;
  postProcessingEnabled?: boolean;
}

export const ClubRoomScene: React.FC<ClubRoomSceneProps> = ({
  navState,
  currentSection,
  overviewCamera,
  anchors,
  highlightedObject,
  isDebugOpen,
  onTransitionComplete,
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
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 1.5]}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated={false} />

        <color attach="background" args={["#05030a"]} />

        {/* Night environment preset at low intensity so PBR materials never render black */}
        <Environment preset="night" environmentIntensity={0.35} />

        {/* Focused Key Lights & Neon Floods (Max 3-4 lights, no point-light shadows) */}
        <SceneLighting
          assembled={true}
          activeAccentColor={currentSection?.accentColor ?? "#8b5cf6"}
        />

        {/* Subtle floating cyber dust particles */}
        <ParticleField />

        {/* Load room.glb ONCE at origin [0,0,0] - NO manual repositioning */}
        <UnifiedRoomModel highlightedObjectName={highlightedObject} />

        {/* Debug Bounding Boxes & Labels Overlay (Toggle with Key G) */}
        {isDebugOpen && (
          <DebugAnchorOverlay
            anchors={anchors}
            activeSectionId={currentSection?.id}
          />
        )}

        {/* Single Predictable GSAP Camera Timeline Controller */}
        <CameraController
          navState={navState}
          currentSection={currentSection}
          overviewCamera={overviewCamera}
          onTransitionComplete={onTransitionComplete}
          reducedMotion={reducedMotion}
        />

        {/* High performance bloom + vignette pass */}
        <PostProcessingEffects enabled={postProcessingEnabled} />
      </Canvas>
    </div>
  );
};
