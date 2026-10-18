import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_CONFIG } from "../../config/sceneConfig";

interface SceneLightingProps {
  assembled?: boolean;
  activeAccentColor?: string;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({
  assembled = true,
  activeAccentColor = SCENE_CONFIG.neonPrimaryColor,
}) => {
  const primaryLightRef = useRef<THREE.PointLight>(null);
  const deskLightRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (primaryLightRef.current) {
      primaryLightRef.current.intensity = (assembled ? 2.5 : 1.0) + Math.sin(time * 2.0) * 0.2;
    }
  });

  return (
    <>
      {/* Studio Ambient Fill (Bright enough so black materials are clear and not pitch dark) */}
      <ambientLight
        color="#2a1b4e"
        intensity={assembled ? 1.8 : 0.8}
      />

      {/* Main Overhead Room Light (Centered at Room Center [5, 6, 5]) */}
      <spotLight
        position={[5.0, 6.8, 5.0]}
        target-position={[5.0, 1.5, 4.0]}
        color="#ffffff"
        intensity={assembled ? 5.5 : 2.0}
        angle={Math.PI / 2.5}
        penumbra={0.6}
        distance={20}
        castShadow
      />

      {/* Focused Battle Station Key Light (Over the Gaming Desk [5.5, 3.5, 1.5]) */}
      <spotLight
        ref={deskLightRef}
        position={[6.0, 4.8, 3.0]}
        target-position={[6.0, 2.0, 0.5]}
        color="#f3e8ff"
        intensity={assembled ? 7.0 : 2.0}
        angle={Math.PI / 3}
        penumbra={0.7}
        distance={12}
        castShadow
      />

      {/* Neon Purple Ambient Flood on Wall and Peripherals */}
      <pointLight
        ref={primaryLightRef}
        position={[5.0, 3.5, 2.5]}
        color={activeAccentColor}
        intensity={3.2}
        distance={12}
      />

      {/* Gamer Neon Sign Glow (Positioned directly in front of the neon sign [1.87, 2.61, 0.5]) */}
      <pointLight
        position={[1.87, 2.6, 0.8]}
        color="#06b6d4"
        intensity={assembled ? 4.5 : 1.0}
        distance={6}
      />

      {/* PC Tower RGB internal kicker [7.23, 1.73, 1.5] */}
      <pointLight
        position={[7.2, 1.8, 1.8]}
        color="#ec4899"
        intensity={assembled ? 2.8 : 0.5}
        distance={5}
      />

      {/* Wall Corner Backlight [0, 4.0, 8.0] for the framed gaming art */}
      <pointLight
        position={[0.5, 4.5, 7.5]}
        color="#f59e0b"
        intensity={assembled ? 2.5 : 0.5}
        distance={8}
      />
    </>
  );
};
