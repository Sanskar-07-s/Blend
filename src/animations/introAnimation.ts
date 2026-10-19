import * as THREE from "three";
import gsap from "gsap";

export interface GroupRestTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface EmissiveStripsData {
  ceiling?: THREE.MeshStandardMaterial[];
  walls?: THREE.MeshStandardMaterial[];
  desk?: THREE.MeshStandardMaterial[];
  sign?: THREE.MeshStandardMaterial[];
  shelf?: THREE.MeshStandardMaterial[];
}

/**
 * All intro animation timing parameters (in seconds).
 * Modify here to tweak the assembly sequence.
 */
export const INTRO_TIMING = {
  totalDuration: 7.5,
  phase1BlackScreen: {
    start: 0.0,
    duration: 1.0,
  },
  phase2FlyIn: {
    start: 1.0,
    duration: 2.5,
    minFlyDuration: 1.3,
    maxFlyDuration: 1.8,
    clusterScale: 0.35,
    // When scale is 0.35, offset shifts the cluster to the center of the room
    clusterPosOffset: [3.25, 2.28, 3.22] as [number, number, number],
  },
  phase3ClusterPulse: {
    start: 3.5,
    duration: 0.7,
    scaleMultiplier: 1.15,
  },
  phase4Unfold: {
    start: 4.2,
    duration: 2.0,
    overshoot: 1.25, // ~5% overshoot
    staggerDelay: 0.14,
    order: [
      "group_floor",
      "group_backwall",
      "group_leftwall",
      "group_rightwall",
      "group_ceiling",
      "group_desk",
      "group_pc",
      "group_monitors",
      "group_chair",
      "group_shelf",
      "group_props",
      "group_sign",
    ],
  },
  phase5LightsOn: {
    start: 6.2,
    duration: 1.3,
  },
};

// Seeded fly-in start offsets for each group from different sides
export const GROUP_START_OFFSETS: Record<
  string,
  { offset: [number, number, number]; rot: [number, number, number]; delay: number }
> = {
  group_floor:     { offset: [0, -18, 0],    rot: [0.3, 0, -0.4],    delay: 0.00 }, // From below
  group_ceiling:   { offset: [0, 20, 0],     rot: [-0.4, 0.5, 0.2],  delay: 0.14 }, // From above
  group_backwall:  { offset: [0, 2, -22],    rot: [0.6, 0.4, -0.3],  delay: 0.05 }, // From back
  group_leftwall:  { offset: [-22, 2, 0],    rot: [-0.3, 0.7, 0.5],  delay: 0.10 }, // From far left
  group_rightwall: { offset: [22, 2, 0],     rot: [0.5, -0.6, -0.2], delay: 0.12 }, // From far right
  group_desk:      { offset: [-14, -8, 16],  rot: [-0.5, 0.8, -0.4], delay: 0.18 }, // From front-left
  group_pc:        { offset: [14, 6, 14],    rot: [0.7, -0.5, 0.6],  delay: 0.22 }, // From front-right
  group_monitors:  { offset: [-4, 16, 12],   rot: [0.8, 0.3, -0.7],  delay: 0.20 }, // From top-front
  group_chair:     { offset: [14, -8, -12],  rot: [-0.6, -0.7, 0.4], delay: 0.26 }, // From back-right
  group_shelf:     { offset: [-16, 12, -8],  rot: [0.4, -0.9, 0.3],  delay: 0.25 }, // From top-left
  group_sign:      { offset: [0, 4, 20],     rot: [0.2, 0.5, -0.8],  delay: 0.30 }, // From front
  group_props:     { offset: [16, 14, 8],    rot: [-0.8, 0.4, 0.6],  delay: 0.28 }, // From top-right
};

/**
 * Creates the master GSAP timeline for the room assembly sequence.
 * High-performance: animates transforms and select light values only.
 */
