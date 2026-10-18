import React, { useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";

interface UnifiedRoomModelProps {
  highlightedObjectName?: string | null;
  onModelLoaded?: () => void;
}

export const UnifiedRoomModel: React.FC<UnifiedRoomModelProps> = ({
  highlightedObjectName,
  onModelLoaded,
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const materialsRef = useRef<Map<string, THREE.MeshStandardMaterial[]>>(new Map());

  useEffect(() => {
    let active = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Load single unified room.glb once
    loader.load(
      "/models/room.glb",
      (gltf) => {
        if (!active) return;
        const root = gltf.scene;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  const m = mat as THREE.MeshStandardMaterial;

                  // Double-sided rendering so walls and geometry never render hollow
                  m.side = THREE.DoubleSide;
                  m.needsUpdate = true;

                  const matName = (m.name || "").toLowerCase();

                  // PlayStation neon buttons and LED light fixtures
                  if (
                    matName.includes("triangel") ||
                    matName.includes("square") ||
                    matName.includes("o") ||
                    matName.includes("x") ||
                    matName.includes("neon") ||
                    matName.includes("led") ||
                    matName.includes("luz") ||
                    matName.includes("emission")
                  ) {
                    m.emissiveIntensity = 4.5;
                    if (!m.emissive || m.emissive.getHex() === 0) {
                      m.emissive = new THREE.Color("#c084fc");
                    }
                  } else if (matName.includes("black metal")) {
                    m.roughness = 0.45;
                    m.metalness = 0.55;
                  }
                }
              });
            }
          }
        });

        setModel(root);
        onModelLoaded?.();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          console.log(`[3D Studio] Loading Unified Room: ${pct}%`);
        }
      },
      (error) => {
        console.error("Error loading room.glb:", error);
      }
    );

    return () => {
      active = false;
    };
  }, [onModelLoaded]);

  // Object Highlight & Dimming:
  // When an object is focused, highlight it; dim non-focused objects by 25%
  useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const parentName = mesh.parent?.name || "";
        const meshName = mesh.name || "";
        const isFocused =
          highlightedObjectName &&
          (meshName.toLowerCase().includes(highlightedObjectName.toLowerCase()) ||
            parentName.toLowerCase().includes(highlightedObjectName.toLowerCase()));

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const m = mat as THREE.MeshStandardMaterial;
              if (highlightedObjectName) {
                if (isFocused) {
                  // Focused anchor highlight
                  m.opacity = 1.0;
                  m.transparent = false;
                } else {
                  // Dim non-focused objects by 25% (opacity 0.75 or darker color multiplier)
                  m.opacity = 0.85;
                  m.transparent = true;
                }
              } else {
                m.opacity = 1.0;
                m.transparent = false;
              }
            }
          });
        }
      }
    });
  }, [model, highlightedObjectName]);

  if (!model) return null;

  // Render unified room cleanly at exact Blender world space [0, 0, 0]
  // NO per-object manual rescaling or repositioning!
  return <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
};
