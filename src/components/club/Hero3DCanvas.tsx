import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingProceduralShape() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.3;
      ringRef.current.rotation.z += delta * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.6;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Stylized Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#F28C28"
          emissive="#F28C28"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Second Inner Ring */}
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <torusGeometry args={[1.2, 0.05, 16, 48]} />
        <meshStandardMaterial
          color="#FFB765"
          emissive="#FFB765"
          emissiveIntensity={0.3}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Floating Center Tech Core (Stylized Low-poly Icosahedron) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#2B3038"
          roughness={0.7}
          metalness={0.1}
          wireframe={false}
          flatShading={true}
        />
      </mesh>

      {/* Outer Wireframe Overlay */}
      <mesh>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshBasicMaterial color="#FFB765" wireframe={true} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function Hero3DCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
      }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 4]} intensity={1.5} color="#A78BFA" />
      <pointLight position={[-3, -2, -2]} intensity={1.2} color="#D946EF" />
      <FloatingProceduralShape />
    </Canvas>
  );
}
