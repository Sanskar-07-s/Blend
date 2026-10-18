export interface SceneConfig {
  ambientColor: string;
  ambientIntensity: number;
  neonPrimaryColor: string;
  neonSecondaryColor: string;
  neonAccentColor: string;
  roomSize: [number, number, number];
  cameraDefaults: {
    fov: number;
    near: number;
    far: number;
    introPosition: [number, number, number];
    introTarget: [number, number, number];
    overviewPosition: [number, number, number];
    overviewTarget: [number, number, number];
  };
  particles: {
    count: number;
    size: number;
    color: string;
    secondaryColor: string;
  };
}

export const SCENE_CONFIG: SceneConfig = {
  ambientColor: "#12072b",
  ambientIntensity: 0.8,
  neonPrimaryColor: "#8b5cf6",
  neonSecondaryColor: "#c084fc",
  neonAccentColor: "#06b6d4",
  roomSize: [8, 5, 8],
  cameraDefaults: {
    fov: 48,
    near: 0.1,
    far: 100,
    introPosition: [0, 4.5, 7.5],
    introTarget: [0, 1.2, 0],
    overviewPosition: [0, 2.8, 4.2],
    overviewTarget: [0, 1.2, 0],
  },
  particles: {
    count: 320,
    size: 0.035,
    color: "#a855f7",
    secondaryColor: "#38bdf8",
  },
};
