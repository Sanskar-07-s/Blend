export interface PaletteTheme {
  name: "studio" | "violet";
  background: string; // #0F1115
  backgroundCenter: string; // #171A20
  wallMain: string; // #2B3038 graphite blue-gray
  wallFeature: string; // #343A44 back/feature wall
  wallTrim: string; // #1B1E24
  floor: string; // #3A2C22 warm dark oak
  floorRoughness: number; // 0.55
  deskMat: string; // #1D2026
  furnitureMinBase: string; // #1A1D22 (lift near-black colors)
  accent: string; // #F28C28 (Blender orange) or #8B7CF6
  accentSoft: string; // #FFB765 or #A78BFA
  lightCoolRim: string; // #9CC3FF
  lightHemisphereSky: string; // #CFD8E6
  lightHemisphereGround: string; // #3A2C22
  lightCeilingKey: string; // #FFF1E0
  lightDeskLamp: string; // #FFC98A (3000K warm)
  text: string; // #F2EFEA
  textMuted: string; // #A9A59E
  panel: string; // #171A1F
  panelOpacity: number; // 0.94
  hairline: string; // rgba(255, 255, 255, 0.10)
  fogNear: number;
  fogFar: number;
  fogEnabled: boolean;
}

export const PALETTES: Record<"studio" | "violet", PaletteTheme> = {
  studio: {
    name: "studio",
    background: "#0F1115",
    backgroundCenter: "#171A20",
    wallMain: "#2B3038",
    wallFeature: "#343A44",
    wallTrim: "#1B1E24",
    floor: "#3A2C22",
    floorRoughness: 0.55,
    deskMat: "#1D2026",
    furnitureMinBase: "#1A1D22",
    accent: "#F28C28", // Blender orange
    accentSoft: "#FFB765",
    lightCoolRim: "#9CC3FF",
    lightHemisphereSky: "#CFD8E6",
    lightHemisphereGround: "#3A2C22",
    lightCeilingKey: "#FFF1E0",
    lightDeskLamp: "#FFC98A",
    text: "#F2EFEA",
    textMuted: "#A9A59E",
    panel: "#171A1F",
    panelOpacity: 0.94,
    hairline: "rgba(255, 255, 255, 0.10)",
    fogNear: 30,
    fogFar: 80,
    fogEnabled: false,
  },
  violet: {
    name: "violet",
    background: "#0F1115",
    backgroundCenter: "#171A20",
    wallMain: "#2B3038",
    wallFeature: "#343A44",
    wallTrim: "#1B1E24",
    floor: "#3A2C22",
    floorRoughness: 0.55,
    deskMat: "#1D2026",
    furnitureMinBase: "#1A1D22",
    accent: "#8B7CF6", // muted violet
    accentSoft: "#A78BFA",
    lightCoolRim: "#9CC3FF",
    lightHemisphereSky: "#CFD8E6",
    lightHemisphereGround: "#3A2C22",
    lightCeilingKey: "#FFF1E0",
    lightDeskLamp: "#FFC98A",
    text: "#F2EFEA",
    textMuted: "#A9A59E",
    panel: "#171A1F",
    panelOpacity: 0.94,
    hairline: "rgba(255, 255, 255, 0.10)",
    fogNear: 30,
    fogFar: 80,
    fogEnabled: false,
  },
};

export function getActivePalette(): PaletteTheme {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("palette")?.toLowerCase();
    if (p === "violet" || p === "studio") {
      return PALETTES[p];
    }
  }

  const envPalette = import.meta.env.VITE_PALETTE?.toLowerCase();
  if (envPalette === "violet" || envPalette === "studio") {
    return PALETTES[envPalette];
  }

  return PALETTES.studio;
}

export function applyPaletteToCss(palette: PaletteTheme = getActivePalette()): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--bg-primary", palette.background);
  root.style.setProperty("--bg-center", palette.backgroundCenter);
  root.style.setProperty("--primary", palette.accent);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-soft", palette.accentSoft);
  root.style.setProperty("--text-main", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--panel-bg", `rgba(23, 26, 31, ${palette.panelOpacity})`);
  root.style.setProperty("--panel-border", palette.hairline);

  // Update theme-color meta tag
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", palette.background);
  }
}
