import React from "react";
import { SCENE_CONFIG } from "../../config/sceneConfig";

interface SceneLightingProps {
  activeAccentColor?: string;
  shadows?: boolean;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({
  activeAccentColor = SCENE_CONFIG.neonPrimaryColor,
  shadows = false,
}) => {
  return (
    <>
      {/* 1. Global Ambient Fill: Dark violet tone */}
      <ambientLight color="#0B0716" intensity={0.9} />

      {/* 2. Main Studio Key Spotlight: Primary violet grazing wall facets */}
      <spotLight
        position={[5.0, 6.5, 4.5]}
        target-position={[5.0, 1.5, 4.5]}
        color="#7C3AED"
        intensity={3.2}
        angle={Math.PI / 2.5}
        penumbra={0.7}
        distance={18}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* 3. Battle Station Desk Fill: Subtle cyan rim light grazing the workstation */}
      <spotLight
        position={[6.0, 4.2, 2.5]}
        target-position={[6.0, 1.8, 0.5]}
        color="#22D3EE"
        intensity={1.8}
        angle={Math.PI / 3}
        penumbra={0.7}
        distance={10}
        castShadow={false}
      />

      {/* 4. Active Accent Room Flood: Primary violet or bright accent */}
      <pointLight
        position={[5.0, 3.2, 4.0]}
        color={activeAccentColor || "#7C3AED"}
        intensity={1.0}
        distance={10}
        castShadow={false}
      />

      {/* 5. Neon Sign Key Light: One concentrated magenta accent light on the sign */}
      <pointLight
        position={[1.88, 3.43, 0.8]}
        color="#D946EF"
        intensity={2.2}
        distance={4.5}
        castShadow={false}
      />
    </>
  );
};
