import React from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface ImportedModelProps {
  glbPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  highlighted?: boolean;
  accentColor?: string;
  onClick?: () => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: () => void;
}

// Simple cache for loaded models
const modelCache = new Map<string, THREE.Group>();

export const ImportedModel: React.FC<ImportedModelProps> = ({
  glbPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  highlighted = false,
  accentColor = "#a855f7",
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const [model, setModel] = React.useState<THREE.Group | null>(() => {
    const cached = modelCache.get(glbPath);
    return cached ? cached.clone(true) : null;
  });

  React.useEffect(() => {
    let isMounted = true;

    if (modelCache.has(glbPath)) {
      const cached = modelCache.get(glbPath)!;
      setModel(cached.clone(true));
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        if (!isMounted) return;
        modelCache.set(glbPath, gltf.scene);
        setModel(gltf.scene.clone(true));
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF:", glbPath, error);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [glbPath]);

  // Apply material upgrades when model is ready or highlight changes
  React.useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              const matName = (stdMat.name || "").toLowerCase();

              if (
                matName.includes("neon") ||
                matName.includes("led") ||
                matName.includes("triangel") ||
                matName.includes("square") ||
                matName.includes("o") ||
                matName.includes("x") ||
                matName.includes("light")
              ) {
                stdMat.emissiveIntensity = 3.5;
                if (!stdMat.emissive || stdMat.emissive.getHex() === 0) {
                  stdMat.emissive = new THREE.Color("#c084fc");
                }
              }

              if (highlighted) {
                stdMat.emissive = new THREE.Color(accentColor);
                stdMat.emissiveIntensity = 1.4;
              }
            }
          });
        }
      }
    });
  }, [model, highlighted, accentColor]);

  if (!model) return null;

  return (
    <primitive
      object={model}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  );
};
