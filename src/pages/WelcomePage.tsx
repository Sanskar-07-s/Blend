import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { detectDeviceTier, QualityTier } from "../config/quality";
import { ArrowRight, Compass } from "lucide-react";

// Low-poly procedural club emblem with rotating torus rings & low-poly icosahedron
function ProceduralEmblem({ isExiting }: { isExiting: boolean }) {
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
      {/* Outer Glow Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.0, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#A78BFA"
          emissive="#7C3AED"
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Middle Orbit Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.6, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={1.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Central Low-Poly Core (Icosahedron) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#D946EF"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
          flatShading={true}
        />
      </mesh>

      {/* Central Inner Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[0.98, 0]} />
        <meshBasicMaterial color="#F5F3FF" wireframe={true} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// Subtle background floating dust
function DustField({ count = 80 }: { count?: number }) {
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
      <pointsMaterial size={0.035} color="#C084FC" transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tier, setTier] = useState<QualityTier>("medium");
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.title = "BLENDER CLUB // Welcome";
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    detectDeviceTier().then((detected) => setTier(detected));

    // Low-priority prefetch of /experience and room.glb after 2s idle
    // only if connection is not Save-Data or 2g
    let prefetchTimeout: NodeJS.Timeout | null = null;
    const nav = navigator as any;
    const isSaveData = nav.connection?.saveData === true;
    const isSlow = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";

    if (!isSaveData && !isSlow) {
      prefetchTimeout = setTimeout(() => {
        console.log("[Welcome] Prefetching Experience code & model behind the scenes...");
        // Dynamic import prefetch of the Experience page code
        import("./ExperiencePage").catch(() => {});

        // Low-priority link rel=prefetch for model
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
    }, 800);
  };

  const isLowTier = tier === "low";

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#05030A",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Radial Glow */}
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
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(217, 70, 239, 0.05) 45%, transparent 70%)",
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
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[3, 3, 3]} color="#A78BFA" intensity={2.5} />
            <pointLight position={[-3, -3, 2]} color="#22D3EE" intensity={1.5} />
            <Suspense fallback={null}>
              <ProceduralEmblem isExiting={isExiting} />
              <DustField count={60} />
            </Suspense>
          </Canvas>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: "2px solid rgba(167, 139, 250, 0.5)",
              boxShadow: "0 0 32px rgba(124, 58, 237, 0.4)",
              animation: "spin 12s linear infinite",
            }}
          />
        )}
      </div>

      {/* Top Bar: Wordmark + Direct Skip to Site */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22D3EE",
              boxShadow: "0 0 10px #22D3EE",
            }}
          />
          <span
            className="font-orbitron"
            style={{
              fontSize: "14px",
              letterSpacing: "0.2em",
              color: "#F5F3FF",
              fontWeight: 700,
            }}
          >
            BLENDER CLUB
          </span>
        </div>

        <Link
          to="/club"
          id="welcome-skip-to-site"
          aria-label="Skip 3D studio and go directly to main club site"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#A8A3C7",
            textDecoration: "none",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(20, 16, 42, 0.4)",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F5F3FF";
            e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#A8A3C7";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <Compass size={14} />
          <span>Skip to site</span>
        </Link>
      </header>

      {/* Center / Bottom Content: Title & Interactive Controls */}
      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          maxWidth: "680px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#A78BFA",
            fontWeight: 600,
          }}
        >
          Interactive 3D Virtual Workspace
        </span>

        <h1
          className="font-orbitron"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "0.05em",
            margin: 0,
            background: "linear-gradient(135deg, #FFFFFF 20%, #DDD6FE 60%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 35px rgba(124, 58, 237, 0.4)",
          }}
        >
          BLENDER CLUB
        </h1>

        <p
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            lineHeight: 1.5,
            color: "#A8A3C7",
            margin: 0,
            maxWidth: "520px",
          }}
        >
          Tagline placeholder
        </p>

        <span
          style={{
            fontSize: "13px",
            color: "#6D688D",
            letterSpacing: "0.08em",
          }}
        >
          Enter the studio
        </span>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "14px",
            marginTop: "6px",
          }}
        >
          <button
            onClick={handleEnter}
            id="welcome-enter-btn"
            aria-label="Enter the 3D Studio Experience"
            style={{
              padding: "16px 36px",
              borderRadius: "999px",
              border: "1px solid rgba(167, 139, 250, 0.4)",
              background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(124, 58, 237, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 0 34px rgba(124, 58, 237, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1.0)";
              e.currentTarget.style.boxShadow = "0 0 24px rgba(124, 58, 237, 0.5)";
            }}
          >
            <span>ENTER</span>
            <ArrowRight size={18} />
          </button>

          <Link
            to="/club"
            id="welcome-explore-site-btn"
            style={{
              padding: "16px 28px",
              borderRadius: "999px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(20, 16, 42, 0.6)",
              backdropFilter: "blur(12px)",
              color: "#F5F3FF",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.5)";
              e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.backgroundColor = "rgba(20, 16, 42, 0.6)";
            }}
          >
            Explore Club Site
          </Link>
        </div>
      </div>

      {/* Footer hint */}
      <footer
        style={{
          zIndex: 10,
          fontSize: "12px",
          color: "#6D688D",
          letterSpacing: "0.05em",
        }}
      >
        <span>Full 3D WebGL Studio & Creative Portfolio</span>
      </footer>

      {/* Screen flash / fade to black on ENTER */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#05030A",
          opacity: isExiting ? 1 : 0,
          pointerEvents: "none",
          transition: reducedMotion ? "none" : "opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 100,
        }}
      />
    </main>
  );
};

export default WelcomePage;
