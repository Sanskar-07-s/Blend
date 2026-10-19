import React, { useRef, useState, useEffect } from "react";
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
          color="#A78BFA"
          emissive="#7C3AED"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Second Inner Ring */}
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <torusGeometry args={[1.2, 0.05, 16, 48]} />
        <meshStandardMaterial
          color="#D946EF"
          emissive="#D946EF"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Floating Center Tech Core (Stylized Low-poly Icosahedron) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#F5F3FF"
          emissive="#7C3AED"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

interface Hero3DAccentProps {
  isLowTier?: boolean;
}

export const Hero3DAccent: React.FC<Hero3DAccentProps> = ({ isLowTier = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isLowTier) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(5, 3, 10, 0) 70%)",
            border: "1px solid rgba(167, 139, 250, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 35px rgba(124, 58, 237, 0.3)",
          }}
        >
          <span className="font-orbitron" style={{ fontSize: "36px", fontWeight: 800, color: "#C084FC" }}>
            BC
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "360px",
        minHeight: "300px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isInView && (
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
      )}
    </div>
  );
};
