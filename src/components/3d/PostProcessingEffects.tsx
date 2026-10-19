import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface PostProcessingEffectsProps {
  enabled?: boolean;
  halfRes?: boolean;
}

export const PostProcessingEffects: React.FC<PostProcessingEffectsProps> = ({
  enabled = true,
  halfRes = false,
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
          - Half resolution on medium tier
      */}
      <Bloom
        luminanceThreshold={0.95}
        luminanceSmoothing={0.15}
        intensity={0.2}
        mipmapBlur
        resolutionScale={1.0}
      />
    </EffectComposer>
  );
};
