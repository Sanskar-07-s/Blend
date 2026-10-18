import React from "react";
import * as THREE from "three";
import type { AnchorsData } from "../../hooks/useSceneNavigation";
import { Html } from "@react-three/drei";

interface DebugAnchorOverlayProps {
  anchors: AnchorsData | null;
  activeSectionId?: string;
}

export const DebugAnchorOverlay: React.FC<DebugAnchorOverlayProps> = ({
  anchors,
  activeSectionId,
}) => {
  if (!anchors) return null;

  return (
    <group name="DebugAnchorOverlay" renderOrder={999}>
      {/* 1. Room Outer Bounding Box */}
      {anchors.roomBounds && (
        <group>
          <mesh position={anchors.roomBounds.center}>
            <boxGeometry args={anchors.roomBounds.size} />
            <meshBasicMaterial
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.3}
              depthTest={false}
            />
          </mesh>
          <Html position={[anchors.roomBounds.center[0], anchors.roomBounds.max[1] + 0.3, anchors.roomBounds.center[2]]}>
            <div
              style={{
                background: "rgba(56, 189, 248, 0.8)",
                color: "#05030a",
                padding: "2px 8px",
                borderRadius: "3px",
                fontSize: "11px",
                fontWeight: 800,
                whiteSpace: "nowrap",
                fontFamily: "Space Grotesk, monospace",
              }}
            >
              ROOM BOUNDS [10.0 x 7.0 x 9.9]
            </div>
          </Html>
        </group>
      )}

      {/* 2. Section Object Bounding Boxes & Labels */}
      {Object.entries(anchors.sections).map(([secId, sec]) => {
        if (!sec.exists || !sec.bbox) return null;
        const isActive = secId === activeSectionId;
        const boxColor = isActive ? "#c084fc" : "#10b981";

        return (
          <group key={secId}>
            {/* Wireframe Bounding Box */}
            <mesh position={sec.bbox.center}>
              <boxGeometry args={sec.bbox.size} />
              <meshBasicMaterial
                color={boxColor}
                wireframe
                transparent
                opacity={isActive ? 0.9 : 0.4}
                depthTest={false}
              />
            </mesh>

            {/* Center Anchor Point Indicator */}
            <mesh position={sec.bbox.center}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color={boxColor} depthTest={false} />
            </mesh>

            {/* 3D Space Anchor Label */}
            <Html position={[sec.bbox.center[0], sec.bbox.max[1] + 0.15, sec.bbox.center[2]]}>
              <div
                style={{
                  background: isActive ? "rgba(192, 132, 252, 0.9)" : "rgba(10, 6, 22, 0.85)",
                  color: isActive ? "#05030a" : "#f8fafc",
                  border: `1px solid ${boxColor}`,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontFamily: "Space Grotesk, monospace",
                  boxShadow: isActive ? "0 0 10px rgba(192, 132, 252, 0.6)" : "none",
                  transform: "translate3d(-50%, -100%, 0)",
                  pointerEvents: "none",
                }}
              >
                <div>[{secId.toUpperCase()}] {sec.blenderObjectName}</div>
                <div style={{ fontSize: "9px", opacity: 0.85 }}>
                  XYZ: {sec.bbox.center.map((n) => n.toFixed(2)).join(", ")} | {sec.insideRoom ? "✓ INSIDE" : "✗ OUTSIDE"}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
