import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { GamingRoomModel } from "../components/3d/GamingRoomModel";
import { SceneLighting } from "../components/3d/SceneLighting";
import { ParticleField } from "../components/3d/ParticleField";
import { CameraController } from "../components/3d/CameraController";
import { PostProcessingEffects } from "../components/3d/PostProcessingEffects";
import { SECTIONS } from "../data/sections";
import { SCENE_CONFIG } from "../config/sceneConfig";

interface ClubRoomSceneProps {
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  isIntroPlaying: boolean;
  onIntroComplete: () => void;
  reducedMotion?: boolean;
  postProcessingEnabled?: boolean;
}

// Inner canvas controller that handles the intro assembly sequence
const IntroOrchestrator: React.FC<{
  isIntroPlaying: boolean;
  onIntroComplete: () => void;
  reducedMotion: boolean;
}> = ({
  isIntroPlaying,
  onIntroComplete,
  reducedMotion,
}) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!isIntroPlaying) return;

    const firstSec = SECTIONS[0];

    if (reducedMotion) {
      camera.position.set(...firstSec.cameraPosition);
      camera.lookAt(...firstSec.cameraTarget);
      onIntroComplete();
      return;
    }

    // Set elevated cinematic vantage point inside the room
    camera.position.set(5.0, 4.2, 5.5);
    camera.lookAt(6.17, 2.15, 0.28);

    const stateObj = {
      camX: 5.0,
      camY: 4.2,
      camZ: 5.5,
      targetX: 6.17,
      targetY: 2.15,
      targetZ: 0.28,
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        camera.position.set(stateObj.camX, stateObj.camY, stateObj.camZ);
        camera.lookAt(stateObj.targetX, stateObj.targetY, stateObj.targetZ);
      },
      onComplete: () => {
        onIntroComplete();
      },
    });

    // Camera sweeps smoothly into Section 01 (Samsung Odyssey Display)
    tl.to(stateObj, {
      camX: firstSec.cameraPosition[0],
      camY: firstSec.cameraPosition[1],
      camZ: firstSec.cameraPosition[2],
      targetX: firstSec.cameraTarget[0],
      targetY: firstSec.cameraTarget[1],
      targetZ: firstSec.cameraTarget[2],
      duration: 2.4,
      ease: "power2.inOut",
    }, 0.2);

    return () => {
      tl.kill();
    };
  }, [isIntroPlaying, reducedMotion, onIntroComplete, camera]);

  return null;
};

export const ClubRoomScene: React.FC<ClubRoomSceneProps> = ({
  currentSectionIndex,
  onSelectSection,
  isIntroPlaying,
  onIntroComplete,
  reducedMotion = false,
  postProcessingEnabled = true,
}) => {
  const currentSection = SECTIONS[currentSectionIndex];

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas
        camera={{
          fov: SCENE_CONFIG.cameraDefaults.fov,
          near: SCENE_CONFIG.cameraDefaults.near,
          far: SCENE_CONFIG.cameraDefaults.far,
          position: [6.17, 2.4, 2.4],
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#05030a"]} />

        <SceneLighting
          assembled={true}
          activeAccentColor={currentSection.accentColor}
        />

        <ParticleField />

        {/* Real Textured GamingRoom.blend 3D Environment & Objects */}
        <GamingRoomModel
          activeSectionId={currentSection.id}
          onSelectSection={onSelectSection}
        />

        <IntroOrchestrator
          isIntroPlaying={isIntroPlaying}
          onIntroComplete={onIntroComplete}
          reducedMotion={reducedMotion}
        />

        <CameraController
          currentSectionIndex={currentSectionIndex}
          isIntroPlaying={isIntroPlaying}
          reducedMotion={reducedMotion}
        />

        <PostProcessingEffects enabled={postProcessingEnabled} />
      </Canvas>
    </div>
  );
};
