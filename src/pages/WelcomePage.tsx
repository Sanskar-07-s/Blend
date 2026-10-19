import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { detectDeviceTier, QualityTier } from "../config/quality";
import { getActivePalette } from "../config/palette";
import { ArrowRight, Compass } from "lucide-react";

// Low-poly procedural club emblem with rotating torus rings & low-poly icosahedron
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

// Subtle background floating dust
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

export const WelcomePage: React.FC = () => {
  const palette = getActivePalette();
  const navigate = useNavigate();
  const [tier, setTier] = useState<QualityTier>("medium");
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.title = "Blender Club — 3D Studio";
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    detectDeviceTier().then((detected) => setTier(detected));

    // Prefetch /experience and room.glb
    let prefetchTimeout: NodeJS.Timeout | null = null;
    const nav = navigator as any;
    const isSaveData = nav.connection?.saveData === true;
    const isSlow = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";

    if (!isSaveData && !isSlow) {
      prefetchTimeout = setTimeout(() => {
        import("./ExperiencePage").catch(() => {});
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "fetch";
        link.href = "/models/room.glb";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }, 2000);
    }

    return () => {
      if (prefetchTimeout) clearTimeout(prefetchTimeout);
    };
  }, []);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);

    if (reducedMotion) {
      navigate("/experience");
      return;
    }

    setTimeout(() => {
      navigate("/experience");
    }, 700);
  };

  const isLowTier = tier === "low";

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: palette.background,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Radial Lift */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70vw",
          height: "70vw",
          maxWidth: "800px",
          maxHeight: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.backgroundCenter} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 3D Canvas Hero or CSS 2D Fallback for Low Tier */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {!isLowTier ? (
          <Suspense fallback={null}>
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
          </Suspense>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: `2px solid ${palette.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isExiting ? 0 : 0.8,
              transition: "opacity 0.6s ease",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `1px dashed ${palette.accentSoft}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Header bar */}
      <header
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: palette.accent,
            }}
          />
          <span
            className="heading-font"
            style={{
              fontSize: "15px",
              color: palette.text,
            }}
          >
            Blender Club
          </span>
        </div>

        <Link
          to="/club"
          id="welcome-skip-to-site"
          aria-label="Skip 3D studio and go directly to main club site"
          className="btn-secondary"
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            backgroundColor: "rgba(23, 26, 31, 0.8)",
          }}
        >
          <Compass size={14} />
          <span>Skip to site</span>
        </Link>
      </header>

      {/* Center Content: Title & Interactive Controls */}
      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <span
          className="mono-font"
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: palette.accent,
          }}
        >
          Collegiate 3D studio
        </span>

        <h1
          className="heading-font"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
            color: palette.text,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Blender Club
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: palette.textMuted,
            margin: 0,
            maxWidth: "480px",
          }}
        >
          A community of student 3D artists, animators, and technical creators exploring digital design in Blender.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button
            onClick={handleEnter}
            id="welcome-enter-btn"
            aria-label="Enter the 3D Studio Experience"
            className="btn-primary"
            style={{
              padding: "12px 28px",
              fontSize: "15px",
            }}
          >
            <span>Enter studio</span>
            <ArrowRight size={16} />
          </button>

          <Link
            to="/club"
            id="welcome-explore-site-btn"
            className="btn-secondary"
            style={{
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            Explore club site
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: palette.textMuted,
          zIndex: 10,
        }}
      >
        <span className="mono-font">Three.js + Blender PBR</span>
        <span className="mono-font">Scroll to explore</span>
      </footer>

      {/* Exit crossfade */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: palette.background,
          opacity: isExiting ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />
    </main>
  );
};
