export interface SectionItem {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  objectId: string;
  objectName: string;
  tagline: string;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  accentColor: string;
  accentGlow: string;
  badge: string;
  stats?: { label: string; value: string }[];
  features?: string[];
  interactiveCards?: {
    title: string;
    subtitle?: string;
    description: string;
    tag?: string;
    linkText?: string;
  }[];
  ctaText?: string;
}

// In Blender coordinates (Z is Up, -Y is forward):
// When exported to glTF (Three.js coordinates: Y is Up, -Z is forward):
// three_X = blend_X
// three_Y = blend_Z
// three_Z = -blend_Y

// Room center: blend_X = 5.0, blend_Y = -4.94, blend_Z = 3.5 -> three: [5.0, 3.5, 4.94]
// Monitor: blend_X = 6.17, blend_Y = -0.28, blend_Z = 2.51 -> three: [6.17, 2.51, 0.28]
// Desk: blend_X = 5.53, blend_Y = -0.91, blend_Z = 0.04 -> three: [5.53, 1.6, 0.91]
// PC: blend_X = 7.23, blend_Y = -1.22, blend_Z = 1.73 -> three: [7.23, 1.73, 1.22]
// Gamer Neon Sign / Shelf: blend_X = 1.87, blend_Y = -0.04, blend_Z = 2.61 -> three: [1.87, 2.61, 0.04]
// Chair: blend_X = 5.26, blend_Y = -3.68, blend_Z = 2.73 -> three: [5.26, 2.73, 3.68]
// Cloud Shelf / Games: blend_X = 10.09, blend_Y = -3.5, blend_Z = 4.59 -> three: [10.09, 4.59, 3.5]
// Gaming Art Wall: blend_X = -0.01, blend_Y = -7.95, blend_Z = 5.39 -> three: [-0.01, 5.39, 7.95]

