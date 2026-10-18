import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SECTIONS } from "../../data/sections";
import { SCENE_CONFIG } from "../../config/sceneConfig";

interface CameraControllerProps {
  currentSectionIndex: number;
  isIntroPlaying: boolean;
  reducedMotion?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  currentSectionIndex,
  isIntroPlaying,
  reducedMotion = false,
}) => {
  const { camera } = useThree();

  // Mouse parallax tracker with ultra-smooth low-pass filter
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  // 3D camera vector targets and current interpolated state
  const targetCamPos = useRef(new THREE.Vector3(...SCENE_CONFIG.cameraDefaults.overviewPosition));
  const targetLookAt = useRef(new THREE.Vector3(...SCENE_CONFIG.cameraDefaults.overviewTarget));
  const currentLookAt = useRef(new THREE.Vector3(...SCENE_CONFIG.cameraDefaults.overviewTarget));

  // Sync with current section target
  useEffect(() => {
    if (isIntroPlaying) return;

    const section = SECTIONS[currentSectionIndex];
    if (!section) return;

    targetCamPos.current.set(...section.cameraPosition);
    targetLookAt.current.set(...section.cameraTarget);

    if (reducedMotion) {
      camera.position.set(...section.cameraPosition);
      currentLookAt.current.set(...section.cameraTarget);
      camera.lookAt(currentLookAt.current);
    }
  }, [currentSectionIndex, isIntroPlaying, reducedMotion, camera]);

  // Track window mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (isIntroPlaying) return;

    // Clamp delta between 1/120s and 1/30s to prevent uneven frame pacing
    const safeDelta = Math.min(Math.max(delta, 0.008), 0.033);

    // Cinematic exponential damping:
    // lambda = 2.4 for camera position produces a smooth cinematic glide
    // lambda = 3.0 for lookAt target ensures steady, elegant framing
    const posDampFactor = 1 - Math.exp(-2.4 * safeDelta);
    const lookDampFactor = 1 - Math.exp(-3.0 * safeDelta);
    const mouseDampFactor = 1 - Math.exp(-3.5 * safeDelta);

    // 1. Decoupled, ultra-soft mouse parallax
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * mouseDampFactor;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * mouseDampFactor;

    const parallaxFactor = 0.04; // Gentle floating parallax without camera jitter
    const offsetX = mouseCurrent.current.x * parallaxFactor;
    const offsetY = -mouseCurrent.current.y * parallaxFactor;

    // 2. Cinematic continuous camera position interpolation
    camera.position.x += (targetCamPos.current.x + offsetX - camera.position.x) * posDampFactor;
    camera.position.y += (targetCamPos.current.y + offsetY - camera.position.y) * posDampFactor;
    camera.position.z += (targetCamPos.current.z - camera.position.z) * posDampFactor;

    // 3. Cinematic continuous lookAt target interpolation
    currentLookAt.current.x += (targetLookAt.current.x + offsetX * 0.15 - currentLookAt.current.x) * lookDampFactor;
    currentLookAt.current.y += (targetLookAt.current.y + offsetY * 0.15 - currentLookAt.current.y) * lookDampFactor;
    currentLookAt.current.z += (targetLookAt.current.z - currentLookAt.current.z) * lookDampFactor;

    camera.lookAt(currentLookAt.current);
  });

  return null;
};
