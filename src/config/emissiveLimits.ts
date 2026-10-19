import * as THREE from "three";

export const EMISSIVE_LIMITS = {
  shelfAndBooks: 0.6,
  monitorScreen: 1.2,
  regularNeonStrips: 1.5,
  sign: 2.0,
  defaultMax: 1.5,
};

/**
 * Apply balanced emissive limits across all room materials once on scene load.
 * Traverses the scene once; do NOT run per frame.
 */
export function applyEmissiveLimits(root: THREE.Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;

      // Detect parent group
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

            let limit = EMISSIVE_LIMITS.defaultMax;

            // 1. Shelf and Books: max 0.6 (stops shelf from blowing out books & geometric shelf)
            if (
              groupName === "group_shelf" ||
              matName.includes("luz") ||
              matName.includes("shelf") ||
              matName.includes("book") ||
              matName.includes("nuvens") ||
              matName.includes("material.011") ||
              matName.includes("ikigai") ||
              matName.includes("sapiens") ||
              matName.includes("manson") ||
              matName.includes("hygge") ||
              matName.includes("game")
            ) {
              limit = EMISSIVE_LIMITS.shelfAndBooks;
            }
            // 2. Neon Sign: max 2.0
            else if (
              groupName === "group_sign" ||
              matName.includes("sign") ||
              matName.includes("gamer") ||
              matName.includes("svgmat")
            ) {
              limit = EMISSIVE_LIMITS.sign;
            }
            // 3. Monitor screen: max 1.2
            else if (
              groupName === "group_monitors" &&
              (matName.includes("screen") || matName.includes("monitor") || matName.includes("display"))
            ) {
              limit = EMISSIVE_LIMITS.monitorScreen;
            }
            // 4. Regular neon strips / buttons: max 1.5
            else if (
              matName.includes("neon") ||
              matName.includes("led") ||
              matName.includes("emission") ||
              matName.includes("triangel") ||
              matName.includes("square") ||
              matName.includes("o") ||
              matName.includes("x")
            ) {
              limit = EMISSIVE_LIMITS.regularNeonStrips;
            }

            // Apply clamp and balanced emission values
            if (m.emissive) {
              if (limit === EMISSIVE_LIMITS.shelfAndBooks) {
                // Shelf and books strictly capped at 0.6
                m.emissiveIntensity = Math.min(m.emissiveIntensity, EMISSIVE_LIMITS.shelfAndBooks);
              } else if (limit === EMISSIVE_LIMITS.sign) {
                m.emissiveIntensity = Math.min(m.emissiveIntensity || 2.0, EMISSIVE_LIMITS.sign);
              } else if (limit === EMISSIVE_LIMITS.monitorScreen) {
                m.emissiveIntensity = Math.min(m.emissiveIntensity || 1.2, EMISSIVE_LIMITS.monitorScreen);
              } else if (limit === EMISSIVE_LIMITS.regularNeonStrips) {
                m.emissiveIntensity = Math.min(m.emissiveIntensity || 1.5, EMISSIVE_LIMITS.regularNeonStrips);
              } else {
                if (m.emissiveIntensity > limit) {
                  m.emissiveIntensity = limit;
                }
              }
            }
          }
        });
      }
    }
  });
}
