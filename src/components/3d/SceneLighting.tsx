import React from "react";
import { SCENE_CONFIG } from "../../config/sceneConfig";

interface SceneLightingProps {
  activeAccentColor?: string;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({
  activeAccentColor = SCENE_CONFIG.neonPrimaryColor,
}) => {
  return (
    <>
      {/* 1. Global Ambient Fill */}
      <ambientLight color="#25173f" intensity={1.2} />

      {/* 2. Main Studio Key Spotlight (single shadow caster) */}
      <spotLight
        position={[5.0, 6.5, 4.5]}
        target-position={[5.0, 1.5, 4.5]}
        color="#ffffff"
        intensity={4.2}
        angle={Math.PI / 2.5}
        penumbra={0.6}
        distance={18}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* 3. Battle Station Desk Fill (no shadows) */}
      <spotLight
        position={[6.0, 4.2, 2.5]}
        target-position={[6.0, 1.8, 0.5]}
        color="#ede9fe"
        intensity={3.8}
        angle={Math.PI / 3}
        penumbra={0.7}
        distance={10}
        castShadow={false}
      />

      {/* 4. Active Accent Room Flood (no shadows) */}
      <pointLight
        position={[5.0, 3.2, 4.0]}
        color={activeAccentColor}
        intensity={2.0}
        distance={12}
        castShadow={false}
      />
    </>
  );
};