export function createAssemblyTimeline({
  groups,
  restTransforms,
  camera,
  overviewCam,
  accentLightRef,
  stripMaterials,
  onComplete,
  reducedMotion = false,
}: {
  groups: Map<string, THREE.Object3D>;
  restTransforms: Map<string, GroupRestTransform>;
  camera: THREE.Camera;
  overviewCam: { position: [number, number, number]; target: [number, number, number] };
  accentLightRef?: THREE.PointLight | null;
  groupMaterials?: Map<string, THREE.MeshStandardMaterial[]>;
  stripMaterials?: EmissiveStripsData;
  onComplete: () => void;
  reducedMotion?: boolean;
}): gsap.core.Timeline {
  const masterTl = gsap.timeline({
    onComplete: () => {
      // Ensure all groups lock to rest transforms cleanly
      groups.forEach((group, name) => {
        const rest = restTransforms.get(name);
        if (rest) {
          group.position.copy(rest.position);
          group.rotation.copy(rest.rotation);
          group.scale.set(1, 1, 1);
          group.visible = true;
        }
      });
      if (accentLightRef) {
        accentLightRef.intensity = 1.2;
      }
      onComplete();
    },
  });

  // Reduced motion: 1s fade-in of completed room
  if (reducedMotion) {
    groups.forEach((group, name) => {
      const rest = restTransforms.get(name);
      if (rest) {
        group.position.copy(rest.position);
        group.rotation.copy(rest.rotation);
        group.scale.set(1, 1, 1);
        group.visible = true;
      }
    });
    masterTl.to({}, { duration: 1.0 });
    return masterTl;
  }

  const { clusterPosOffset, clusterScale } = INTRO_TIMING.phase2FlyIn;
  const cTargetPos = new THREE.Vector3(...clusterPosOffset);

  // Initial camera setup for intro
  const camStartPos = new THREE.Vector3(
    overviewCam.position[0],
    overviewCam.position[1] + 2.5,
    overviewCam.position[2] + 4.5
  );
  const camClosePos = new THREE.Vector3(
    overviewCam.position[0] - 0.5,
    overviewCam.position[1] - 1.2,
    overviewCam.position[2] - 3.5
  );
  const camOverviewPos = new THREE.Vector3(...overviewCam.position);
  const lookTarget = new THREE.Vector3(...overviewCam.target);

  // Position camera at wide start
  camera.position.copy(camStartPos);
  camera.lookAt(lookTarget);

  // Phase 1: Camera slowly drifts in (0.0 -> 3.5s)
  masterTl.to(
    camera.position,
    {
      x: camClosePos.x,
      y: camClosePos.y,
      z: camClosePos.z,
      duration: 3.5,
      ease: "power2.out",
      onUpdate: () => camera.lookAt(lookTarget),
    },
    0.0
  );

  // Prepare each group at scattered far start pose
  groups.forEach((group, name) => {
    const rest = restTransforms.get(name);
    if (!rest) return;

    const startInfo = GROUP_START_OFFSETS[name] || {
      offset: [0, 15, 0],
      rot: [0, 0, 0],
      delay: 0.1,
    };

    const startX = rest.position.x + startInfo.offset[0];
    const startY = rest.position.y + startInfo.offset[1];
    const startZ = rest.position.z + startInfo.offset[2];

    group.position.set(startX, startY, startZ);
    group.rotation.set(
      rest.rotation.x + startInfo.rot[0],
      rest.rotation.y + startInfo.rot[1],
      rest.rotation.z + startInfo.rot[2]
    );
    group.scale.set(clusterScale, clusterScale, clusterScale);
    group.visible = true;

    // Phase 2: FLY IN (1.0 -> 3.5s)
    const flyStart = INTRO_TIMING.phase2FlyIn.start + startInfo.delay;
    const flyDur = 1.6;

    masterTl.to(
      group.position,
      {
        x: cTargetPos.x,
        y: cTargetPos.y,
        z: cTargetPos.z,
        duration: flyDur,
        ease: "power3.out",
      },
      flyStart
    );

    masterTl.to(
      group.rotation,
      {
        x: rest.rotation.x * 0.5,
        y: rest.rotation.y * 0.5,
        z: rest.rotation.z * 0.5,
        duration: flyDur,
        ease: "power3.out",
      },
      flyStart
    );
  });

  // Phase 3: Cluster Pulse (3.5 -> 4.2s)
  const pulseStart = INTRO_TIMING.phase3ClusterPulse.start;
  const pulseDur = INTRO_TIMING.phase3ClusterPulse.duration;
  const pScale = clusterScale * INTRO_TIMING.phase3ClusterPulse.scaleMultiplier;

  groups.forEach((group) => {
    masterTl.to(
      group.scale,
      {
        x: pScale,
        y: pScale,
        z: pScale,
        duration: pulseDur * 0.5,
        ease: "power2.out",
      },
      pulseStart
    );
    masterTl.to(
      group.scale,
      {
        x: clusterScale,
        y: clusterScale,
        z: clusterScale,
        duration: pulseDur * 0.5,
        ease: "power2.in",
      },
      pulseStart + pulseDur * 0.5
    );
  });

  if (accentLightRef) {
    masterTl.to(
      accentLightRef,
      {
        intensity: 3.5,
        duration: pulseDur * 0.4,
        ease: "power2.out",
      },
      pulseStart
    );
    masterTl.to(
      accentLightRef,
      {
        intensity: 1.0,
        duration: pulseDur * 0.6,
        ease: "power2.in",
      },
      pulseStart + pulseDur * 0.4
    );
  }

  // Phase 4: UNFOLD to real positions with overshoot & lock emissive flash (4.2 -> 6.2s)
  const unfoldBase = INTRO_TIMING.phase4Unfold.start;
  const { order, staggerDelay, overshoot } = INTRO_TIMING.phase4Unfold;

  order.forEach((name, idx) => {
    const group = groups.get(name);
    const rest = restTransforms.get(name);
    if (!group || !rest) return;

    const unfoldStart = unfoldBase + idx * staggerDelay;
    const unfoldDuration = 0.95;

    // Animate position back to rest with overshoot
    masterTl.to(
      group.position,
      {
        x: rest.position.x,
        y: rest.position.y,
        z: rest.position.z,
        duration: unfoldDuration,
        ease: `back.out(${overshoot})`,
      },
      unfoldStart
    );

    // Animate rotation to rest
    masterTl.to(
      group.rotation,
      {
        x: rest.rotation.x,
        y: rest.rotation.y,
        z: rest.rotation.z,
        duration: unfoldDuration,
        ease: `back.out(${overshoot})`,
      },
      unfoldStart
    );

    // Scale back to 1.0 with overshoot
    masterTl.to(
      group.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: unfoldDuration,
        ease: `back.out(${overshoot})`,
      },
      unfoldStart
    );

    // Subtle emissive flash on piece lock (fades in 0.3s) via accent light pulse
    if (accentLightRef) {
      const lockTime = unfoldStart + 0.7;
      masterTl.to(
        accentLightRef,
        {
          intensity: 1.8,
          duration: 0.08,
          ease: "power2.out",
        },
        lockTime
      );
      masterTl.to(
        accentLightRef,
        {
          intensity: 1.0,
          duration: 0.22,
          ease: "power2.inOut",
        },
        lockTime + 0.08
      );
    }
  });

  // Phase 5: LIGHTS ON in sequence & Camera pulls back (6.2 -> 7.5s)
  const lightsStart = INTRO_TIMING.phase5LightsOn.start;
  const lightsDur = INTRO_TIMING.phase5LightsOn.duration;

  // Stagger key strip lights in sequence
  const stripSequence: Array<{ key: keyof EmissiveStripsData; delay: number; target: number }> = [
    { key: "ceiling", delay: 0.00, target: 1.5 },
    { key: "walls",   delay: 0.18, target: 1.5 },
    { key: "desk",    delay: 0.36, target: 1.5 },
    { key: "sign",    delay: 0.54, target: 2.0 },
    { key: "shelf",   delay: 0.72, target: 0.6 }, // Subtle shelf light (max 0.6)
  ];

  if (stripMaterials) {
    stripSequence.forEach(({ key, delay, target }) => {
      const mats = stripMaterials[key];
      if (mats && mats.length > 0) {
        // Pick primary material
        const m = mats[0];
        const sTime = lightsStart + delay;
        masterTl.fromTo(
          m,
          { emissiveIntensity: 0.2 },
          {
            emissiveIntensity: target + 0.3,
            duration: 0.15,
            ease: "power2.out",
          },
          sTime
        );
        masterTl.to(
          m,
          {
            emissiveIntensity: target,
            duration: 0.35,
            ease: "power2.inOut",
          },
          sTime + 0.15
        );
      }
    });
  }

  // Camera pull back to overview pose
  masterTl.to(
    camera.position,
    {
      x: camOverviewPos.x,
      y: camOverviewPos.y,
      z: camOverviewPos.z,
      duration: lightsDur,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(lookTarget),
    },
    lightsStart
  );

  if (accentLightRef) {
    masterTl.to(
      accentLightRef,
      {
        intensity: 1.2,
        duration: lightsDur,
        ease: "power2.out",
      },
      lightsStart
    );
  }

  return masterTl;
}

