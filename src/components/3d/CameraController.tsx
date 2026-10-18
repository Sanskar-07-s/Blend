import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { NavState } from "../../hooks/useSceneNavigation";
import type { SectionItem } from "../../data/sections";

interface CameraControllerProps {
  navState: NavState;
  currentSection: SectionItem;
  overviewCamera: { position: [number, number, number]; target: [number, number, number] };
  onTransitionComplete: (state: "overview" | "section") => void;
  reducedMotion?: boolean;
}

// Memory allocation hygiene: static reusable vectors
const _tempCamTarget = new THREE.Vector3();
const _lookAtTarget = new THREE.Vector3();
const _mouseTarget = new THREE.Vector2();
const _mouseCurrent = new THREE.Vector2();

export const CameraController: React.FC<CameraControllerProps> = ({
  navState,
  currentSection,
  overviewCamera,
  onTransitionComplete,
  reducedMotion = false,
}) => {
  const { camera } = useThree();
  const currentTween = useRef<gsap.core.Timeline | null>(null);

  // Keep track of current camera look-at position in 3D
  const currentLookAt = useRef(new THREE.Vector3(...overviewCamera.target));

  // 1. Mouse parallax setup (only allowed while idle in 'section' or 'overview')
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Disabled during transitions, intro, or loading
      if (navState !== "section" && navState !== "overview") return;
      _mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      _mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [navState]);

  // 2. Predictable GSAP Camera Transitions (Single Source of Camera Motion)
  useEffect(() => {
    if (navState === "loading" || navState === "intro") return;

    // Determine target coordinates
    const isGoingToOverview = navState === "overview" || (navState === "transitioning" && currentSection === null);
    const targetPos = isGoingToOverview ? overviewCamera.position : currentSection.cameraPosition;
    const targetLook = isGoingToOverview ? overviewCamera.target : currentSection.cameraTarget;

    // Kill any existing timeline
    if (currentTween.current) {
      currentTween.current.kill();
      currentTween.current = null;
    }

    if (reducedMotion) {
      camera.position.set(...targetPos);
      currentLookAt.current.set(...targetLook);
      camera.lookAt(currentLookAt.current);
      onTransitionComplete(isGoingToOverview ? "overview" : "section");
      return;
    }

    // Camera proxy object for smooth timeline tween
    const camProxy = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      targetX: currentLookAt.current.x,
      targetY: currentLookAt.current.y,
      targetZ: currentLookAt.current.z,
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        camera.position.set(camProxy.x, camProxy.y, camProxy.z);
        currentLookAt.current.set(camProxy.targetX, camProxy.targetY, camProxy.targetZ);
        camera.lookAt(currentLookAt.current);
      },
      onComplete: () => {
        onTransitionComplete(isGoingToOverview ? "overview" : "section");
        currentTween.current = null;
      },
    });

    currentTween.current = tl;

    // Transition timing: 1.8s power3.inOut with parabolic arc (0.35 unit raise at midpoint)
    const arcHeight = 0.35;
    const midY = Math.max(camProxy.y, targetPos[1]) + arcHeight;

    // X and Z glide smoothly with power3.inOut
    tl.to(camProxy, {
      x: targetPos[0],
      z: targetPos[2],
      targetX: targetLook[0],
      targetY: targetLook[1],
      targetZ: targetLook[2],
      duration: 1.8,
      ease: "power3.inOut",
    }, 0);

    // Y raises at midpoint to clear furniture / room objects
    tl.to(camProxy, {
      y: midY,
      duration: 0.9,
      ease: "power2.out",
    }, 0);

    tl.to(camProxy, {
      y: targetPos[1],
      duration: 0.9,
      ease: "power2.in",
    }, 0.9);

    return () => {
      if (currentTween.current) {
        currentTween.current.kill();
      }
    };
  }, [navState, currentSection, overviewCamera, reducedMotion, camera, onTransitionComplete]);

  // 3. Subtle frame-rate independent mouse parallax (idle only, max 0.03 units)
  useFrame((_, delta) => {
    if (navState !== "section" && navState !== "overview") return;

    const safeDelta = Math.min(Math.max(delta, 0.008), 0.033);
    const damp = 1 - Math.exp(-3.0 * safeDelta);

    _mouseCurrent.x += (_mouseTarget.x - _mouseCurrent.x) * damp;
    _mouseCurrent.y += (_mouseTarget.y - _mouseCurrent.y) * damp;

    const maxParallax = 0.03;
    const offsetX = _mouseCurrent.x * maxParallax;
    const offsetY = -_mouseCurrent.y * maxParallax;

    // Apply micro offset to lookAt without touching position timeline
    _lookAtTarget.copy(currentLookAt.current);
    _lookAtTarget.x += offsetX;
    _lookAtTarget.y += offsetY;
    camera.lookAt(_lookAtTarget);
  });

  return null;
};
