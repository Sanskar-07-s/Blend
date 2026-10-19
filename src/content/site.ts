import { ENV } from "../config/env";

export interface NavLink {
  label: string;
  href: string;
}

export interface FactTile {
  metric: string;
  label: string;
  description: string;
}

export interface ActivityCard {
  title: string;
  description: string;
  iconName: string;
  tag: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  image: string;
  demoUrl?: string;
  has3DModel?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tag: "workshop" | "competition" | "meetup";
  status: "upcoming" | "past";
}

export interface LearningResource {
  id: string;
  title: string;
  category: "Tutorials" | "Roadmaps" | "Session Notes";
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  link: string;
  duration: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  author: string;
  category: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface TeamMember {
  id: string;
  role: string;
  name: string; // "Name placeholder"
  department: string;
  avatarPlaceholder: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  navigation: {
    brand: string;
    links: NavLink[];
  };
  hero: {
    headline: string;
    subline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    headline: string;
    subline: string;
    mission: string;
    vision: string;
    facts: FactTile[];
  };
  whatWeDo: {
    headline: string;
    subline: string;
    cards: ActivityCard[];
  };
  projects: {
    headline: string;
    subline: string;
    items: ProjectItem[];
  };
  events: {
    headline: string;
    subline: string;
    items: EventItem[];
  };
  learning: {
    headline: string;
    subline: string;
    resources: LearningResource[];
  };
  gallery: {
    headline: string;
    subline: string;
    items: GalleryItem[];
  };
  team: {
    headline: string;
    subline: string;
    members: TeamMember[];
  };
  community: {
    headline: string;
    subline: string;
    participationSteps: string[];
    socials: SocialLink[];
    faq: FAQItem[];
  };
  join: {
    headline: string;
    subline: string;
    steps: { number: string; title: string; desc: string }[];
    joinUrl: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
}

export const SITE_CONTENT: SiteContent = {
  meta: {
    title: "Blender Club | 3D Studio & Creative Community",
    description: "Collegiate 3D animation, geometry nodes, character sculpting, and real-time visualization lab.",
  },
  navigation: {
    brand: "BLENDER CLUB",
    links: [
      { label: "About", href: "#about" },
      { label: "What We Do", href: "#what-we-do" },
      { label: "Projects", href: "#projects" },
      { label: "Events", href: "#events" },
      { label: "Learning", href: "#learning" },
      { label: "Gallery", href: "#gallery" },
      { label: "Team", href: "#team" },
      { label: "Community", href: "#community" },
      { label: "Join", href: "#join" },
    ],
  },
  hero: {
    headline: "CRAFTING VIRTUAL WORLDS WITH OPEN TOOLS",
    subline: "We are a university-wide creative studio exploring procedural geometry, digital sculpting, character animation, and real-time interactive rendering in Blender.",
    ctaPrimary: "Join the Club",
    ctaSecondary: "Enter 3D Studio",
  },
  about: {
    headline: "ABOUT THE LAB",
    subline: "Bridging artistic imagination and mathematical precision since foundation.",
    mission: "Our mission is to foster a collaborative, zero-barrier environment where creators from engineering, fine arts, architecture, and computer science master 3D production pipelines using open-source workflows.",
    vision: "To cultivate industry-ready digital artists, procedural technical directors, and real-time graphics developers pushing open-source creative technology to its frontiers.",
    facts: [
      {
        metric: "100%",
        label: "Open Source Tech",
        description: "Built entirely on Blender, Cycles, EEVEE Next, and open-standard WebGL pipelines.",
      },
      {
        metric: "Weekly",
        label: "Hands-on Sessions",
        description: "Live node jams, modeling sprints, and peer critique labs throughout each semester.",
      },
      {
        metric: "Portfolio",
        label: "Industry Readiness",
        description: "Members build published short films, interactive environments, and CC0 asset packs.",
      },
    ],
  },
  whatWeDo: {
    headline: "WHAT WE EXPLORE",
    subline: "Comprehensive tracks spanning every stage of the contemporary 3D pipeline.",
    cards: [
      {
        title: "Hard-Surface & SubD Modeling",
        description: "Precision topology, bevel workflows, mechanical asset design, and modular architectural kitbashing.",
        iconName: "Box",
        tag: "Core Modeling",
      },
      {
        title: "Digital Sculpting & Anatomy",
        description: "Organic character creation, dynamic cloth simulations, retopology, and high-frequency displacement.",
        iconName: "Feather",
        tag: "Organic Arts",
      },
      {
        title: "Geometry Nodes & Procedural Art",
        description: "Algorithmic generation, parametric modeling networks, simulation zones, and math-driven animation.",
        iconName: "Cpu",
        tag: "Procedural",
      },
      {
        title: "Cinematic Lighting & Shading",
        description: "Physically based materials, volumetric atmosphere, ACES color grading, and Cycles raytracing.",
        iconName: "Sparkles",
        tag: "Lookdev",
      },
      {
        title: "Rigging & Character Animation",
        description: "Skeletal deformation rigs, shape keys, graph editor timing, kinematics, and physics simulation.",
        iconName: "Film",
        tag: "Animation",
      },
      {
        title: "Real-time Game & Web 3D",
        description: "Mesh optimization, texture baking, glTF compression (Meshopt/KTX2), and Three.js runtime deployment.",
        iconName: "Layers",
        tag: "Interactive",
      },
    ],
  },
  projects: {
    headline: "STUDIO SHOWCASE",
    subline: "Selected student initiatives, open assets, and interactive experiments.",
    items: [
      {
        id: "proj-1",
        title: "Cybernetic Workspace",
        category: "Interactive Environment",
        tags: ["WebGL", "Three.js", "Blender 5.2"],
        description: "Real-time virtual creator studio featuring interactive section-framed cameras and procedural materials.",
        image: "/models/og-image.png",
        demoUrl: "/experience",
        has3DModel: true,
      },
      {
        id: "proj-2",
        title: "Parametric Foliage Engine",
        category: "Geometry Nodes",
        tags: ["Procedural", "Simulation", "Open Assets"],
        description: "A nodegroup package generating biome-accurate botanic foliage with wind dynamics and Level-of-Detail.",
        image: "/models/og-image.png",
      },
      {
        id: "proj-3",
        title: "Modular Battlepod Mech",
        category: "Hard Surface",
        tags: ["SubD", "PBR", "Concept Art"],
        description: "High-detail hard-surface vehicle concept with optimized baking for real-time engines.",
        image: "/models/og-image.png",
      },
      {
        id: "proj-4",
        title: "Studio Soundscape Visualizer",
        category: "Animation & VFX",
        tags: ["Audio Reactive", "Eevee Next", "Compositing"],
        description: "Real-time spectral decomposition driving procedural light emitters and particle turbulence.",
        image: "/models/og-image.png",
      },
    ],
  },
  events: {
    headline: "WORKSHOPS & EVENTS",
    subline: "Weekly technical sessions, open hackathons, and guest industry lectures.",
    items: [
      {
        id: "ev-1",
        title: "Geometry Nodes: From Zero to Procedural Architectures",
        date: "Upcoming (Semester Schedule)",
        time: "6:00 PM - 8:00 PM EST",
        location: "Design Lab 302 / Discord Stream",
        description: "Learn how vector math and mesh primitives combine to build infinite sci-fi corridors and organic patterns.",
        tag: "workshop",
        status: "upcoming",
      },
      {
        id: "ev-2",
        title: "48-Hour Weekend Speed Modeling Jam",
        date: "Upcoming (Annual Sprint)",
        time: "Friday 7:00 PM - Sunday 7:00 PM",
        location: "Virtual (Discord & Community Gallery)",
        description: "Theme reveal at kickoff. Participants build and light a single hero prop within a 50k triangle limit.",
        tag: "competition",
        status: "upcoming",
      },
      {
        id: "ev-3",
        title: "Foundations of Lighting in Cycles & ACES Color Grading",
        date: "Past Session",
        time: "Recorded Workshop",
        location: "Archive Library",
        description: "Mastering 3-point cinematic lighting, Gobo projectors, and atmospheric depth passes.",
        tag: "workshop",
        status: "past",
      },
      {
        id: "ev-4",
        title: "Spring Portfolio Review & Critique Night",
        date: "Past Session",
        time: "Recorded Showcase",
        location: "Club Lounge",
        description: "Peer-led review focusing on breakdown renders, wireframe topology turntables, and lighting composition.",
        tag: "meetup",
        status: "past",
      },
    ],
  },
  learning: {
    headline: "RESOURCE VAULT",
    subline: "Curated learning tracks, starter kits, and technical documentation.",
    resources: [
      {
        id: "res-1",
        title: "Blender 4.x/5.x Navigation & Modeling Fundamentals",
        category: "Tutorials",
        level: "Beginner",
        description: "Essential hotkeys, view manipulation, modifier stacks, and non-destructive modeling principles.",
        link: "#",
        duration: "2.5 Hours",
      },
      {
        id: "res-2",
        title: "Complete Geometry Nodes Math & Field Guide",
        category: "Roadmaps",
        level: "Intermediate",
        description: "Comprehensive visual cheatsheet for field evaluation, attributes, instance transforms, and curves.",
        link: "#",
        duration: "Reference Doc",
      },
      {
        id: "res-3",
        title: "Clean Subdivision Retopology & UV Unwrapping",
        category: "Tutorials",
        level: "Intermediate",
        description: "Eliminating poles, maintaining edge flow for animation deformation, and packing texel density.",
        link: "#",
        duration: "1.5 Hours",
      },
      {
        id: "res-4",
        title: "Web 3D Optimization Pipeline (glTF, Meshopt, KTX2)",
        category: "Session Notes",
        level: "Advanced",
        description: "Export parameters, decimation budgets, draw-call minimization, and transmission pass avoidance.",
        link: "#",
        duration: "Documentation",
      },
    ],
  },
  gallery: {
    headline: "MEMBER GALLERY",
    subline: "Renders, procedural studies, and interactive snapshots created by studio members.",
    items: [
      {
        id: "gal-1",
        title: "Cyber Cockpit Desk Station",
        author: "Studio Render",
        category: "Environment",
        src: "/test-results/tier_screenshots/high_sec1_about.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
      {
        id: "gal-2",
        title: "Liquid-Cooled Workstation Rig",
        author: "Studio Render",
        category: "Hard Surface",
        src: "/test-results/tier_screenshots/high_sec2_projects.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
      {
        id: "gal-3",
        title: "Floating Cloud LED Modular Shelf",
        author: "Studio Render",
        category: "Lookdev",
        src: "/test-results/tier_screenshots/high_sec3_events.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
      {
        id: "gal-4",
        title: "Geometric Design Bookcase",
        author: "Studio Render",
        category: "Architecture",
        src: "/test-results/tier_screenshots/high_sec4_learning.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
      {
        id: "gal-5",
        title: "Framed Cyberpunk Wall Art Gallery",
        author: "Studio Render",
        category: "Lighting",
        src: "/test-results/tier_screenshots/high_sec5_gallery.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
      {
        id: "gal-6",
        title: "Studio PlayStation Neon Emissive Array",
        author: "Studio Render",
        category: "VFX",
        src: "/test-results/tier_screenshots/high_sec8_join.png",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
      },
    ],
  },
  team: {
    headline: "STUDIO LEADERSHIP",
    subline: "Coordinating workshops, technical labs, and creative collaborations.",
    members: [
      {
        id: "tm-1",
        role: "President",
        name: "Name placeholder",
        department: "Computer Graphics & Media Arts",
        avatarPlaceholder: "PR",
      },
      {
        id: "tm-2",
        role: "Vice President",
        name: "Name placeholder",
        department: "Visual Effects & Simulation",
        avatarPlaceholder: "VP",
      },
      {
        id: "tm-3",
        role: "Technical Lead",
        name: "Name placeholder",
        department: "Procedural Technical Direction",
        avatarPlaceholder: "TL",
      },
      {
        id: "tm-4",
        role: "Creative Director",
        name: "Name placeholder",
        department: "Lighting & Digital Sculpting",
        avatarPlaceholder: "CD",
      },
      {
        id: "tm-5",
        role: "Workshop Coordinator",
        name: "Name placeholder",
        department: "Curriculum & Mentorship",
        avatarPlaceholder: "WC",
      },
      {
        id: "tm-6",
        role: "Web & Interactive Lead",
        name: "Name placeholder",
        department: "Three.js & WebGL Systems",
        avatarPlaceholder: "WL",
      },
    ],
  },
  community: {
    headline: "JOIN THE COMMUNITY",
    subline: "Connect with peers, share work-in-progress, and get realtime feedback.",
    participationSteps: [
      "Join our Discord server to participate in live critique channels and share WIP viewport renders.",
      "Attend our weekly hybrid lab workshops every Wednesday evening.",
      "Submit renders to our monthly community challenge prompts for gallery placement.",
    ],
    socials: [
      { platform: "Discord", url: "https://discord.gg/placeholder", icon: "MessageSquare" },
      { platform: "GitHub", url: "https://github.com/placeholder", icon: "Github" },
      { platform: "Instagram", url: "https://instagram.com/placeholder", icon: "Instagram" },
      { platform: "YouTube", url: "https://youtube.com/@placeholder", icon: "Youtube" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/placeholder", icon: "Linkedin" },
    ],
    faq: [
      {
        question: "Do I need prior 3D experience to join?",
        answer: "No. We run dedicated beginner tracks each semester teaching Blender from absolute interface navigation through basic modeling and lighting.",
      },
      {
        question: "Is Blender truly completely free?",
        answer: "Yes. Blender is 100% free and open-source under the GNU GPL, with no licenses, trials, or subscriptions required.",
      },
      {
        question: "What hardware do I need to participate?",
        answer: "Any modern laptop or desktop capable of running Blender 4.2+ (64-bit Windows, macOS, or Linux). Our sessions emphasize lightweight optimization workflows.",
      },
      {
        question: "Are external students or alumni allowed?",
        answer: "Yes, our community Discord channels, challenges, and public workshops welcome all interested creators.",
      },
    ],
  },
  join: {
    headline: "BECOME A MEMBER",
    subline: "Take your first step into open-source 3D visualization.",
    steps: [
      {
        number: "01",
        title: "Fill Membership Intake",
        desc: "Complete our quick 2-minute registration questionnaire so we understand your creative interests.",
      },
      {
        number: "02",
        title: "Connect to Discord",
        desc: "Receive instant access to our announcement feeds, resource vaults, and workshop voice channels.",
      },
      {
        number: "03",
        title: "Join the Next Workshop",
        desc: "Show up with your laptop or tune into the live broadcast stream to start creating.",
      },
    ],
    joinUrl: ENV.JOIN_URL,
  },
  footer: {
    tagline: "Student-run creative lab advancing open-source 3D art, geometry nodes, and real-time visualization.",
    copyright: "© Blender Club. Open-source educational community.",
  },
};
