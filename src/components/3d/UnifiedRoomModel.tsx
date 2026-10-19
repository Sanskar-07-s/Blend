import React, { useEffect, useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
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
import { MODEL_MANIFEST } from "../../config/models";

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
  onDegradeTier?: () => void;
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
  modelUrl = MODEL_MANIFEST.room,
  introDurationMultiplier = 1.0,
  onDegradeTier,
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { gl, scene, camera, invalidate } = useThree();

  const prewarmedRef = useRef(false);
  const groupsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const groupSpheresRef = useRef<Map<string, THREE.Sphere>>(new Map());
  const restTransformsRef = useRef<Map<string, GroupRestTransform>>(new Map());
  const hasCapturedRestRef = useRef(false);
  const hasIntroPlayedRef = useRef(false);
  const introCompletedRef = useRef(false);
  const groupMaterialsRef = useRef<Map<string, THREE.MeshStandardMaterial[]>>(new Map());
  const stripMaterialsRef = useRef<EmissiveStripsData>({
    ceiling: [],
    walls: [],
    desk: [],
    screens: [],
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
        const groupSpheres = new Map<string, THREE.Sphere>();
        const restTransforms = new Map<string, GroupRestTransform>();
        const groupMaterials = new Map<string, THREE.MeshStandardMaterial[]>();
        const stripMaterials: EmissiveStripsData = {
          ceiling: [],
          walls: [],
          desk: [],
          screens: [],
          sign: [],
          shelf: [],
        };

        // Cache group parent nodes and capture rest poses ONCE after load, before scattered pose is applied
        if (!hasCapturedRestRef.current) {
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

              const box = new THREE.Box3().setFromObject(groupNode);
              const sphere = new THREE.Sphere();
              box.getBoundingSphere(sphere);
              sphere.radius = Math.max(sphere.radius * 1.35, 2.5);
              groupSpheres.set(name, sphere);
            }
          });
          restTransformsRef.current = restTransforms;
          groupSpheresRef.current = groupSpheres;
          hasCapturedRestRef.current = true;
        } else {
          ASSEMBLY_GROUP_NAMES.forEach((name) => {
            const groupNode = root.getObjectByName(name);
            if (groupNode) {
              groups.set(name, groupNode);
              groupMaterials.set(name, []);
            }
          });
        }

        // Traverse meshes and collect materials
        let totalTriangles = 0;
        let meshCount = 0;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshCount++;
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = true;

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

            // Only key structural objects cast shadows to eliminate 600+ duplicate shadow pass calls
            const isShadowCaster =
              groupName === "group_desk" ||
              groupName === "group_chair" ||
              groupName === "group_pc";
            mesh.castShadow = isShadowCaster;
            mesh.receiveShadow = true;

            const geom = mesh.geometry;
            if (geom) {
              if (geom.index) {
                totalTriangles += geom.index.count / 3;
              } else if (geom.attributes.position) {
                totalTriangles += geom.attributes.position.count / 3;
              }
            }

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  const m = mat as THREE.MeshStandardMaterial;
                  
                  // CRITICAL: Disable material.transmission so Three.js does NOT render a duplicate
                  // full-scene transmission FBO pass every frame! Use alpha transparency instead.
                  if ((m as any).transmission && (m as any).transmission > 0) {
                    (m as any).transmission = 0;
                    m.transparent = true;
                    m.opacity = 0.3;
                    m.roughness = 0.05;
                  }

                  m.side = THREE.DoubleSide;

                  // Textures GPU init
                  if (m.map) gl.initTexture(m.map);
                  if (m.normalMap) gl.initTexture(m.normalMap);
                  if (m.roughnessMap) gl.initTexture(m.roughnessMap);
                  if (m.metalnessMap) gl.initTexture(m.metalnessMap);

                  const matName = (m.name || "").toLowerCase();



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
                    } else if (groupName === "group_desk" || matName.includes("rgb_ring")) {
                      stripMaterials.desk?.push(m);
                    } else if (
                      groupName === "group_monitors" ||
                      matName.includes("screen") ||
                      matName.includes("wallpaper")
                    ) {
                      stripMaterials.screens?.push(m);
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

        // Calculate unique textures and GPU texture memory
        const uniqueTextures = new Set<THREE.Texture>();
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = (child as THREE.Mesh).material;
            const mats = Array.isArray(m) ? m : [m];
            mats.forEach((mat) => {
              if (mat) {
                ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"].forEach((key) => {
                  const tex = (mat as any)[key];
                  if (tex && tex.isTexture) uniqueTextures.add(tex);
                });
              }
            });
          }
        });
        let gpuTextureMemoryBytes = 0;
        uniqueTextures.forEach((tex) => {
          if (tex.image && tex.image.width && tex.image.height) {
            gpuTextureMemoryBytes += tex.image.width * tex.image.height * 4 * 1.33;
          }
        });
        const gpuMemoryMb = Math.round((gpuTextureMemoryBytes / (1024 * 1024)) * 10) / 10;

        groupsRef.current = groups;
        groupMaterialsRef.current = groupMaterials;
        stripMaterialsRef.current = stripMaterials;

        if (typeof window !== "undefined" && (window as any).__bc) {
          (window as any).__bc.renderInfo = {
            calls: meshCount,
            triangles: Math.round(totalTriangles),
            textures: uniqueTextures.size || gl.info.memory.textures,
            gpuMemoryMb: gpuMemoryMb,
          };
          (window as any).__bc.modelLoaded = true;
        }

        setModel(root);
        onModelLoaded?.();

        // Pre-warm behind loading screen & 1-second benchmark (20 frames)
        if (!prewarmedRef.current && gl.compileAsync) {
          gl.compileAsync(root, camera)
            .then(() => {
              // 20-frame pre-intro benchmark
              const benchStart = performance.now();
              for (let i = 0; i < 20; i++) {
                gl.render(scene, camera);
              }
              const benchDuration = performance.now() - benchStart;
              const avgFrameMs = benchDuration / 20;
              console.log(
                `[PreIntroBenchmark] 20 frames took ${benchDuration.toFixed(1)}ms (avg ${avgFrameMs.toFixed(1)}ms/frame)`
              );
              if (avgFrameMs > 40) {
                console.warn(
                  `[PreIntroBenchmark] Frame time > 40ms (${avgFrameMs.toFixed(1)}ms). Triggering automatic tier drop.`
                );
                onDegradeTier?.();
              }

              prewarmedRef.current = true;

              if (
                introCompletedRef.current ||
                navState === "overview" ||
                navState === "section" ||
                (typeof window !== "undefined" && ((window as any).__bc?.state === "overview" || (window as any).__bc?.state === "section"))
              ) {
                snapToRestPose({
                  groups,
                  restTransforms,
                  stripMaterials: stripMaterialsRef.current,
                });
              } else {
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
              }

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

  // Expose snapshot helper on window.__bc for zero-delta Playwright assertions
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__bc = (window as any).__bc || {};
      (window as any).__bc.getSceneSnapshot = () => ({
        camera: {
          x: Number(camera.position.x.toFixed(4)),
          y: Number(camera.position.y.toFixed(4)),
          z: Number(camera.position.z.toFixed(4)),
        },
        groups: Array.from(groupsRef.current.entries()).map(([name, grp]) => ({
          name,
          x: Number(grp.position.x.toFixed(4)),
          y: Number(grp.position.y.toFixed(4)),
          z: Number(grp.position.z.toFixed(4)),
          rx: Number(grp.rotation.x.toFixed(4)),
          ry: Number(grp.rotation.y.toFixed(4)),
          rz: Number(grp.rotation.z.toFixed(4)),
        })),
      });
    }
  }, [camera]);

  // 2. Assembly intro timeline trigger: runs exactly ONCE
  useEffect(() => {
    if (!model || groupsRef.current.size === 0) return;

    if (navState === "intro") {
      // Never restart intro on resize or quality tier updates
      if (hasIntroPlayedRef.current) return;
      hasIntroPlayedRef.current = true;

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
          introCompletedRef.current = true;
          onIntroComplete?.();
          invalidate();
        },
        reducedMotion,
        durationMultiplier: introDurationMultiplier,
      });

      masterTimelineRef.current = tl;
    } else if (navState === "overview" || navState === "section") {
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
        masterTimelineRef.current = null;
      }
      introCompletedRef.current = true;
      hasIntroPlayedRef.current = true;

      const accentLight = scene.getObjectByProperty("type", "PointLight") as THREE.PointLight | undefined;
      snapToRestPose({
        groups: groupsRef.current,
        restTransforms: restTransformsRef.current,
        camera: undefined, // Never touch camera here; CameraController is responsible for camera
        overviewCam: undefined,
        accentLightRef: accentLight,
        stripMaterials: stripMaterialsRef.current,
      });
      invalidate();
    }

    return () => {
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
  }, [navState, model, camera, overviewCamera, reducedMotion, onIntroComplete, scene]);

  // 4. Per-group visibility culling: groups outside frustum during section camera framing are hidden
  const _projScreenMatrix = useRef(new THREE.Matrix4()).current;
  const _frustum = useRef(new THREE.Frustum()).current;

  useFrame(() => {
    groupsRef.current.forEach((grp) => {
      if (!grp.visible) grp.visible = true;
    });
  });

  if (!model) return null;

  return <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
};
