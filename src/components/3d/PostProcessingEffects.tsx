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
          - High luminanceThreshold (0.88) so only true neons bloom without washing out shelf
          - MipmapBlur enabled
          - Controlled intensity (0.4)
      */}
      <Bloom
        luminanceThreshold={0.88}
        luminanceSmoothing={0.2}
        intensity={0.4}
        mipmapBlur
      />
    </EffectComposer>
  );
};
