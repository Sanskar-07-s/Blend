export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
}

export interface SectionOverride {
  azimuthDeg?: number;
  elevationDeg?: number;
  distanceMultiplier?: number;
  targetOffset?: [number, number, number];
  preferredSide?: "left" | "right";
}

export interface SectionItem {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  objectId: string;
  objectName: string;
  tagline: string;
  description: string;
  badge: string;
  accentColor: string;
  accentGlow: string;
  preferredSide: "left" | "right";
  override?: SectionOverride;
  // Computed dynamically from anchors.json
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  bbox?: BoundingBox;
  stats?: { label: string; value: string }[];
  features?: string[];
  cards?: { title: string; desc: string; tag?: string }[];
  ctaText?: string;
}

// 8 Sections mapping directly to anchors.json objects
export const SECTIONS: SectionItem[] = [
  {
    id: "about",
    index: 0,
    title: "ABOUT THE CLUB",
    subtitle: "COLLEGIATE 3D COLLECTIVE",
    objectId: "monitor",
    objectName: "Samsung Odyssey G8 Monitor 34inch",
    tagline: "Where imagination turns into three-dimensional reality.",
    description:
      "We are a collegiate community of 3D artists, animators, and VFX creators. From geometry nodes to cinematic lighting, we build worlds using Blender.",
    badge: "01 / MATRIX",
    accentColor: "#8b5cf6",
    accentGlow: "rgba(139, 92, 246, 0.4)",
    preferredSide: "right",
    override: {
      azimuthDeg: 25,
      elevationDeg: 14,
      distanceMultiplier: 1.35,
    },
    cameraPosition: [6.14, 2.7, 2.5],
    cameraTarget: [6.14, 2.4, 0.32],
    cards: [
      { title: "Weekly Render Jams", desc: "Fast-paced modeling challenges with live feedback.", tag: "Weekly" },
      { title: "Geometry Nodes Lab", desc: "Procedural asset generation & simulation workshops.", tag: "VFX" },
    ],
    ctaText: "DISCOVER PROJECTS",
  },
  {
    id: "projects",
    index: 1,
    title: "SHOWCASE RIGS",
    subtitle: "CREATIVE & HARDWARE LAB",
    objectId: "pc",
    objectName: "Gaming Computer Case",
    tagline: "High-performance rendering workstations powering our short films.",
    description:
      "Our lab builds custom render nodes and real-time interactive experiences using Unreal Engine and Blender Cycles GPU acceleration.",
    badge: "02 / HARDWARE",
    accentColor: "#c084fc",
    accentGlow: "rgba(192, 132, 252, 0.4)",
    preferredSide: "left",
    override: {
      azimuthDeg: -22,
      elevationDeg: 12,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [6.5, 2.4, 2.8],
    cameraTarget: [7.23, 2.04, 1.23],
    cards: [
      { title: "Project CyberPulse", desc: "An open-source cyberpunk cinematic short in Blender 5.1.", tag: "Film" },
      { title: "Asset Vault", desc: "Over 500 CC0 modular props built by club alumni.", tag: "Assets" },
    ],
    ctaText: "VIEW EVENTS",
  },
  {
    id: "events",
    index: 2,
    title: "EVENTS & JAMS",
    subtitle: "LIVE SESSIONS & WORKSHOPS",
    objectId: "cloud_shelf",
    objectName: "Cloud shelf",
    tagline: "Regular hackathons, render sprints, and guest artist livestreams.",
    description:
      "Join our bi-weekly speed sculpts and weekend film challenges. Collaborate with peer creators across campus to build game-ready worlds.",
    badge: "03 / SCHEDULE",
    accentColor: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.4)",
    preferredSide: "left",
    override: {
      azimuthDeg: -30,
      elevationDeg: 10,
      distanceMultiplier: 1.2,
    },
    cameraPosition: [8.2, 4.2, 5.8],
    cameraTarget: [10.0, 4.71, 3.61],
    cards: [
      { title: "Blender 48h Sprint", desc: "Theme-based 48-hour environment modeling jam.", tag: "Hackathon" },
      { title: "Lighting Masterclass", desc: "ACES filmic color science & volumetrics deep dive.", tag: "Live" },
    ],
    ctaText: "EXPLORE CURRICULUM",
  },
  {
    id: "learning",
    index: 3,
    title: "LEARNING HUB",
    subtitle: "CURATED 3D RESOURCES",
    objectId: "display_shelf",
    objectName: "Geometric Display Shelf",
    tagline: "From beginner donut to advanced character rigging and simulations.",
    description:
      "Comprehensive roadmaps covering hard-surface modeling, sculpting, texture painting, topology optimization, and Python scripting.",
    badge: "04 / ACADEMY",
    accentColor: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.4)",
    preferredSide: "right",
    override: {
      azimuthDeg: 28,
      elevationDeg: 12,
      distanceMultiplier: 1.25,
    },
    cameraPosition: [2.5, 3.2, 6.2],
    cameraTarget: [0.48, 2.83, 4.64],
    cards: [
      { title: "Zero to Hero", desc: "4-week fast-track Blender interface & basics pathway.", tag: "Beginner" },
      { title: "Shading Mastery", desc: "PBR node networks & procedural texture construction.", tag: "Advanced" },
    ],
    ctaText: "VIEW ART GALLERY",
  },
  {
    id: "gallery",
    index: 4,
    title: "ART GALLERY",
    subtitle: "STUDENT HIGHLIGHTS",
    objectId: "framed_art",
    objectName: "Framed gaming art",
    tagline: "Exceptional concept art and renders produced by student members.",
    description:
      "Explore curated portfolio pieces showcased in student exhibitions, digital art festivals, and college design competitions.",
    badge: "05 / ARCHIVE",
    accentColor: "#ec4899",
    accentGlow: "rgba(236, 72, 153, 0.4)",
    preferredSide: "right",
    override: {
      azimuthDeg: 24,
      elevationDeg: 8,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [2.8, 5.1, 8.8],
    cameraTarget: [0.01, 5.39, 7.95],
    cards: [
      { title: "Neo-Kyoto Alley", desc: "Cyberpunk diorama rendered in EEVEE Next.", tag: "Featured" },
      { title: "Bionic Exosuit", desc: "Hard-surface subdivision mechanical modeling.", tag: "Sci-Fi" },
    ],
    ctaText: "MEET THE TEAM",
  },
  {
    id: "team",
    index: 5,
    title: "CREATOR SQUAD",
    subtitle: "STUDIO LEADERSHIP",
    objectId: "chair",
    objectName: "Gaming chair/chair",
    tagline: "Student mentors and project leads guiding our creative community.",
    description:
      "Our team coordinates workshops, manages render hardware, and organizes collaboration pipelines for interdisciplinary student films.",
    badge: "06 / SQUAD",
    accentColor: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.4)",
    preferredSide: "right",
    override: {
      azimuthDeg: 25,
      elevationDeg: 16,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [6.8, 2.4, 5.0],
    cameraTarget: [5.3, 1.46, 3.05],
    cards: [
      { title: "Lead Director", desc: "Alex Rivera — Environment & Level Design", tag: "Mentor" },
      { title: "Tech Art Lead", desc: "Maya Lin — Geometry Nodes & Rigging", tag: "Mentor" },
    ],
    ctaText: "COMMUNITY HUB",
  },
  {
    id: "community",
    index: 6,
    title: "COMMUNITY POD",
    subtitle: "COLLABORATION LOUNGE",
    objectId: "concept_chair",
    objectName: "Next generation gaming chair concept",
    tagline: "A lively digital and in-person space for creative discussions.",
    description:
      "Connect with 150+ members on Discord for daily critiques, asset drops, study streams, and game development game nights.",
    badge: "07 / NETWORK",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    preferredSide: "left",
    override: {
      azimuthDeg: -25,
      elevationDeg: 14,
      distanceMultiplier: 1.25,
    },
    cameraPosition: [6.5, 2.8, 8.2],
    cameraTarget: [8.3, 1.86, 6.44],
    cards: [
      { title: "Campus Discord", desc: "Active voice channels, stream parties, and tech help.", tag: "24/7" },
      { title: "Render Farm Co-op", desc: "Distributed background rendering for member short films.", tag: "Compute" },
    ],
    ctaText: "BECOME A MEMBER",
  },
  {
    id: "join",
    index: 7,
    title: "JOIN THE MATRIX",
    subtitle: "APPLY FOR MEMBERSHIP",
    objectId: "neon_sign",
    objectName: "Gamer neon  sign",
    tagline: "Free membership for all enrolled students. No prior experience needed.",
    description:
      "Get instant access to our asset repository, Discord channels, workshop schedules, and lab workstations.",
    badge: "08 / ENLIST",
    accentColor: "#10b981",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    preferredSide: "right",
    override: {
      azimuthDeg: 26,
      elevationDeg: 10,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [3.2, 3.6, 2.4],
    cameraTarget: [1.88, 3.43, 0.12],
    cards: [
      { title: "Instant Access", desc: "Immediate invitation to our Discord and resource cloud.", tag: "Free" },
      { title: "Portfolio Review", desc: "Personal 1-on-1 mentorship for college portfolios.", tag: "VIP" },
    ],
    ctaText: "BACK TO OVERVIEW",
  },
];

// Compute camera framing dynamically given bounding box and FOV
export function computeFramingCamera(
  bbox: BoundingBox,
  fov: number = 48,
  override?: SectionOverride
): { position: [number, number, number]; target: [number, number, number] } {
  const center = bbox.center;
  const size = bbox.size;

  // Max dimension of the bounding box
  const maxDim = Math.max(size[0], size[1], size[2]);
  const fovRad = (fov * Math.PI) / 180;
  
  // Base distance using FOV formula: bbox size / (2 * tan(fov/2)) * 1.4
  const baseDistance = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.4;
  const dist = baseDistance * (override?.distanceMultiplier ?? 1.25);

  // Azimuth & Elevation angles
  const azimuthRad = ((override?.azimuthDeg ?? 25) * Math.PI) / 180;
  const elevationRad = ((override?.elevationDeg ?? 12) * Math.PI) / 180;

  // Camera direction from open side of room (+Z in glTF coordinates is towards open front)
  const dx = dist * Math.sin(azimuthRad) * Math.cos(elevationRad);
  const dy = dist * Math.sin(elevationRad);
  const dz = dist * Math.cos(azimuthRad) * Math.cos(elevationRad);

  const targetOffset = override?.targetOffset ?? [0, 0, 0];
  const target: [number, number, number] = [
    center[0] + targetOffset[0],
    center[1] + targetOffset[1],
    center[2] + targetOffset[2],
  ];

  const position: [number, number, number] = [
    target[0] + dx,
    target[1] + dy,
    target[2] + dz,
  ];

  return { position, target };
}

// Global overview camera computed from room bounding box
export const OVERVIEW_CAMERA = {
  // Room center is [5.0, 3.5, 4.95], open front corner is at X ~ 5.0, Y ~ 5.8, Z ~ 12.8
  position: [5.0, 5.8, 12.8] as [number, number, number],
  target: [5.0, 3.0, 4.5] as [number, number, number],
};