/**
 * Instantly snaps all groups to their rest transforms and camera to overview.
 */
export function snapToRestPose({
  groups,
  restTransforms,
  camera,
  overviewCam,
  accentLightRef,
  stripMaterials,
}: {
  groups: Map<string, THREE.Object3D>;
  restTransforms: Map<string, GroupRestTransform>;
  camera?: THREE.Camera;
  overviewCam?: { position: [number, number, number]; target: [number, number, number] };
  accentLightRef?: THREE.PointLight | null;
  stripMaterials?: EmissiveStripsData;
}) {
  groups.forEach((group, name) => {
    const rest = restTransforms.get(name);
    if (rest) {
      group.position.copy(rest.position);
      group.rotation.copy(rest.rotation);
      group.scale.set(1, 1, 1);
      group.visible = true;
    }
  });

  if (stripMaterials) {
    stripMaterials.ceiling?.forEach((m) => { m.emissiveIntensity = 1.5; });
    stripMaterials.walls?.forEach((m) => { m.emissiveIntensity = 1.5; });
    stripMaterials.desk?.forEach((m) => { m.emissiveIntensity = 1.5; });
    stripMaterials.sign?.forEach((m) => { m.emissiveIntensity = 2.0; });
    stripMaterials.shelf?.forEach((m) => { m.emissiveIntensity = 0.6; });
  }

  if (camera && overviewCam) {
    camera.position.set(...overviewCam.position);
    camera.lookAt(new THREE.Vector3(...overviewCam.target));
  }

  if (accentLightRef) {
    accentLightRef.intensity = 1.2;
  }
}
