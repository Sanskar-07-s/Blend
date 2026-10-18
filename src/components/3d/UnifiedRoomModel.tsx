import React, { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";

interface UnifiedRoomModelProps {
  highlightedObjectName?: string | null;
  onModelLoaded?: () => void;
  onPrewarmComplete?: () => void;
}

export const UnifiedRoomModel: React.FC<UnifiedRoomModelProps> = ({
  highlightedObjectName,
  onModelLoaded,
  onPrewarmComplete,
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { gl, scene, camera } = useThree();
  const prewarmedRef = useRef(false);

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

                  // Pre-upload texture to GPU if texture exists
                  if (m.map) gl.initTexture(m.map);
                  if (m.normalMap) gl.initTexture(m.normalMap);
                  if (m.roughnessMap) gl.initTexture(m.roughnessMap);
                  if (m.metalnessMap) gl.initTexture(m.metalnessMap);
                }
              });
            }
          }
        });

        let totalTriangles = 0;
        let meshCount = 0;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshCount++;
            const geom = (child as THREE.Mesh).geometry;
            if (geom) {
              if (geom.index) {
                totalTriangles += geom.index.count / 3;
              } else if (geom.attributes.position) {
                totalTriangles += geom.attributes.position.count / 3;
              }
            }
          }
        });

        if (typeof window !== "undefined" && (window as any).__bc) {
          (window as any).__bc.renderInfo = {
            calls: meshCount,
            triangles: Math.round(totalTriangles),
            textures: gl.info.memory.textures || 150,
          };
        }

        setModel(root);
        onModelLoaded?.();

        // Step 1: Pre-warm shaders and render frames behind loading screen
        if (!prewarmedRef.current && gl.compileAsync) {
          gl.compileAsync(root, camera).then(() => {
            // Render 1-2 frames with all materials visible
            gl.render(scene, camera);
            prewarmedRef.current = true;
            onPrewarmComplete?.();
          }).catch(() => {
            onPrewarmComplete?.();
          });
        } else {
          onPrewarmComplete?.();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading room.glb:", error);
      }
    );

    return () => {
      active = false;
    };
  }, [gl, scene, camera, onModelLoaded, onPrewarmComplete]);

  // Fast hover highlights via refs without cloning materials
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
                  m.opacity = 1.0;
                  m.transparent = false;
                } else {
                  // Dim non-focused objects by 25%
                  m.opacity = 0.75;
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

  return <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
};
