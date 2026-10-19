import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { NavState } from "../../hooks/useSceneNavigation";
import type { SectionItem } from "../../data/sections";

gsap.ticker.lagSmoothing(0);

interface CameraControllerProps {
  navState: NavState;
  isGoingOverview?: boolean;
  currentSection: SectionItem;
  overviewCamera: { position: [number, number, number]; target: [number, number, number] };
  onTransitionComplete: (state: "overview" | "section") => void;
  reducedMotion?: boolean;
}

const _startCamPos = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _startLookAt = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3();
const _tempLook = new THREE.Vector3();
const _mouseTarget = new THREE.Vector2();
const _mouseCurrent = new THREE.Vector2();

export const CameraController: React.FC<CameraControllerProps> = ({
  navState,
  isGoingOverview = false,
  currentSection,
  overviewCamera,
  onTransitionComplete,
  reducedMotion = false,
}) => {
  const { camera, invalidate } = useThree();
  const currentTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (navState !== "section" && navState !== "overview") return;
      _mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      _mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
      invalidate();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [navState, invalidate]);

  const prevNavStateRef = useRef<NavState>(navState);

  useEffect(() => {
    const prevNavState = prevNavStateRef.current;
    prevNavStateRef.current = navState;

    if (navState === "loading" || navState === "intro") return;

    const isGoingToOverview = navState === "overview" || isGoingOverview;
    const targetPos = isGoingToOverview ? overviewCamera.position : currentSection.cameraPosition;
    const targetLook = isGoingToOverview ? overviewCamera.target : currentSection.cameraTarget;

    if (currentTimeline.current) {
      currentTimeline.current.kill();
      currentTimeline.current = null;
    }

    // Crucial: exactly ONE intro timeline ends directly at the computed overview pose.
    // Transitioning from "intro" to "overview" must NOT launch a second tween or camera motion.
    if (prevNavState === "intro" && navState === "overview") {
      camera.position.set(...targetPos);
      _currentLookAt.set(...targetLook);
      camera.lookAt(_currentLookAt);
      onTransitionComplete("overview");
      return;
    }

    if (reducedMotion) {
      camera.position.set(...targetPos);
      _currentLookAt.set(...targetLook);
      camera.lookAt(_currentLookAt);
      onTransitionComplete(isGoingToOverview ? "overview" : "section");
      return;
    }

    _startCamPos.copy(camera.position);
    _startLookAt.copy(_currentLookAt);

    _targetCamPos.set(...targetPos);
    _targetLookAt.set(...targetLook);

    if (_startCamPos.distanceTo(_targetCamPos) < 0.05 && _startLookAt.distanceTo(_targetLookAt) < 0.05) {
      camera.position.set(...targetPos);
      _currentLookAt.set(...targetLook);
      camera.lookAt(_currentLookAt);
      onTransitionComplete(isGoingToOverview ? "overview" : "section");
      return;
    }

    const isIdleResize = (navState === "overview" || navState === "section") && !isGoingOverview;
    const duration = isIdleResize ? 0.4 : 1.8;
    const arcHeight = isIdleResize ? 0.0 : 0.35;
    const tweenObj = { t: 0 };

    const tl = gsap.timeline({
      onUpdate: () => {
        const progress = tweenObj.t;
        camera.position.x = THREE.MathUtils.lerp(_startCamPos.x, _targetCamPos.x, progress);
        camera.position.z = THREE.MathUtils.lerp(_startCamPos.z, _targetCamPos.z, progress);

        const baseY = THREE.MathUtils.lerp(_startCamPos.y, _targetCamPos.y, progress);
        const arc = arcHeight > 0 ? Math.sin(progress * Math.PI) * arcHeight : 0;
        camera.position.y = baseY + arc;

        _currentLookAt.lerpVectors(_startLookAt, _targetLookAt, progress);
        camera.lookAt(_currentLookAt);
      },
      onComplete: () => {
        camera.position.set(...targetPos);
        _currentLookAt.set(...targetLook);
        camera.lookAt(_currentLookAt);
        if (!isIdleResize) {
          onTransitionComplete(isGoingToOverview ? "overview" : "section");
        }
        currentTimeline.current = null;
      },
    });

    currentTimeline.current = tl;

    tl.to(tweenObj, {
      t: 1,
      duration,
      ease: isIdleResize ? "power2.out" : "power3.inOut",
    });

    return () => {
      if (currentTimeline.current) {
        currentTimeline.current.kill();
      }
    };
  }, [navState, isGoingOverview, currentSection, overviewCamera, reducedMotion, camera, onTransitionComplete]);

  useFrame((_, delta) => {
    if (navState !== "section" && navState !== "overview") return;

    const safeDelta = Math.min(Math.max(delta, 0.008), 0.033);
    const damp = 1 - Math.exp(-3.0 * safeDelta);

    _mouseCurrent.x += (_mouseTarget.x - _mouseCurrent.x) * damp;
    _mouseCurrent.y += (_mouseTarget.y - _mouseCurrent.y) * damp;

    const maxParallax = 0.03;
    const offsetX = _mouseCurrent.x * maxParallax;
    const offsetY = -_mouseCurrent.y * maxParallax;

    _tempLook.copy(_currentLookAt);
    _tempLook.x += offsetX;
    _tempLook.y += offsetY;
    camera.lookAt(_tempLook);
  });

  return null;
};
