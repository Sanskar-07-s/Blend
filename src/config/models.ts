import manifest from "./modelsManifest.json";

export interface ModelManifest {
  room: string;
  roomMobile: string;
  anchors: string;
}

export const MODEL_MANIFEST: ModelManifest = manifest;
