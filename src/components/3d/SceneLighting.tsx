import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getActivePalette } from "../../config/palette";
import type { NavState } from "../../hooks/useSceneNavigation";
import type { SectionItem } from "../../data/sections";

interface SceneLightingProps {
  navState?: NavState;
  currentSection?: SectionItem;
  shadows?: boolean;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({
  navState = "overview",
  currentSection,
  shadows = false,
}) => {
  const palette = getActivePalette();

  const isSection = navState === "section";
  const targetDim = isSection ? 0.90 : 1.0; // Dim others by at most 10%
  const dimMultiplierRef = useRef(1.0);

  // Room center target for ceiling key light
  const roomCenterRef = useRef<THREE.Object3D>(new THREE.Object3D());
  useEffect(() => {
    roomCenterRef.current.position.set(5.0, 1.8, 4.5);
    roomCenterRef.current.updateMatrixWorld();
  }, []);

  // Spot light for section focus
  const focusLightRef = useRef<THREE.SpotLight>(null);
  const focusTargetRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const focusTargetIntensity = isSection ? 1.4 : 0.0;
  const currentFocusIntensity = useRef(0.0);

  // Position of focused object from section bounding box or cameraTarget
  const targetPos = useRef(new THREE.Vector3(5.0, 2.5, 4.0));

  useEffect(() => {
    if (currentSection) {
      if (currentSection.bbox) {
        targetPos.current.set(...currentSection.bbox.center);
      } else if (currentSection.cameraTarget) {
        targetPos.current.set(...currentSection.cameraTarget);
      }
    }
  }, [currentSection]);

  useFrame((_, delta) => {
    // 0.8s smooth fade transition
    const fadeRate = delta / 0.8;
    dimMultiplierRef.current = THREE.MathUtils.lerp(
      dimMultiplierRef.current,
      targetDim,
      Math.min(fadeRate, 1.0)
    );

    currentFocusIntensity.current = THREE.MathUtils.lerp(
      currentFocusIntensity.current,
      focusTargetIntensity,
      Math.min(fadeRate, 1.0)
    );

    if (focusLightRef.current) {
      focusLightRef.current.intensity = currentFocusIntensity.current;
      focusTargetRef.current.position.lerp(targetPos.current, 0.1);
      focusTargetRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      {/* Target Dummies */}
      <primitive object={roomCenterRef.current} />
      <primitive object={focusTargetRef.current} />

      {/* 1. Hemisphere Light: Sky #CFD8E6, Ground #3A2C22, intensity 0.7 */}
      <hemisphereLight
        color={palette.lightHemisphereSky}
        groundColor={palette.lightHemisphereGround}
        intensity={0.7 * dimMultiplierRef.current}
      />

      {/* 2. Soft Directional "Ceiling Key" from above-front: #FFF1E0, intensity 1.4 */}
      <directionalLight
        position={[5.0, 9.0, 8.5]}
        target={roomCenterRef.current}
        color={palette.lightCeilingKey}
        intensity={1.4 * dimMultiplierRef.current}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* 3. Warm Desk Lamp Spot/Point (3000K, #FFC98A) near the desk, moderate intensity, no shadow */}
      <pointLight
        position={[6.4, 2.6, 2.3]}
        color={palette.lightDeskLamp}
        intensity={1.1 * dimMultiplierRef.current}
        distance={8.0}
        decay={1.8}
        castShadow={false}
      />

      {/* 4. Cool Rim Light #9CC3FF, low intensity, from behind-left for edge definition */}
      <directionalLight
        position={[-4.0, 6.0, -3.0]}
        color={palette.lightCoolRim}
        intensity={0.35 * dimMultiplierRef.current}
        castShadow={false}
      />

      {/* Soft spotlight on focused object: wide cone, warm white, 0.8s fade */}
      <spotLight
        ref={focusLightRef}
        position={[targetPos.current.x, targetPos.current.y + 3.2, targetPos.current.z + 1.8]}
        target={focusTargetRef.current}
        color="#FFF1E0"
        intensity={0}
        angle={Math.PI / 2.8}
        penumbra={0.80}
        distance={14}
        decay={1.2}
        castShadow={false}
      />
    </>
  );
};
