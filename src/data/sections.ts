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
  isPlaceholder?: boolean;
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

// 8 Sections mapping directly to anchors.json objects in plain human tone
export const SECTIONS: SectionItem[] = [
  {
    id: "about",
    index: 0,
    title: "About the club",
    subtitle: "Overview",
    objectId: "monitor",
    objectName: "Samsung Odyssey G8 Monitor 34inch",
    tagline: "Student 3D studio and digital art collective.",
    description:
      "About the club. Add two or three sentences here about who you are, what you make, and why students join.",
    badge: "01 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "right",
    isPlaceholder: true,
    override: {
      azimuthDeg: 25,
      elevationDeg: 14,
      distanceMultiplier: 1.35,
    },
    cameraPosition: [6.14, 2.7, 2.5],
    cameraTarget: [6.14, 2.4, 0.32],
    cards: [
      { title: "Weekly meetings", desc: "Hands-on modeling sessions and collaborative project work.", tag: "Weekly" },
      { title: "Open studio", desc: "Shared lab hours with mentors available for feedback.", tag: "Lab" },
    ],
    ctaText: "Next",
  },
  {
    id: "projects",
    index: 1,
    title: "Featured projects",
    subtitle: "Showcase",
    objectId: "pc",
    objectName: "Gaming Computer Case",
    tagline: "Student films, environment scenes, and game assets.",
    description:
      "Projects and student showcase. Add two or three sentences here highlighting member films, models, and real-time scenes.",
    badge: "02 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "left",
    isPlaceholder: true,
    override: {
      azimuthDeg: -22,
      elevationDeg: 12,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [6.5, 2.4, 2.8],
    cameraTarget: [7.23, 2.04, 1.23],
    cards: [
      { title: "Short film collaboration", desc: "Annual student animation produced in Blender Cycles.", tag: "Film" },
      { title: "Modular prop pack", desc: "Curated 3D asset collection made available to members.", tag: "Assets" },
    ],
    ctaText: "Next",
  },
  {
    id: "events",
    index: 2,
    title: "Workshops and events",
    subtitle: "Calendar",
    objectId: "cloud_shelf",
    objectName: "Cloud shelf",
    tagline: "Regular modeling jams and skill-building sessions.",
    description:
      "Upcoming workshops and events. Add two or three sentences here about weekly sessions, render jams, and guest speakers.",
    badge: "03 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "left",
    isPlaceholder: true,
    override: {
      azimuthDeg: -30,
      elevationDeg: 10,
      distanceMultiplier: 1.2,
    },
    cameraPosition: [8.2, 4.2, 5.8],
    cameraTarget: [10.0, 4.71, 3.61],
    cards: [
      { title: "Weekend render jam", desc: "Theme-based 48-hour environment modeling challenge.", tag: "Sprint" },
      { title: "Lighting clinic", desc: "PBR materials, camera exposure, and scene composition.", tag: "Workshop" },
    ],
    ctaText: "Next",
  },
  {
    id: "learning",
    index: 3,
    title: "Learning resources",
    subtitle: "Tutorials",
    objectId: "display_shelf",
    objectName: "Geometric Display Shelf",
    tagline: "Guides and reference libraries for all skill levels.",
    description:
      "Learning materials and guides. Add two or three sentences here about skill roadmaps, asset kits, and beginner walkthroughs.",
    badge: "04 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "right",
    isPlaceholder: true,
    override: {
      azimuthDeg: 28,
      elevationDeg: 12,
      distanceMultiplier: 1.25,
    },
    cameraPosition: [2.5, 3.2, 6.2],
    cameraTarget: [0.48, 2.83, 4.64],
    cards: [
      { title: "Beginner pathway", desc: "Four-week introduction covering Blender basics and navigation.", tag: "Basics" },
      { title: "Procedural nodes", desc: "Introduction to geometry nodes and procedural textures.", tag: "Nodes" },
    ],
    ctaText: "Next",
  },
  {
    id: "gallery",
    index: 4,
    title: "Community gallery",
    subtitle: "Renders",
    objectId: "framed_art",
    objectName: "Framed gaming art",
    tagline: "Selected renders and concept work by club members.",
    description:
      "Member gallery. Add two or three sentences here presenting recent 3D artwork, character sculpts, and concept pieces.",
    badge: "05 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "right",
    isPlaceholder: true,
    override: {
      azimuthDeg: 24,
      elevationDeg: 8,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [2.8, 5.1, 8.8],
    cameraTarget: [0.01, 5.39, 7.95],
    cards: [
      { title: "Environment study", desc: "Architectural lighting and interior props exercise.", tag: "Featured" },
      { title: "Character sculpt", desc: "Hard-surface modeling and digital sculpting showcase.", tag: "Sculpt" },
    ],
    ctaText: "Next",
  },
  {
    id: "team",
    index: 5,
    title: "Leadership team",
    subtitle: "Mentors",
    objectId: "chair",
    objectName: "Gaming chair/chair",
    tagline: "Student officers organizing studio activities.",
    description:
      "Club officers and mentors. Add two or three sentences here introducing the students who organize sessions and help members.",
    badge: "06 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "right",
    isPlaceholder: true,
    override: {
      azimuthDeg: 25,
      elevationDeg: 16,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [6.8, 2.4, 5.0],
    cameraTarget: [5.3, 1.46, 3.05],
    cards: [
      { title: "Student coordinators", desc: "Peer mentors leading workshops and studio critiques.", tag: "Mentors" },
      { title: "Lab team", desc: "Students assisting with workstations, licenses, and render queues.", tag: "Lab" },
    ],
    ctaText: "Next",
  },
  {
    id: "community",
    index: 6,
    title: "Studio community",
    subtitle: "Collaboration",
    objectId: "concept_chair",
    objectName: "Next generation gaming chair concept",
    tagline: "A collaborative workspace for campus creators.",
    description:
      "Community pod. Add two or three sentences here about our Discord channels, collaborative projects, and shared render space.",
    badge: "07 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "left",
    isPlaceholder: true,
    override: {
      azimuthDeg: -25,
      elevationDeg: 14,
      distanceMultiplier: 1.25,
    },
    cameraPosition: [6.5, 2.8, 8.2],
    cameraTarget: [8.3, 1.86, 6.44],
    cards: [
      { title: "Online community", desc: "Active channels for project feedback and troubleshooting.", tag: "Discord" },
      { title: "Study sessions", desc: "Casual evening work hours in the media arts lab.", tag: "Studio" },
    ],
    ctaText: "Next",
  },
  {
    id: "join",
    index: 7,
    title: "Join the club",
    subtitle: "Get involved",
    objectId: "neon_sign",
    objectName: "Gamer neon  sign",
    tagline: "Open to all enrolled students with any experience level.",
    description:
      "Membership information. Add two or three sentences here explaining how students can sign up and attend their first meeting.",
    badge: "08 / 08",
    accentColor: "#F28C28",
    accentGlow: "rgba(242, 140, 40, 0.2)",
    preferredSide: "right",
    isPlaceholder: true,
    override: {
      azimuthDeg: 26,
      elevationDeg: 10,
      distanceMultiplier: 1.3,
    },
    cameraPosition: [3.2, 3.6, 2.4],
    cameraTarget: [1.88, 3.43, 0.16],
    cards: [
      { title: "Sign up online", desc: "Fill out the registration form to join the mailing list.", tag: "Join" },
      { title: "Attend a meeting", desc: "Stop by the lab during any open workshop session.", tag: "Welcome" },
    ],
    ctaText: "Next",
  },
];

// Compute camera framing dynamically given bounding box, vertical FOV, and viewport aspect ratio
export function computeFramingCamera(
  bbox: BoundingBox,
  fov: number = 48,
  override?: SectionOverride,
  aspect: number = 16 / 9
): { position: [number, number, number]; target: [number, number, number] } {
  const center = bbox.center;
  const size = bbox.size;

  const isPortrait = aspect < 1.0;
  // Cap horizontal aspect for ultra-wide screens (e.g. 21:9) so objects don't appear tiny
  const effectiveAspect = Math.min(aspect, 1.85);

  const vFovRad = (fov * Math.PI) / 180;
  // Horizontal FOV = 2 * atan(tan(vfov / 2) * aspect)
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * effectiveAspect);

  // Compute required distance for vertical fit
  const dimV = Math.max(size[1], size[2] * 0.65);
  const distV = dimV / (2 * Math.tan(vFovRad / 2));

  // Compute required distance for horizontal fit
  const dimH = Math.max(size[0], size[2] * 0.65);
  const distH = dimH / (2 * Math.tan(hFovRad / 2));

  // Take the larger distance so object fits both vertically and horizontally
  const baseDistance = Math.max(distV, distH) * 1.35;
  const dist = baseDistance * (override?.distanceMultiplier ?? 1.25);

  // Azimuth & Elevation angles
  const azimuthRad = ((override?.azimuthDeg ?? 25) * Math.PI) / 180;
  const elevationRad = ((override?.elevationDeg ?? 12) * Math.PI) / 180;

  // Camera direction from open side of room
  const dx = dist * Math.sin(azimuthRad) * Math.cos(elevationRad);
  const dy = dist * Math.sin(elevationRad);
  const dz = dist * Math.cos(azimuthRad) * Math.cos(elevationRad);

  const targetOffset = override?.targetOffset ?? [0, 0, 0];
  const target: [number, number, number] = [
    center[0] + targetOffset[0],
    center[1] + targetOffset[1],
    center[2] + targetOffset[2],
  ];

  if (isPortrait) {
    // Portrait: Shift target downward so the focused object sits in the upper 55% of the viewport
    target[1] -= dist * 0.22;
  } else {
    // Landscape/Desktop: Shift object left/right to leave room for the side content panel
    const side = override?.preferredSide ?? "right";
    const sideShift = dist * 0.16;
    if (side === "left") {
      target[0] -= sideShift;
    } else {
      target[0] += sideShift;
    }
  }

  const position: [number, number, number] = [
    target[0] + dx,
    target[1] + dy,
    target[2] + dz,
  ];

  return { position, target };
}

// Compute overview camera dynamically fitting whole room in both portrait and landscape
export function computeOverviewCamera(
  roomBounds: BoundingBox,
  fov: number = 48,
  aspect: number = 16 / 9
): { position: [number, number, number]; target: [number, number, number] } {
  const rb = roomBounds;
  const isPortrait = aspect < 1.0;
  const clampedAspect = Math.min(aspect, 1.85);

  const vFovRad = (fov * Math.PI) / 180;
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * clampedAspect);

  const distV = (rb.size[1] / (2 * Math.tan(vFovRad / 2))) * 1.1;
  const distH = (rb.size[0] / (2 * Math.tan(hFovRad / 2))) * 1.1;
  const dist = Math.max(distV, distH);

  const targetY = isPortrait ? rb.center[1] - 0.7 : rb.center[1] - 0.2;
  const camPos: [number, number, number] = [
    rb.center[0] + 0.5,
    rb.center[1] + dist * 0.35,
    rb.center[2] + dist * 0.95,
  ];
  const camTarget: [number, number, number] = [
    rb.center[0],
    targetY,
    rb.center[2],
  ];

  return { position: camPos, target: camTarget };
}

// Global default overview camera fallback
export const OVERVIEW_CAMERA = {
  position: [5.0, 5.8, 12.8] as [number, number, number],
  target: [5.0, 3.0, 4.5] as [number, number, number],
};

