import { getGPUTier } from "detect-gpu";

export type QualityTier = "low" | "medium" | "high";
export type QualityPreference = "auto" | "low" | "medium" | "high";

export interface TierSettings {
  tier: QualityTier;
  dpr: number;
  bloom: boolean;
  bloomHalfRes: boolean;
  particles: number;
  reflectiveFloor: boolean;
  shadows: boolean;
  modelUrl: string;
  introDurationMultiplier: number;
  backdropBlur: boolean;
  antialias: boolean;
}

export const TIER_CONFIG: Record<QualityTier, TierSettings> = {
  high: {
    tier: "high",
    dpr: 1.5,
    bloom: true,
    bloomHalfRes: false,
    particles: 500,
    reflectiveFloor: true,
    shadows: true,
    modelUrl: "/models/room.glb",
    introDurationMultiplier: 1.0,
    backdropBlur: true,
    antialias: true,
  },
  medium: {
    tier: "medium",
    dpr: 1.25,
    bloom: true,
    bloomHalfRes: true,
    particles: 250,
    reflectiveFloor: false,
    shadows: false,
    modelUrl: "/models/room.glb",
    introDurationMultiplier: 1.0,
    backdropBlur: true,
    antialias: false,
  },
  low: {
    tier: "low",
    dpr: 1.0,
    bloom: false,
    bloomHalfRes: false,
    particles: 100,
    reflectiveFloor: false,
    shadows: false,
    modelUrl: "/models/room.mobile.glb",
    introDurationMultiplier: 0.5, // 3-4 s intro
    backdropBlur: false,
    antialias: false,
  },
};

export function getStoredPreference(): QualityPreference {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem("bc_quality_preference")?.toLowerCase();
  if (stored === "low" || stored === "medium" || stored === "high" || stored === "auto") {
    return stored as QualityPreference;
  }
  return "auto";
}

export function setStoredPreference(pref: QualityPreference): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bc_quality_preference", pref);
}

/**
 * Detect hardware capability and return appropriate QualityTier.
 * Accounts for GPU tier, device memory, concurrency, screen size, touch, Save-Data, and motion preference.
 */
export async function detectDeviceTier(): Promise<QualityTier> {
  if (typeof window !== "undefined") {
    // 1. URL parameter override (?quality=low|medium|high)
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("quality")?.toLowerCase();
    if (qParam === "low" || qParam === "medium" || qParam === "high") {
      return qParam;
    }

    // 2. User preference in localStorage
    const pref = getStoredPreference();
    if (pref !== "auto") {
      return pref;
    }
  }

  // 3. Automated heuristic detection
  const nav = typeof navigator !== "undefined" ? navigator : ({} as any);
  const mem = (nav as any).deviceMemory || 4; // in GB
  const cores = nav.hardwareConcurrency || 4;
  const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || nav.maxTouchPoints > 0);
  const isPhoneSize = typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) < 640;
  const saveData = (nav as any).connection?.saveData === true;
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Immediate low-tier rules (battery/data saver, low memory, budget phones)
  if (saveData || prefersReducedMotion || mem < 3 || cores <= 2 || (isTouch && isPhoneSize && mem <= 4)) {
    return "low";
  }

  try {
    const gpu = await getGPUTier();
    if (gpu.tier === 0 || gpu.tier === 1 || (gpu.isMobile && gpu.tier < 3)) {
      return "low";
    }
    if (gpu.tier === 2) {
      if (isTouch || isPhoneSize || mem < 6 || cores < 6) {
        return "medium";
      }
      return "medium";
    }
    if (gpu.tier >= 3) {
      if (mem >= 6 && cores >= 6 && !isPhoneSize) {
        return "high";
      }
      return "medium";
    }
  } catch (e) {
    console.warn("GPU tier detection failed, using fallback metrics:", e);
  }

  if (mem >= 8 && cores >= 8 && !isTouch && !isPhoneSize) return "high";
  if (mem >= 4 && cores >= 4) return "medium";
  return "low";
}

/**
 * Dynamically injects model preload link tag into head for only the selected tier model.
 */
export function injectModelPreload(modelUrl: string): void {
  if (typeof document === "undefined") return;
  const existing = document.querySelector("link[data-model-preload]");
  if (existing) {
    existing.setAttribute("href", modelUrl);
    return;
  }
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "fetch";
  link.type = "model/gltf-binary";
  link.crossOrigin = "anonymous";
  link.href = modelUrl;
  link.setAttribute("data-model-preload", "true");
  document.head.appendChild(link);
}

/**
 * Checks whether WebGL or WebGL2 context can be created.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || (canvas as any).getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

