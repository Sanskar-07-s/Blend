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

import { MODEL_MANIFEST } from "./models";

export const TIER_CONFIG: Record<QualityTier, TierSettings> = {
  high: {
    tier: "high",
    dpr: 1.5,
    bloom: true,
    bloomHalfRes: true,
    particles: 500,
    reflectiveFloor: true,
    shadows: true,
    modelUrl: MODEL_MANIFEST.room,
    introDurationMultiplier: 1.0,
    backdropBlur: true,
    antialias: true,
  },
  medium: {
    tier: "medium",
    dpr: 1.0,
    bloom: false,
    bloomHalfRes: false,
    particles: 150,
    reflectiveFloor: false,
    shadows: false,
    modelUrl: MODEL_MANIFEST.room,
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
    modelUrl: MODEL_MANIFEST.roomMobile,
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
 * Accounts for GPU tier, renderer string, device memory, concurrency, screen size, touch, Save-Data, and motion preference.
 * Rules:
 *  - Discrete or Apple/modern desktop GPUs -> high
 *  - Integrated GPUs like Intel UHD / Iris on desktop/laptop -> medium
 *  - Phones and low-spec mobile devices -> low
 */
export async function detectDeviceTier(): Promise<QualityTier> {
  if (typeof window !== "undefined") {
    // 1. URL parameter override (?quality=low|medium|high)
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("quality")?.toLowerCase();
    if (qParam === "low" || qParam === "medium" || qParam === "high") {
      console.log(`[QualityTier] Override via URL parameter: ${qParam}`);
      return qParam as QualityTier;
    }

    // 2. User preference in localStorage
    const pref = getStoredPreference();
    if (pref !== "auto") {
      console.log(`[QualityTier] User preference from storage: ${pref}`);
      return pref as QualityTier;
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

  // Immediate low-tier rules (battery/data saver, low memory, phones)
  if (saveData || prefersReducedMotion || mem < 3 || cores <= 2 || (isTouch && isPhoneSize)) {
    console.log("[QualityTier] Mobile phone / low-resource device detected -> Tier: low");
    return "low";
  }

  // Check 1-day localStorage cache for detected GPU tier
  const CACHE_KEY = "bc_gpu_tier_cache";
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed === "object" && parsed !== null && parsed.tier) {
          if (Date.now() - (parsed.timestamp || 0) < ONE_DAY_MS) {
            console.log(`[QualityTier] Using cached GPU tier (${parsed.tier}) from localStorage`);
            return parsed.tier as QualityTier;
          }
        }
      }
    } catch {
      // storage unavailable or parse error, continue
    }
  }

  // Read unmasked renderer string
  let rendererString = "UNKNOWN";
  if (typeof document !== "undefined") {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        rendererString = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      }
    } catch (e) {
      // fallback
    }
  }

  const isMobileDevice = (isTouch && isPhoneSize) || /android|iphone|ipad|mobile/i.test(navigator.userAgent || "");
  const safeFallbackTier: QualityTier = isMobileDevice ? "low" : "medium";

  let finalTier: QualityTier = safeFallbackTier;
  let gpuName = rendererString;
  let gpuTierNum = 1;

  try {
    const gpuPromise = getGPUTier({
      benchmarksURL: "/gpu-benchmarks",
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("detect-gpu benchmark request timed out after 1.5s")), 1500);
    });

    const gpu = await Promise.race([gpuPromise, timeoutPromise]);
    gpuName = gpu.gpu || rendererString;
    gpuTierNum = gpu.tier;

    if (gpu.isMobile || (isTouch && isPhoneSize)) {
      finalTier = gpu.tier >= 3 ? "medium" : "low";
    } else {
      // Desktop / Laptop
      const isIntelIntegrated = /intel|uhd|iris|hd graphics/i.test(gpuName);
      const isDiscrete = /nvidia|geforce|rtx|gtx|amd|radeon|apple|m1|m2|m3|m4/i.test(gpuName);

      if (isIntelIntegrated) {
        finalTier = "medium";
      } else if (isDiscrete || gpu.tier >= 3) {
        finalTier = mem >= 6 && cores >= 6 ? "high" : "medium";
      } else {
        finalTier = "low";
      }
    }
  } catch (e) {
    console.warn("GPU tier detection failed or timed out (1.5s), using safe fallback tier:", safeFallbackTier, e);
    finalTier = safeFallbackTier;
  }

  // Cache result for 1 day
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          tier: finalTier,
          gpuName,
          gpuTierNum,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore storage failure
    }
  }

  console.log(`[QualityTier] GPU: "${gpuName}" | Tier number: ${gpuTierNum} | Final Tier: ${finalTier}`);
  return finalTier;
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

