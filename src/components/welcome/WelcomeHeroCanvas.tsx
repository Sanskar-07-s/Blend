import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getActivePalette } from "../../config/palette";
import { QualityTier } from "../../config/quality";

function ProceduralEmblem({ isExiting }: { isExiting: boolean }) {
  const palette = getActivePalette();
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth mouse follow tilt
    groupRef.current.rotation.y += (mouseTarget.current.x - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-mouseTarget.current.y - groupRef.current.rotation.x) * 0.05;

    // Subtle ambient breathing float
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.08;

    // Ring spins
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.6;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.z += delta * 0.3;
    }

    if (isExiting) {
      groupRef.current.scale.multiplyScalar(1 + delta * 3.5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.0, 0.035, 16, 64]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={1.0}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Middle Orbit Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.6, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={palette.accentSoft}
          emissive={palette.accentSoft}
          emissiveIntensity={0.6}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Central Low-Poly Core (Icosahedron) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={palette.wallMain}
          roughness={0.7}
          metalness={0.1}
          flatShading={true}
        />
      </mesh>

      {/* Central Inner Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[0.98, 0]} />
        <meshBasicMaterial color={palette.text} wireframe={true} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function DustField({ count = 60 }: { count?: number }) {
  const palette = getActivePalette();
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 12;
      p[i * 3 + 1] = (Math.random() - 0.5) * 8;
      p[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={palette.accentSoft} transparent opacity={0.3} depthWrite={false} />
    </points>
  );
}

interface WelcomeHeroCanvasProps {
  isExiting: boolean;
  tier: QualityTier;
}

export default function WelcomeHeroCanvas({ isExiting, tier }: WelcomeHeroCanvasProps) {
  const palette = getActivePalette();

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={tier === "high" ? 1.5 : 1.0}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 4]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color={palette.lightCoolRim} />
      <ProceduralEmblem isExiting={isExiting} />
      <DustField count={tier === "high" ? 80 : 40} />
    </Canvas>
  );
}
