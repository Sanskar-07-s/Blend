import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { soundEngine } from "../../audio/soundEffects";

interface PlaceholderObjectsProps {
  activeSectionId: string;
  onSelectSection?: (index: number) => void;
  assemblyProgress?: number; // 0 to 1
}

export const PlaceholderObjects: React.FC<PlaceholderObjectsProps> = ({
  activeSectionId,
  onSelectSection,
  assemblyProgress = 1,
}) => {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  const pcFan1Ref = useRef<THREE.Group>(null);
  const pcFan2Ref = useRef<THREE.Group>(null);
  const portalRingsRef = useRef<THREE.Group>(null);
  const dataCubesRef = useRef<THREE.Group>(null);
  const hologramTorusRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Spin PC cooling fans
    if (pcFan1Ref.current) pcFan1Ref.current.rotation.z += delta * 12;
    if (pcFan2Ref.current) pcFan2Ref.current.rotation.z += delta * 12;

    // Rotate holographic portal
    if (portalRingsRef.current) {
      portalRingsRef.current.rotation.y += delta * 0.8;
    }
    if (hologramTorusRef.current) {
      hologramTorusRef.current.rotation.x += delta * 0.9;
      hologramTorusRef.current.rotation.y += delta * 1.3;
    }

    // Floating data cubes animation
    if (dataCubesRef.current) {
      dataCubesRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(Date.now() * 0.002 + i) * 0.05 + (i * 0.2);
        child.rotation.y += delta * (0.5 + i * 0.2);
      });
    }
  });

  const handlePointerOver = (e: any, id: string) => {
    e.stopPropagation();
    setHoveredObject(id);
    document.body.style.cursor = "pointer";
    soundEngine.playHover();
  };

  const handlePointerOut = () => {
    setHoveredObject(null);
    document.body.style.cursor = "auto";
  };

  const getGlowIntensity = (id: string, base: number = 1.5) => {
    const isCurrent = activeSectionId === id;
    const isHovered = hoveredObject === id;
    if (isCurrent) return base * 2.5;
    if (isHovered) return base * 1.8;
    return base * 0.8;
  };

  const getMat = (color: string, id: string, baseGlow: number = 1.5) => (
    <meshStandardMaterial
      color="#100824"
      emissive={color}
      emissiveIntensity={getGlowIntensity(id, baseGlow) * assemblyProgress}
      roughness={0.2}
      metalness={0.8}
    />
  );

  const metalMat = (
    <meshStandardMaterial
      color="#120c22"
      roughness={0.3}
      metalness={0.85}
    />
  );

  // Y-Offset interpolation for intro assembly
  const dropOffset = (1 - assemblyProgress) * 4;

  return (
    <group name="AllPlaceholderObjects">
      {/* =========================================================================
          1. MONITOR RIG (Anchor for "ABOUT")
          Position on desk center
      ========================================================================= */}
      <group
        name="obj-monitor"
        position={[0, 0.77 + dropOffset * 0.8, -0.4]}
        onClick={() => onSelectSection?.(0)}
        onPointerOver={(e) => handlePointerOver(e, "about")}
        onPointerOut={handlePointerOut}
      >
        {/* Monitor Base Stand */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.03, 32]} />
          {metalMat}
        </mesh>
        {/* Stand Pillar */}
        <mesh position={[0, 0.35, -0.05]}>
          <boxGeometry args={[0.08, 0.65, 0.06]} />
          {metalMat}
        </mesh>
        {/* Ultrawide Curved Screen Frame */}
        <mesh position={[0, 0.62, 0.02]} castShadow>
          <boxGeometry args={[1.7, 0.62, 0.04]} />
          {metalMat}
        </mesh>
        {/* Glowing Screen Face (Blender Viewport / Hologram) */}
        <mesh position={[0, 0.62, 0.045]}>
          <planeGeometry args={[1.64, 0.56]} />
          <meshStandardMaterial
            color="#080318"
            emissive="#a855f7"
            emissiveIntensity={getGlowIntensity("about", 1.8)}
            roughness={0.1}
          />
        </mesh>
        {/* Holographic Wireframe Grid over Screen */}
        <mesh position={[0, 0.62, 0.05]}>
          <planeGeometry args={[1.6, 0.52]} />
          <meshBasicMaterial
            color="#c084fc"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
        {/* Floating Blender Icon 3D Diamond */}
        <mesh
          position={[0, 0.62, 0.18]}
          rotation={[0, Math.PI / 4, Math.PI / 4]}
        >
          <octahedronGeometry args={[0.12, 0]} />
          {getMat("#ec4899", "about", 2.5)}
        </mesh>

        {/* Keyboard & Mouse on Desk */}
        <mesh position={[0, 0.015, 0.24]}>
          <boxGeometry args={[0.62, 0.02, 0.2]} />
          {metalMat}
        </mesh>
        {/* RGB Keyboard Underglow */}
        <mesh position={[0, 0.012, 0.24]}>
          <boxGeometry args={[0.64, 0.01, 0.22]} />
          {getMat("#8b5cf6", "about", 2.0)}
        </mesh>
        {/* Gaming Mouse */}
        <mesh position={[0.42, 0.02, 0.24]}>
          <boxGeometry args={[0.08, 0.03, 0.14]} />
          {getMat("#06b6d4", "about", 1.5)}
        </mesh>
      </group>

      {/* =========================================================================
          2. WORKSTATION / TABLET RIG (Anchor for "WHAT WE DO")
          Position on desk left
      ========================================================================= */}
      <group
        name="obj-workstation"
        position={[-0.85, 0.78 + dropOffset * 0.9, -0.3]}
        onClick={() => onSelectSection?.(1)}
        onPointerOver={(e) => handlePointerOver(e, "what-we-do")}
        onPointerOut={handlePointerOut}
      >
        {/* Digital Sculpting Tablet Surface (Angled) */}
        <group position={[0, 0.03, 0.15]} rotation={[-0.25, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.48, 0.02, 0.35]} />
            {metalMat}
          </mesh>
          {/* Active Drawing Screen */}
          <mesh position={[0, 0.012, 0]}>
            <planeGeometry args={[0.42, 0.28]} />
            <meshStandardMaterial
              color="#0d0824"
              emissive="#c084fc"
              emissiveIntensity={getGlowIntensity("what-we-do", 1.8)}
            />
          </mesh>
          {/* Stylus Pen */}
          <mesh position={[0.12, 0.025, 0.04]} rotation={[0, 0.3, 0.05]}>
            <cylinderGeometry args={[0.008, 0.008, 0.18, 12]} />
            {getMat("#06b6d4", "what-we-do", 2.0)}
          </mesh>
        </group>

        {/* Vertical Secondary Reference Screen (Angled towards user) */}
        <group position={[-0.28, 0.35, -0.05]} rotation={[0, 0.35, 0]}>
          <mesh>
            <boxGeometry args={[0.4, 0.6, 0.03]} />
            {metalMat}
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.36, 0.54]} />
            <meshStandardMaterial
              color="#0a051d"
              emissive="#a855f7"
              emissiveIntensity={getGlowIntensity("what-we-do", 1.5)}
            />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          3. OVERCLOCKED PC RIG (Anchor for "PROJECTS")
          Position on desk right
      ========================================================================= */}
      <group
        name="obj-pc"
        position={[1.05, 0.78 + dropOffset * 1.1, -0.3]}
        onClick={() => onSelectSection?.(2)}
        onPointerOver={(e) => handlePointerOver(e, "projects")}
        onPointerOut={handlePointerOut}
      >
        {/* PC Case Chassis (Dark Metallic) */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.3, 0.64, 0.58]} />
          {metalMat}
        </mesh>
        {/* Tempered Glass Side Panel */}
        <mesh position={[-0.155, 0.32, 0]}>
          <boxGeometry args={[0.01, 0.6, 0.54]} />
          <meshPhysicalMaterial
            color="#2a144e"
            roughness={0.05}
            transmission={0.8}
            thickness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
        {/* RGB Front Glass Strip */}
        <mesh position={[0, 0.32, 0.295]}>
          <boxGeometry args={[0.04, 0.58, 0.01]} />
          {getMat("#8b5cf6", "projects", 3.0)}
        </mesh>

        {/* Dual Glowing RGB Fans */}
        <group ref={pcFan1Ref} position={[-0.05, 0.44, 0.15]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.09, 0.015, 16, 24]} />
            {getMat("#c084fc", "projects", 2.5)}
          </mesh>
        </group>
        <group ref={pcFan2Ref} position={[-0.05, 0.2, 0.15]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.09, 0.015, 16, 24]} />
            {getMat("#06b6d4", "projects", 2.5)}
          </mesh>
        </group>

        {/* GPU Liquid Cooling Loop Tubes */}
        <mesh position={[-0.05, 0.3, -0.1]}>
          <torusGeometry args={[0.08, 0.015, 12, 24, Math.PI]} />
          {getMat("#ec4899", "projects", 2.8)}
        </mesh>
      </group>

      {/* =========================================================================
          4. HOLOGRAPHIC STAGE / PORTAL (Anchor for "EVENTS")
          Position center room / back
      ========================================================================= */}
      <group
        name="obj-portal"
        position={[0, 0.05 + dropOffset * 0.7, -1.8]}
        onClick={() => onSelectSection?.(3)}
        onPointerOver={(e) => handlePointerOver(e, "events")}
        onPointerOut={handlePointerOut}
      >
        {/* Pedestal Base */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.12, 32]} />
          {metalMat}
        </mesh>
        {/* Glowing Projector Inset Ring */}
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          {getMat("#ec4899", "events", 3.2)}
        </mesh>

        {/* Rotating Holographic Projection Rings */}
        <group ref={portalRingsRef} position={[0, 0.8, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.45, 0.015, 16, 32]} />
            {getMat("#ec4899", "events", 2.2)}
          </mesh>
          <mesh rotation={[-Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.32, 0.012, 16, 32]} />
            {getMat("#a855f7", "events", 2.0)}
          </mesh>
        </group>

        {/* Floating Holographic Central Core */}
        <mesh
          ref={hologramTorusRef}
          position={[0, 0.8, 0]}
        >
          <icosahedronGeometry args={[0.18, 1]} />
          <meshBasicMaterial
            color="#f43f5e"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Hologram Vertical Light Column */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 2.2, 24, 1, true]} />
          <meshBasicMaterial
            color="#ec4899"
            transparent
            opacity={0.15 * getGlowIntensity("events", 1.0)}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* =========================================================================
          5. CYBER DATA SHELF (Anchor for "LEARNING")
          Position left wall
      ========================================================================= */}
      <group
        name="obj-shelf"
        position={[-3.6, 1.4 + dropOffset * 0.9, -0.6]}
        onClick={() => onSelectSection?.(4)}
        onPointerOver={(e) => handlePointerOver(e, "learning")}
        onPointerOut={handlePointerOut}
      >
        {/* Shelf Planks */}
        {[0, 0.55, 1.1].map((y, idx) => (
          <group key={`shelf-tier-${idx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[0.45, 0.04, 1.8]} />
              {metalMat}
            </mesh>
            {/* Shelf Underglow */}
            <mesh position={[0, -0.025, 0]}>
              <boxGeometry args={[0.4, 0.015, 1.76]} />
              {getMat("#06b6d4", "learning", 2.2)}
            </mesh>
          </group>
        ))}

        {/* Floating Holographic Data Cubes */}
        <group ref={dataCubesRef} position={[0, 0.2, 0]}>
          {[-0.5, -0.15, 0.2, 0.55].map((z, i) => (
            <mesh key={`cube-${i}`} position={[0, 0, z]}>
              <boxGeometry args={[0.14, 0.14, 0.14]} />
              {getMat(i % 2 === 0 ? "#06b6d4" : "#a855f7", "learning", 2.0)}
            </mesh>
          ))}
        </group>
      </group>

      {/* =========================================================================
          6. ERGONOMIC GAMING POD / CHAIR (Anchor for "TEAM")
          Position in front of desk
      ========================================================================= */}
      <group
        name="obj-chair"
        position={[0, dropOffset * 0.8, 0.8]}
        onClick={() => onSelectSection?.(5)}
        onPointerOver={(e) => handlePointerOver(e, "team")}
        onPointerOut={handlePointerOut}
      >
        {/* Base Star Wheel Structure */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 5]} />
          {metalMat}
        </mesh>
        {/* Hydraulic Piston */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
          {metalMat}
        </mesh>
        {/* Seat Cushion */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.55, 0.08, 0.55]} />
          <meshStandardMaterial color="#170e2c" roughness={0.6} />
        </mesh>
        {/* Backrest (Curved Ergonomic Spine) */}
        <mesh position={[0, 0.95, -0.22]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.85, 0.08]} />
          <meshStandardMaterial color="#1a1132" roughness={0.5} />
        </mesh>
        {/* Headrest */}
        <mesh position={[0, 1.42, -0.26]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.32, 0.16, 0.08]} />
          {metalMat}
        </mesh>
        {/* Cyber Neon Accents on Chair */}
        <mesh position={[0, 0.95, -0.17]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.04, 0.7, 0.02]} />
          {getMat("#a855f7", "team", 2.5)}
        </mesh>
        {/* Armrests */}
        <mesh position={[-0.3, 0.68, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.35]} />
          {metalMat}
        </mesh>
        <mesh position={[0.3, 0.68, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.35]} />
          {metalMat}
        </mesh>
      </group>

      {/* =========================================================================
          7. BROADCAST & TROPHY STATION (Anchor for "COMMUNITY")
          Position right wall
      ========================================================================= */}
      <group
        name="obj-audio"
        position={[3.5, 0.8 + dropOffset * 0.9, -0.5]}
        onClick={() => onSelectSection?.(6)}
        onPointerOver={(e) => handlePointerOver(e, "community")}
        onPointerOut={handlePointerOut}
      >
        {/* Console Table */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[0.6, 0.7, 1.6]} />
          {metalMat}
        </mesh>
        {/* Audio Mixer Deck */}
        <mesh position={[0, 0.02, -0.3]}>
          <boxGeometry args={[0.4, 0.04, 0.6]} />
          <meshStandardMaterial color="#180e2f" roughness={0.4} />
        </mesh>
        {/* LED Volume Meters */}
        {[-0.1, 0, 0.1].map((x, i) => (
          <mesh key={`meter-${i}`} position={[x, 0.045, -0.3]}>
            <boxGeometry args={[0.02, 0.01, 0.4]} />
            {getMat(i === 2 ? "#f59e0b" : "#10b981", "community", 2.2)}
          </mesh>
        ))}
        {/* Broadcast Studio Microphone on Boom Arm */}
        <group position={[0, 0.35, 0.3]}>
          <mesh rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
            {metalMat}
          </mesh>
          {/* Mic Capsule */}
          <mesh position={[0.05, 0.22, 0]}>
            <capsuleGeometry args={[0.035, 0.08, 8, 16]} />
            {getMat("#f59e0b", "community", 2.0)}
          </mesh>
        </group>
        {/* 3D Render Golden Trophy Statue */}
        <group position={[0, 0.22, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.1, 0.05, 16]} />
            {metalMat}
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <torusKnotGeometry args={[0.09, 0.028, 64, 16]} />
            {getMat("#f59e0b", "community", 3.0)}
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          8. CYBER ACCESS TERMINAL (Anchor for "JOIN")
          Position front / room portal gate
      ========================================================================= */}
      <group
        name="obj-terminal"
        position={[0, dropOffset * 0.8, 2.2]}
        rotation={[0, Math.PI, 0]}
        onClick={() => onSelectSection?.(7)}
        onPointerOver={(e) => handlePointerOver(e, "join")}
        onPointerOut={handlePointerOut}
      >
        {/* Standing Kiosk Column */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.6, 1.3, 0.35]} />
          {metalMat}
        </mesh>
        {/* Angled Touch Interface Screen */}
        <group position={[0, 1.25, 0.12]} rotation={[-0.45, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.54, 0.36, 0.03]} />
            {metalMat}
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.5, 0.32]} />
            <meshStandardMaterial
              color="#041f17"
              emissive="#10b981"
              emissiveIntensity={getGlowIntensity("join", 2.2)}
            />
          </mesh>
        </group>
        {/* Terminal Glowing Base Beacon */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.04, 32]} />
          {getMat("#10b981", "join", 2.5)}
        </mesh>
      </group>
    </group>
  );
};
