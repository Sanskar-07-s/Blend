import React, { useMemo } from "react";
import * as THREE from "three";
import { SCENE_CONFIG } from "../../config/sceneConfig";
import { getActivePalette } from "../../config/palette";

interface ParticleFieldProps {
  count?: number;
}

// Ultra-lightweight custom ShaderMaterial running entirely on GPU:
// No per-frame JS CPU transformations!
const ParticleShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: SCENE_CONFIG.particles.size * 25.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
      vColor = color;
      vec3 pos = position;
      // Gentle subtle floating oscillation in vertex shader
      pos.y += sin(uTime * 0.4 + position.x * 0.5) * 0.12;
      pos.x += cos(uTime * 0.2 + position.z * 0.5) * 0.08;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = uSize * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;

    void main() {
      // Soft round particle
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.1, dist) * 0.6;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
};

export const ParticleField: React.FC<ParticleFieldProps> = ({ count = 300 }) => {
  const [positions, colors] = useMemo(() => {
    const palette = getActivePalette();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorA = new THREE.Color(palette.accent);
    const colorB = new THREE.Color(palette.accentSoft);

    for (let i = 0; i < count; i++) {
      // Confined directly within room bounds: X: 0..10, Y: 0.5..5.5, Z: 0..9.5
      pos[i * 3] = Math.random() * 10;
      pos[i * 3 + 1] = 0.5 + Math.random() * 5.0;
      pos[i * 3 + 2] = Math.random() * 9.5;

      const mixed = Math.random() > 0.4 ? colorA : colorB;
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [count]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: ParticleShaderMaterial.uniforms,
      vertexShader: ParticleShaderMaterial.vertexShader,
      fragmentShader: ParticleShaderMaterial.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  return (
    <points material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  );
};
