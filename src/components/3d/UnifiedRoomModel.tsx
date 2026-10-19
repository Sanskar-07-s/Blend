import React, { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as THREE from "three";
import gsap from "gsap";
import { applyEmissiveLimits } from "../../config/emissiveLimits";
import {
  createAssemblyTimeline,
  snapToRestPose,
  GROUP_START_OFFSETS,
  type GroupRestTransform,
  type EmissiveStripsData,
} from "../../animations/introAnimation";
import type { NavState } from "../../hooks/useSceneNavigation";

interface UnifiedRoomModelProps {
  navState: NavState;
  overviewCamera: { position: [number, number, number]; target: [number, number, number] };
  highlightedObjectName?: string | null;
  onModelLoaded?: () => void;
  onPrewarmComplete?: () => void;
  onIntroComplete?: () => void;
  reducedMotion?: boolean;
  modelUrl?: string;
  introDurationMultiplier?: number;
}

const ASSEMBLY_GROUP_NAMES = [
  "group_floor",
  "group_backwall",
  "group_leftwall",
  "group_rightwall",
  "group_ceiling",
  "group_desk",
  "group_pc",
  "group_monitors",
  "group_chair",
  "group_shelf",
  "group_sign",
  "group_props",
];

export const UnifiedRoomModel: React.FC<UnifiedRoomModelProps> = ({
  navState,
  overviewCamera,
  highlightedObjectName,
  onModelLoaded,
  onPrewarmComplete,
  onIntroComplete,
  reducedMotion = false,
  modelUrl = "/models/room.glb",
  introDurationMultiplier = 1.0,
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { gl, scene, camera } = useThree();

  const prewarmedRef = useRef(false);
  const groupsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const restTransformsRef = useRef<Map<string, GroupRestTransform>>(new Map());
  const groupMaterialsRef = useRef<Map<string, THREE.MeshStandardMaterial[]>>(new Map());
  const stripMaterialsRef = useRef<EmissiveStripsData>({
    ceiling: [],
    walls: [],
    desk: [],
    sign: [],
    shelf: [],
  });
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // 1. Single model loading and pre-warm
  useEffect(() => {
    let active = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      modelUrl,
      (gltf) => {
        if (!active) return;
        const root = gltf.scene;

        const groups = new Map<string, THREE.Object3D>();
        const restTransforms = new Map<string, GroupRestTransform>();
        const groupMaterials = new Map<string, THREE.MeshStandardMaterial[]>();
        const stripMaterials: EmissiveStripsData = {
          ceiling: [],
          walls: [],
          desk: [],
          sign: [],
          shelf: [],
        };

        // Cache group parent nodes
        ASSEMBLY_GROUP_NAMES.forEach((name) => {
          const groupNode = root.getObjectByName(name);
          if (groupNode) {
            groups.set(name, groupNode);
            restTransforms.set(name, {
              position: groupNode.position.clone(),
              rotation: groupNode.rotation.clone(),
              scale: groupNode.scale.clone(),
            });
            groupMaterials.set(name, []);
          }
        });

        // Traverse meshes and collect materials
        let totalTriangles = 0;
        let meshCount = 0;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshCount++;
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const geom = mesh.geometry;
            if (geom) {
              if (geom.index) {
                totalTriangles += geom.index.count / 3;
              } else if (geom.attributes.position) {
                totalTriangles += geom.attributes.position.count / 3;
              }
            }

            // Find parent assembly group
            let parent: THREE.Object3D | null = mesh.parent;
            let groupName = "";
            while (parent && parent !== root) {
              if (parent.name && parent.name.startsWith("group_")) {
                groupName = parent.name;
                break;
              }
              parent = parent.parent;
            }

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  const m = mat as THREE.MeshStandardMaterial;
                  m.side = THREE.DoubleSide;

                  // Textures GPU init
                  if (m.map) gl.initTexture(m.map);
                  if (m.normalMap) gl.initTexture(m.normalMap);
                  if (m.roughnessMap) gl.initTexture(m.roughnessMap);
                  if (m.metalnessMap) gl.initTexture(m.metalnessMap);

                  const matName = (m.name || "").toLowerCase();

                  // PlayStation neon button colors
                  if (
                    matName.includes("triangel") ||
                    matName.includes("square") ||
                    matName.includes("o") ||
                    matName.includes("x")
                  ) {
                    if (!m.emissive || m.emissive.getHex() === 0) {
                      m.emissive = new THREE.Color("#c084fc");
                    }
                  }

                  // Classify emissive materials
                  if (m.emissive && m.emissive.getHex() !== 0) {
                    if (groupName && groupMaterials.has(groupName)) {
                      groupMaterials.get(groupName)!.push(m);
                    }

                    // Categorize for Phase 5 lights on
                    if (groupName === "group_ceiling") {
                      stripMaterials.ceiling?.push(m);
                    } else if (
                      groupName === "group_backwall" ||
                      groupName === "group_leftwall" ||
                      groupName === "group_rightwall"
                    ) {
                      stripMaterials.walls?.push(m);
                    } else if (groupName === "group_desk") {
                      stripMaterials.desk?.push(m);
                    } else if (groupName === "group_sign" || matName.includes("sign")) {
                      stripMaterials.sign?.push(m);
                    } else if (groupName === "group_shelf" || matName.includes("luz")) {
                      stripMaterials.shelf?.push(m);
                    }
                  }
                }
              });
            }
          }
        });

        // Apply calibrated emissive limits once after load
        applyEmissiveLimits(root);

        // Store references
        groupsRef.current = groups;
        restTransformsRef.current = restTransforms;
        groupMaterialsRef.current = groupMaterials;
        stripMaterialsRef.current = stripMaterials;

        if (typeof window !== "undefined" && (window as any).__bc) {
          (window as any).__bc.renderInfo = {
            calls: meshCount,
            triangles: Math.round(totalTriangles),
            textures: gl.info.memory.textures || 150,
          };
        }

        setModel(root);
        onModelLoaded?.();

        // Pre-warm behind loading screen
        if (!prewarmedRef.current && gl.compileAsync) {
          gl.compileAsync(root, camera)
            .then(() => {
              gl.render(scene, camera);
              prewarmedRef.current = true;

              // Hide room at scattered start poses until intro starts
              groups.forEach((grp, name) => {
                const rest = restTransforms.get(name);
                const startInfo = GROUP_START_OFFSETS[name] || { offset: [0, 15, 0], rot: [0, 0, 0] };
                if (rest) {
                  grp.position.set(
                    rest.position.x + startInfo.offset[0],
                    rest.position.y + startInfo.offset[1],
                    rest.position.z + startInfo.offset[2]
                  );
                  grp.rotation.set(
                    rest.rotation.x + startInfo.rot[0],
                    rest.rotation.y + startInfo.rot[1],
                    rest.rotation.z + startInfo.rot[2]
                  );
                  grp.scale.set(0.35, 0.35, 0.35);
                  grp.visible = false;
                }
              });

              onPrewarmComplete?.();
            })
            .catch(() => {
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
  }, [gl, scene, camera, modelUrl, onModelLoaded, onPrewarmComplete]);

  // 2. Assembly intro timeline trigger
  useEffect(() => {
    if (!model || groupsRef.current.size === 0) return;

    if (navState === "intro") {
      // Kill previous timeline if any
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
        masterTimelineRef.current = null;
      }

      // Find accent room light
      const accentLight = scene.getObjectByProperty("type", "PointLight") as THREE.PointLight | undefined;

      // Start master assembly timeline
      const tl = createAssemblyTimeline({
        groups: groupsRef.current,
        restTransforms: restTransformsRef.current,
        camera,
        overviewCam: overviewCamera,
        accentLightRef: accentLight,
        groupMaterials: groupMaterialsRef.current,
        stripMaterials: stripMaterialsRef.current,
        onComplete: () => {
          onIntroComplete?.();
        },
        reducedMotion,
        durationMultiplier: introDurationMultiplier,
      });

      masterTimelineRef.current = tl;
    } else if (navState === "overview" || navState === "section") {
      // If intro was playing and skipped, or already finished, guarantee all groups at rest
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
        masterTimelineRef.current = null;
      }

      const accentLight = scene.getObjectByProperty("type", "PointLight") as THREE.PointLight | undefined;
      snapToRestPose({
        groups: groupsRef.current,
        restTransforms: restTransformsRef.current,
        camera: navState === "overview" ? camera : undefined,
        overviewCam: navState === "overview" ? overviewCamera : undefined,
        accentLightRef: accentLight,
        stripMaterials: stripMaterialsRef.current,
      });
    }

    return () => {
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
  }, [navState, model, camera, overviewCamera, reducedMotion, onIntroComplete, scene]);

  // 3. Fast hover highlights via refs without cloning materials
  useEffect(() => {
    if (!model || navState === "intro") return;

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
  }, [model, highlightedObjectName, navState]);

  if (!model) return null;

  return <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
};
