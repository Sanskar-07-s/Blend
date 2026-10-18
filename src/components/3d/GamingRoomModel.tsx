import React from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";

interface GamingRoomSceneProps {
  activeSectionId: string;
  onSelectSection?: (index: number) => void;
  onModelLoaded?: () => void;
}

export const GamingRoomModel: React.FC<GamingRoomSceneProps> = ({
  onModelLoaded,
}) => {
  const [sceneModel, setSceneModel] = React.useState<THREE.Group | null>(null);

  React.useEffect(() => {
    let active = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "/models/gaming_room_full.glb",
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

                  // Double-sided rendering to fix hollow single-sided geometry
                  m.side = THREE.DoubleSide;
                  m.needsUpdate = true;

                  const name = (m.name || "").toLowerCase();

                  // Neon signs and LED glows
                  if (
                    name.includes("triangel") ||
                    name.includes("square") ||
                    name.includes("o") ||
                    name.includes("x") ||
                    name.includes("neon") ||
                    name.includes("led") ||
                    name.includes("luz") ||
                    name.includes("emission")
                  ) {
                    m.emissiveIntensity = 4.5;
                    if (!m.emissive || m.emissive.getHex() === 0) {
                      m.emissive = new THREE.Color("#c084fc");
                    }
                  } else if (name.includes("screen") || name.includes("wallpaper")) {
                    m.roughness = 0.2;
                    m.metalness = 0.1;
                    m.emissiveIntensity = 1.3;
                  } else if (name.includes("black metal")) {
                    // Prevent black metal from disappearing into complete pitch darkness
                    m.roughness = 0.45;
                    m.metalness = 0.55;
                  }
                }
              });
            }
          }
        });

        setSceneModel(root);
        onModelLoaded?.();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          console.log(`[3D Studio] Loading Gaming Room: ${pct}%`);
        }
      },
      (error) => {
        console.error("Error loading gaming_room_full.glb:", error);
      }
    );

    return () => {
      active = false;
    };
  }, [onModelLoaded]);

  if (!sceneModel) return null;

  return (
    <primitive
      object={sceneModel}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
};
