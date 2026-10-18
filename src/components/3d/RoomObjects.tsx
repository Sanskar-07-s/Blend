import React, { Suspense } from "react";
import * as THREE from "three";
import { ASSET_MANIFEST } from "../../config/assetManifest";
import { ImportedModel } from "./ImportedModel";

interface RoomObjectsProps {
  activeSectionId: string;
  onSelectSection?: (index: number) => void;
  assemblyProgress?: number;
}

export const RoomObjects: React.FC<RoomObjectsProps> = ({
  activeSectionId,
  onSelectSection,
  assemblyProgress = 1,
}) => {
  // Center offset for the Blender scene:
  // In GamingRoom.blend:
  // Room floor center is around X=5.0, Y=-4.94, Z=0.0
  // In Three.js: (X, Y, Z) = (blendX - 5.0, blendZ, -(blendY + 4.94))
  // Therefore offset: X = -5.0, Y = 0.0, Z = 4.94
  const sceneOffset: [number, number, number] = [-5.0, 0, 4.94];

  const dropY = (1 - assemblyProgress) * 3.5;

  return (
    <group name="GamingRoomInteractiveObjects" position={[0, dropY, 0]}>
      {/* 1. MONITOR (Samsung Odyssey 34" + Dell 24") -> Section 0: ABOUT */}
      <Suspense fallback={null}>
        <group
          position={sceneOffset}
          onClick={() => onSelectSection?.(0)}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <ImportedModel
            glbPath={ASSET_MANIFEST.monitor.glbPath}
            highlighted={activeSectionId === "about"}
            accentColor="#a855f7"
          />
        </group>
      </Suspense>

      {/* 2. WORKSTATION (Gaming Desk + Razer Kraken + Nitro Laptop + Keyboard + Mouse) -> Section 1: WHAT WE DO */}
      <Suspense fallback={null}>
        <group
          position={sceneOffset}
          onClick={() => onSelectSection?.(1)}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <ImportedModel
            glbPath={ASSET_MANIFEST.workstation.glbPath}
            highlighted={activeSectionId === "what-we-do"}
            accentColor="#c084fc"
          />
        </group>
      </Suspense>

      {/* 3. GAMING COMPUTER TOWER -> Section 2: PROJECTS */}
      <Suspense fallback={null}>
        <group
          position={sceneOffset}
          onClick={() => onSelectSection?.(2)}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <ImportedModel
            glbPath={ASSET_MANIFEST.pc.glbPath}
            highlighted={activeSectionId === "projects"}
            accentColor="#8b5cf6"
          />
        </group>
      </Suspense>

      {/* 4. GAMING CHAIRS (Concept Pod + Ergonomic Chair) -> Section 5: TEAM */}
      <Suspense fallback={null}>
        <group
          position={sceneOffset}
          onClick={() => onSelectSection?.(5)}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <ImportedModel
            glbPath={ASSET_MANIFEST.chair.glbPath}
            highlighted={activeSectionId === "team"}
            accentColor="#a855f7"
          />
        </group>
      </Suspense>

      {/* 5. SHELVES, GAMES, BOOKS & GAMER NEON SIGN -> Section 4: LEARNING */}
      <Suspense fallback={null}>
        <group
          position={sceneOffset}
          onClick={() => onSelectSection?.(4)}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <ImportedModel
            glbPath={ASSET_MANIFEST.shelf.glbPath}
            highlighted={activeSectionId === "learning"}
            accentColor="#06b6d4"
          />
        </group>
      </Suspense>

      {/* 6. HOLOGRAPHIC STAGE PROJECTOR -> Section 3: EVENTS */}
      <group
        position={[0, 0.05, 1.8]}
        onClick={() => onSelectSection?.(3)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.9, 1.0, 0.16, 32]} />
          <meshStandardMaterial color="#0f0920" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.78, 32]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={3.0} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.4, 0.7, 2.2, 24, 1, true]} />
          <meshBasicMaterial
            color="#ec4899"
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 7. BROADCAST & TROPHY STATION -> Section 6: COMMUNITY */}
      <group
        position={[3.8, 0.7, 0.5]}
        onClick={() => onSelectSection?.(6)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <mesh position={[0, 0.22, 0]}>
          <torusKnotGeometry args={[0.16, 0.045, 64, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 8. CYBER ACCESS TERMINAL -> Section 7: JOIN */}
      <group
        position={[0, 0, 3.6]}
        rotation={[0, Math.PI, 0]}
        onClick={() => onSelectSection?.(7)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.65, 1.4, 0.35]} />
          <meshStandardMaterial color="#0d091e" roughness={0.3} metalness={0.85} />
        </mesh>
        <group position={[0, 1.3, 0.14]} rotation={[-0.45, 0, 0]}>
          <mesh>
            <planeGeometry args={[0.54, 0.34]} />
            <meshStandardMaterial color="#041f17" emissive="#10b981" emissiveIntensity={2.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
