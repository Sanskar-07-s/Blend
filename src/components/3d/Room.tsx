import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface RoomAssemblyState {
  floorOffset: number;
  backWallOffset: number;
  leftWallOffset: number;
  rightWallOffset: number;
  ceilingOffset: number;
  deskOffset: number;
  neonPower: number;
}

interface RoomProps {
  assemblyState?: RoomAssemblyState;
  activeAccentColor?: string;
}

export const Room: React.FC<RoomProps> = ({
  assemblyState = {
    floorOffset: 0,
    backWallOffset: 0,
    leftWallOffset: 0,
    rightWallOffset: 0,
    ceilingOffset: 0,
    deskOffset: 0,
    neonPower: 1,
  },
  activeAccentColor = "#a855f7",
}) => {
  const ceilingLightRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ceilingLightRef.current) {
      const t = clock.getElapsedTime();
      ceilingLightRef.current.position.y = 4.8 + Math.sin(t * 0.8) * 0.02;
    }
  });

  const neonMat = (color: string = "#a855f7", intensity: number = 2.4) => (
    <meshStandardMaterial
      color="#0a0518"
      emissive={color}
      emissiveIntensity={intensity * assemblyState.neonPower}
      roughness={0.2}
      metalness={0.8}
    />
  );

  // Modern Matte Gaming Cyber Walls (charcoal / dark obsidian)
  const wallMat = (
    <meshStandardMaterial
      color="#0c0915"
      roughness={0.4}
      metalness={0.65}
    />
  );

  // Dark brushed carbon floor
  const floorMat = (
    <meshStandardMaterial
      color="#080610"
      roughness={0.25}
      metalness={0.8}
    />
  );

  return (
    <group name="CyberGamingRoomArchitecture">
      {/* 1. FLOOR */}
      <group position={[0, -assemblyState.floorOffset, 0]}>
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[10.2, 0.1, 10.2]} />
          {floorMat}
        </mesh>

        {/* Floor Neon Perimeter Accents */}
        <mesh position={[0, 0.005, -4.85]}>
          <boxGeometry args={[9.8, 0.015, 0.06]} />
          {neonMat(activeAccentColor, 3.0)}
        </mesh>
        <mesh position={[-4.85, 0.005, 0]}>
          <boxGeometry args={[0.06, 0.015, 9.8]} />
          {neonMat("#06b6d4", 2.4)}
        </mesh>
        <mesh position={[4.85, 0.005, 0]}>
          <boxGeometry args={[0.06, 0.015, 9.8]} />
          {neonMat("#06b6d4", 2.4)}
        </mesh>

        {/* Subtle Cyber Floor Grid Ring */}
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.24, 64]} />
          {neonMat(activeAccentColor, 2.5)}
        </mesh>
      </group>

      {/* 2. BACK WALL */}
      <group position={[0, 0, -4.95 - assemblyState.backWallOffset]}>
        {/* Main Wall Surface */}
        <mesh position={[0, 2.8, 0]} receiveShadow>
          <boxGeometry args={[10.2, 5.6, 0.2]} />
          {wallMat}
        </mesh>

        {/* Vertical Neon Light Pillars on Wall */}
        {[-3.6, -1.8, 1.8, 3.6].map((x, i) => (
          <group key={`back-pillar-${i}`} position={[x, 2.8, 0.11]}>
            <mesh>
              <boxGeometry args={[0.08, 4.4, 0.04]} />
              {neonMat(i % 2 === 0 ? "#a855f7" : "#06b6d4", 2.8)}
            </mesh>
          </group>
        ))}

        {/* Horizontal Neon Crown Strip */}
        <mesh position={[0, 5.0, 0.11]}>
          <boxGeometry args={[9.6, 0.05, 0.04]} />
          {neonMat(activeAccentColor, 3.2)}
        </mesh>
      </group>

      {/* 3. LEFT WALL */}
      <group position={[-4.95 - assemblyState.leftWallOffset, 0, 0]}>
        <mesh position={[0, 2.8, 0]} receiveShadow>
          <boxGeometry args={[0.2, 5.6, 10.2]} />
          {wallMat}
        </mesh>

        {/* Diagonal Gaming Neon Accents on Left Wall */}
        <mesh position={[0.11, 2.4, 0]} rotation={[0, 0, Math.PI / 12]}>
          <boxGeometry args={[0.04, 0.06, 8.2]} />
          {neonMat("#c084fc", 2.6)}
        </mesh>
        <mesh position={[0.11, 3.6, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <boxGeometry args={[0.04, 0.06, 8.2]} />
          {neonMat("#06b6d4", 2.4)}
        </mesh>
      </group>

      {/* 4. RIGHT WALL */}
      <group position={[4.95 + assemblyState.rightWallOffset, 0, 0]}>
        <mesh position={[0, 2.8, 0]} receiveShadow>
          <boxGeometry args={[0.2, 5.6, 10.2]} />
          {wallMat}
        </mesh>

        {/* Gaming Wall Light Bars */}
        <mesh position={[-0.11, 2.4, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.2]} />
          {neonMat("#a855f7", 2.6)}
        </mesh>
        <mesh position={[-0.11, 3.6, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.2]} />
          {neonMat("#ec4899", 2.4)}
        </mesh>
      </group>

      {/* 5. CEILING & TRUSSES */}
      <group position={[0, 5.4 + assemblyState.ceilingOffset, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[10.2, 0.2, 10.2]} />
          {wallMat}
        </mesh>

        {/* Overhead Futuristic Studio Neon Trusses */}
        <group ref={ceilingLightRef}>
          {[-2.5, 0, 2.5].map((z, idx) => (
            <mesh key={`truss-${idx}`} position={[0, -0.15, z]}>
              <boxGeometry args={[9.2, 0.04, 0.08]} />
              {neonMat("#38bdf8", 2.2)}
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
