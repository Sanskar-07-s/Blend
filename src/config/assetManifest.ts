export interface AssetConfig {
  id: string;
  name: string;
  glbPath: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  enabled: boolean;
}

export const ASSET_MANIFEST: Record<string, AssetConfig> = {
  room: {
    id: "room",
    name: "Cyber Gaming Room Environment",
    glbPath: "/models/room.glb",
    enabled: true,
  },
  monitor: {
    id: "monitor",
    name: "Dual Studio Displays (Curved 34\" + Secondary 24\")",
    glbPath: "/models/monitor.glb",
    enabled: true,
  },
  workstation: {
    id: "workstation",
    name: "Pro Gaming Battle Station & Peripherals",
    glbPath: "/models/workstation.glb",
    enabled: true,
  },
  pc: {
    id: "pc",
    name: "RGB Gaming Desktop PC",
    glbPath: "/models/pc.glb",
    enabled: true,
  },
  chair: {
    id: "chair",
    name: "Ergonomic Pro Gaming Chairs",
    glbPath: "/models/chair.glb",
    enabled: true,
  },
  shelf: {
    id: "shelf",
    name: "Display Shelves, Books & Neon Sign",
    glbPath: "/models/shelf.glb",
    enabled: true,
  },
  portal: {
    id: "portal",
    name: "Holographic Stage Projector",
    glbPath: "/models/portal.glb",
    enabled: false,
  },
  audio_rig: {
    id: "audio_rig",
    name: "Broadcast & Trophy Station",
    glbPath: "/models/audio_rig.glb",
    enabled: false,
  },
  terminal: {
    id: "terminal",
    name: "Cyber Access Terminal",
    glbPath: "/models/terminal.glb",
    enabled: false,
  },
};