export const SECTIONS: SectionItem[] = [
  {
    id: "about",
    index: 0,
    title: "ABOUT THE CLUB",
    subtitle: "COLLEGE BLENDER & 3D ART COLLECTIVE",
    objectId: "monitor",
    objectName: "Samsung Odyssey G8 34\" Curved Gaming Display",
    tagline: "Where imagination turns into three-dimensional reality.",
    description:
      "We are a vibrant collegiate community of 3D artists, animators, environment designers, and VFX creators. From hard-surface mechanical modeling and procedural geometry nodes to cinematic lighting and real-time game assets, we empower students to push visual boundaries using Blender.",
    cameraPosition: [6.17, 2.4, 2.4],
    cameraTarget: [6.17, 2.15, 0.28],
    accentColor: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.4)",
    badge: "CORE_MATRIX // 01",
    stats: [
      { label: "Active Creators", value: "140+" },
      { label: "Render Hours", value: "12,400+" },
      { label: "Annual Projects", value: "35+" },
      { label: "Workshops Held", value: "24+" },
    ],
    features: [
      "Open to all skill levels from absolute beginners to advanced scripters",
      "Hands-on weekly render jams, feedback critiques, and asset sharing",
      "Collaborative group short films, game art, and architectural visualization",
      "Industry guest sessions and portfolio mentorship",
    ],
    ctaText: "EXPLORE WHAT WE DO",
  },
  {
    id: "what-we-do",
    index: 1,
    title: "WHAT WE DO",
    subtitle: "CREATIVE DISCIPLINES & PIPELINES",
    objectId: "workstation",
    objectName: "Pro Gaming Battle Station & Desk Setup",
    tagline: "Mastering the entire 3D production pipeline from scratch.",
    description:
      "Our club delves into every facet of the 3D art spectrum. We host intensive workshops, collaborative project sprints, and live render challenges that replicate real-world game studio and VFX studio workflows.",
    cameraPosition: [5.2, 2.2, 3.2],
    cameraTarget: [5.5, 1.5, 0.9],
    accentColor: "#c084fc",
    accentGlow: "rgba(192, 132, 252, 0.4)",
    badge: "PIPELINE_MODULES // 02",
    interactiveCards: [
      {
        title: "3D Modeling & Sculpting",
        subtitle: "Hard Surface & Organic",
        description: "Precision topology, CAD-style mechanical modeling, and high-resolution digital character sculpting.",
        tag: "GEOMETRY",
      },
      {
        title: "Shading & Texturing",
        subtitle: "PBR & Stylized NPR",
        description: "Procedural shader networks, UV unwrapping, baking, and hand-painted/anime style NPR materials.",
        tag: "SHADING",
      },
      {
        title: "Animation & Rigging",
        subtitle: "Keyframe & Simulation",
        description: "Character skeletal rigging, physics simulations (cloth, smoke, water), and cinematic camera directing.",
        tag: "MOTION",
      },
      {
        title: "Geometry Nodes & VFX",
        subtitle: "Procedural Generation",
        description: "Building automated procedural cities, sci-fi particle effects, and parametric asset generators.",
        tag: "NODES",
      },
    ],
    ctaText: "VIEW OUR PROJECTS",
  },
  {
    id: "projects",
    index: 2,
    title: "PROJECTS",
    subtitle: "STUDENT SHOWCASE & BENCHMARKS",
    objectId: "pc",
    objectName: "Liquid-Cooled RGB Gaming Rig",
    tagline: "Pushing Cycles and Eevee Next to the absolute threshold.",
    description:
      "Explore featured artwork, student short films, environment dioramas, and sci-fi asset kits built entirely within our club ecosystem. Every term concludes with a club-wide community showcase.",
    cameraPosition: [7.9, 2.2, 2.2],
    cameraTarget: [7.23, 1.7, 1.22],
    accentColor: "#8b5cf6",
    accentGlow: "rgba(139, 92, 246, 0.4)",
    badge: "RENDER_ARCHIVES // 03",
    interactiveCards: [
      {
        title: "Project Neo-Tokyo 2099",
        subtitle: "Cyberpunk Cyber Environment",
        description: "A full modular sci-fi alleyway environment built with procedural neon signs and volumetric rain.",
        tag: "ENVIRONMENT",
      },
      {
        title: "Aegis Mech Drone",
        subtitle: "Hard Surface Rigged Model",
        description: "Custom mechanical robot with full inverse kinematics, hydraulic pistons, and damage maps.",
        tag: "HARD SURFACE",
      },
      {
        title: "Quantum Biome Simulation",
        subtitle: "Geometry Nodes Forest",
        description: "Procedural plant generation driven by math curves and dynamic wind simulations.",
        tag: "GEO NODES",
      },
    ],
    ctaText: "DISCOVER UPCOMING EVENTS",
  },
  {
    id: "events",
    index: 3,
    title: "EVENTS & WORKSHOPS",
    subtitle: "COMPETITIONS, JAMS & MASTERCLASSES",
    objectId: "portal",
    objectName: "Cloud Shelf & Game Library",
    tagline: "Learn live, build together, and compete for creative glory.",
    description:
      "We host bi-weekly live masterclasses, beginner onboarding bootcamps, 48-hour Render Jam hackathons, and guest talks with industry 3D artists from game studios and visual effects houses.",
    cameraPosition: [8.8, 3.8, 5.2],
    cameraTarget: [10.09, 4.4, 3.5],
    accentColor: "#ec4899",
    accentGlow: "rgba(236, 72, 153, 0.4)",
    badge: "TIMELINE_SYNC // 04",
    interactiveCards: [
      {
        title: "Weekly 3D Render Jam",
        subtitle: "Every Friday at 6:00 PM",
        description: "A 2-hour rapid creation challenge around a secret surprise theme with live Discord streaming.",
        tag: "WEEKLY",
      },
      {
        title: "Zero to Hero Blender Bootcamp",
        subtitle: "Semester Kickoff Workshop",
        description: "4-session foundational crash course teaching viewport navigation, modifiers, and basic lighting.",
        tag: "WORKSHOP",
      },
      {
        title: "Annual 3D Art Expo",
        subtitle: "Campus Exhibition",
        description: "Interactive VR gallery showcasing physical 3D prints, student renders, and real-time web 3D demos.",
        tag: "ANNUAL EXPO",
      },
    ],
    ctaText: "EXPLORE LEARNING PATHS",
  },
  {
    id: "learning",
    index: 4,
    title: "LEARNING HUB",
    subtitle: "GAMER NEON SIGN & RESOURCE REPO",
    objectId: "shelf",
    objectName: "PlayStation Gamer Neon Wall Sign",
    tagline: "Free curated resources, project templates, and shader libraries.",
    description:
      "Club members gain unlimited access to our internal repository of curated tutorials, CC0 texture packs, node group presets, optimized base meshes, and studio-grade lighting setups.",
    cameraPosition: [1.87, 2.6, 2.4],
    cameraTarget: [1.87, 2.61, 0.04],
    accentColor: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.4)",
    badge: "KNOWLEDGE_BASE // 05",
    features: [
      "Curated 4-tier learning roadmap: Beginner, Intermediate, Advanced, Masterclass",
      "Club asset vault with 500+ procedural shaders, kitbash parts, and HDRIs",
      "One-on-one peer code review for Python scripts and Geometry Node setups",
      "Discounted student certifications and software partner perks",
    ],
    ctaText: "MEET THE TEAM",
  },
  {
    id: "team",
    index: 5,
    title: "THE SQUAD",
    subtitle: "STUDENT LEADS & COMMUNITY CORES",
    objectId: "chair",
    objectName: "Next-Gen Gaming Chair",
    tagline: "Driven by passionate students across diverse creative majors.",
    description:
      "Our team consists of passionate student leads spanning 3D generalists, technical artists, event coordinators, and graphic designers united by a love for open-source 3D technology.",
    cameraPosition: [5.26, 2.8, 5.6],
    cameraTarget: [5.26, 2.0, 3.68],
    accentColor: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.4)",
    badge: "OPERATIVES // 06",
    interactiveCards: [
      {
        title: "Lead 3D Generalist",
        subtitle: "Environment & Hard Surface",
        description: "Guides club curriculum and leads large-scale collaborative animation shorts.",
        tag: "LEAD",
      },
      {
        title: "Technical Artist & Node Specialist",
        subtitle: "Procedural Systems & Shaders",
        description: "Hosts advanced Geometry Node labs and optimizes rendering pipelines.",
        tag: "TECH ART",
      },
      {
        title: "Events & Community Director",
        subtitle: "Workshops & Competitions",
        description: "Orchestrates Render Jams, guest artist keynotes, and student exhibitions.",
        tag: "COMMUNITY",
      },
    ],
    ctaText: "CHECK OUR COMMUNITY",
  },
  {
    id: "community",
    index: 6,
    title: "COMMUNITY",
    subtitle: "DISCORD, CRITIQUES & COLLABORATION",
    objectId: "art",
    objectName: "Framed Gaming Art Gallery Wall",
    tagline: "A 24/7 creative hub where feedback sparks constant growth.",
    description:
      "Our Discord server is the pulsing heart of the club. Share your work-in-progress renders, get constructive feedback from senior members, collaborate on game jams, and hang out in voice channels.",
    cameraPosition: [1.8, 4.2, 7.2],
    cameraTarget: [-0.01, 5.0, 7.95],
    accentColor: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    badge: "NETWORK_NODE // 07",
    stats: [
      { label: "Discord Members", value: "850+" },
      { label: "Weekly Critiques", value: "50+" },
      { label: "Voice Hangouts", value: "Daily" },
      { label: "Collab Projects", value: "12" },
    ],
    features: [
      "Dedicated #wip-critique channel for frame-by-frame feedback",
      "Resource share channels for free add-ons, brushes, and alpha textures",
      "Late-night virtual render-and-chill co-working sessions",
      "Showcase channel linked to our social media highlights",
    ],
    ctaText: "READY TO JOIN?",
  },
  {
    id: "join",
    index: 7,
    title: "JOIN THE CLUB",
    subtitle: "BECOME PART OF THE CREATIVE REVOLUTION",
    objectId: "overview",
    objectName: "Full Virtual Gaming Room Hub",
    tagline: "No prior experience required. Just your curiosity and passion.",
    description:
      "Whether you've never touched a 3D vertex before or you're already writing custom GLSL shaders, there is a place for you in the Blender Club. Join our Discord, attend our next orientation, and start building worlds.",
    cameraPosition: [3.8, 4.5, 9.2],
    cameraTarget: [5.0, 2.2, 4.0],
    accentColor: "#10b981",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    badge: "ACCESS_PORTAL // 08",
    ctaText: "INITIALIZE MEMBERSHIP",
  },
];
