import * as THREE from "three";
import { getActivePalette } from "./palette";

export const EMISSIVE_LIMITS = {
  shelf: 0.2,          // Very faint warm strip under the shelf
  deskLed: 0.5,        // Subtle LED strip behind desk/monitor
  monitorScreen: 1.0,  // Monitor and laptop screens capped at 1.0
  pcGlow: 0.4,         // PC fans and case glow
  sign: 1.6,           // Gamer neon sign (the hero)
  defaultMax: 0.5,
};

/**
 * Apply balanced emissive limits and palette materials across all room meshes.
 * Runs once on scene load.
 */
export function applyEmissiveLimits(root: THREE.Object3D) {
  const palette = getActivePalette();
  const accentColor = new THREE.Color(palette.accent);
  const accentSoftColor = new THREE.Color(palette.accentSoft);
  const warmLightColor = new THREE.Color(palette.lightDeskLamp);

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;

      // Detect parent assembly group
      let parent: THREE.Object3D | null = mesh.parent;
      let groupName = "";
      while (parent && parent !== root) {
        if (parent.name && parent.name.startsWith("group_")) {
          groupName = parent.name.toLowerCase();
          break;
        }
        parent = parent.parent;
      }

      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const m = mat as THREE.MeshStandardMaterial;
            const matName = (m.name || "").toLowerCase();
            const meshName = (mesh.name || "").toLowerCase();

            // 1. Color assignment for room architecture and furniture
            if (groupName === "group_floor" || matName.includes("floor") || meshName.includes("floor")) {
              m.color.set(palette.floor);
              m.roughness = palette.floorRoughness;
            } else if (
              meshName.includes("baseboard") ||
              matName.includes("baseboard") ||
              matName.includes("trim") ||
              groupName === "group_ceiling" ||
              matName.includes("ceiling") ||
              meshName.includes("roof")
            ) {
              m.color.set(palette.wallTrim);
              m.roughness = 0.85;
            } else if (
              meshName.includes("backwall") ||
              matName.includes("wall_feature")
            ) {
              m.color.set(palette.wallFeature);
              m.roughness = 0.85;
            } else if (
              groupName.includes("wall") ||
              meshName.includes("wall") ||
              matName.includes("wall")
            ) {
              m.color.set(palette.wallMain);
              m.roughness = 0.85;
            } else if (
              matName.includes("deskmat") ||
              meshName.includes("mousepad")
            ) {
              m.color.set(palette.deskMat);
              m.roughness = 0.70;
            } else if (
              matName.includes("plastic") ||
              matName.includes("metal") ||
              matName.includes("material") ||
              matName.includes("wood") ||
              groupName === "group_desk" ||
              groupName === "group_chair"
            ) {
              // Lift near-black furniture colors so edges are clearly visible
              if (!matName.includes("screen") && !matName.includes("sign")) {
                const lum = m.color.r * 0.2126 + m.color.g * 0.7152 + m.color.b * 0.0722;
                if (lum < 0.04) {
                  m.color.set(palette.furnitureMinBase);
                }
                m.roughness = Math.max(m.roughness, 0.45);
              }
            }

            // 2. Neon & Emissive Minimalization
            // Zero out saturated legacy cyan/magenta outlines
            if (
              matName.includes("outline") ||
              matName.includes("pillar") ||
              matName.includes("strip") && !matName.includes("rgb_ring")
            ) {
              m.emissive.set(0x000000);
              m.emissiveIntensity = 0;
            }

            // Shelf glow: very faint warm strip under shelf at 0.2
            if (
              groupName === "group_shelf" ||
              matName.includes("luz") ||
              matName.includes("material.011")
            ) {
              if (m.emissive && m.emissive.getHex() !== 0) {
                m.emissive.copy(warmLightColor);
                m.emissiveIntensity = Math.min(m.emissiveIntensity, EMISSIVE_LIMITS.shelf);
              }
            }
            // Desk / monitor rear LED: soft accent at 0.5
            else if (
              matName.includes("rgb_ring") ||
              meshName.includes("rgb_ring") ||
              (groupName === "group_desk" && matName.includes("led"))
            ) {
              m.emissive.copy(accentSoftColor);
              m.emissiveIntensity = Math.min(m.emissiveIntensity || 0.5, EMISSIVE_LIMITS.deskLed);
            }
            // Screens: wallpaper retinted to accent, capped at 1.0
            else if (
              matName.includes("wallpaper") ||
              matName.includes("screen") ||
              matName.includes("display")
            ) {
              if (m.emissive && m.emissive.getHex() !== 0) {
                m.emissiveIntensity = Math.min(m.emissiveIntensity || 1.0, EMISSIVE_LIMITS.monitorScreen);
              }
            }
            // Gamer neon sign: the hero, Blender orange accent, capped at 1.6
            else if (
              groupName === "group_sign" ||
              matName.includes("sign") ||
              matName.includes("gamer") ||
              matName === "o" ||
              matName === "square" ||
              matName === "triangel" ||
              matName === "x"
            ) {
              m.color.copy(accentColor);
              m.emissive.copy(accentColor);
              m.emissiveIntensity = Math.min(m.emissiveIntensity || 1.6, EMISSIVE_LIMITS.sign);
            }
            // PC fans & Laptop glow: low
            else if (
              matName.includes("emissions.blue") ||
              matName.includes("fan") ||
              matName.includes("led")
            ) {
              if (m.emissive && m.emissive.getHex() !== 0) {
                m.emissive.copy(accentSoftColor);
                m.emissiveIntensity = Math.min(m.emissiveIntensity, EMISSIVE_LIMITS.pcGlow);
              }
            }
            // Clamp any other emissive material to default max
            else if (m.emissive && m.emissive.getHex() !== 0) {
              m.emissiveIntensity = Math.min(m.emissiveIntensity, EMISSIVE_LIMITS.defaultMax);
            }
          }
        });
      }
    }
  });
}
