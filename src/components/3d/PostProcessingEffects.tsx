import React, { useRef } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface PostProcessingEffectsProps {
  enabled?: boolean;
}

export const PostProcessingEffects: React.FC<PostProcessingEffectsProps> = ({
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <EffectComposer
      multisampling={0}
      enableNormalPass={false}
      renderPriority={1}
    >
      {/* Budget-conscious, high-performance Bloom:
          - High luminanceThreshold so only real neons bloom
          - MipmapBlur enabled
          - Low intensity
      */}
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.3}
        intensity={0.45}
        mipmapBlur
      />
    </EffectComposer>
  );
};
