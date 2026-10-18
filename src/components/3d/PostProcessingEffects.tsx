import React, { useRef } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

interface PostProcessingEffectsProps {
  enabled?: boolean;
}

export const PostProcessingEffects: React.FC<PostProcessingEffectsProps> = ({
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.8}
        intensity={0.7}
        mipmapBlur
      />
      <Vignette
        offset={0.25}
        darkness={0.6}
      />
    </EffectComposer>
  );
};
