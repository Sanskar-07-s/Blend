import { useState, useEffect, useCallback, useRef } from "react";
import { SECTIONS, computeFramingCamera, OVERVIEW_CAMERA, type SectionItem } from "../data/sections";

export type NavState = "loading" | "intro" | "overview" | "transitioning" | "section";

export interface AnchorsData {
  roomBounds: {
    min: [number, number, number];
    max: [number, number, number];
    center: [number, number, number];
    size: [number, number, number];
  };
  sections: Record<string, {
    exists: boolean;
    blenderObjectName: string;
    sectionName: string;
    preferredSide: "left" | "right";
    bbox: {
      min: [number, number, number];
      max: [number, number, number];
      center: [number, number, number];
      size: [number, number, number];
    };
    insideRoom: boolean;
  }>;
}

export function useSceneNavigation() {
  const [navState, setNavState] = useState<NavState>("loading");
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [anchors, setAnchors] = useState<AnchorsData | null>(null);
  const [sections, setSections] = useState<SectionItem[]>(SECTIONS);
  const [highlightedObject, setHighlightedObject] = useState<string | null>(null);
  const [overviewCam, setOverviewCam] = useState(OVERVIEW_CAMERA);

  // Track pending transition target
  const transitioningRef = useRef(false);

  // Load anchors.json once on mount
  useEffect(() => {
    fetch("/models/anchors.json")
      .then((res) => res.json())
      .then((data: AnchorsData) => {
        setAnchors(data);

        // Compute room overview camera from roomBounds
        if (data.roomBounds) {
          const rb = data.roomBounds;
          const fov = 48;
          const maxDim = Math.max(rb.size[0], rb.size[1], rb.size[2]);
          const fovRad = (fov * Math.PI) / 180;
          const dist = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.05;
          
          // Open side is +Z, view slightly from the side (+X) and above (+Y)
          const camPos: [number, number, number] = [
            rb.center[0] + 0.5,
            rb.center[1] + dist * 0.35,
            rb.center[2] + dist * 0.95
          ];
          const camTarget: [number, number, number] = [
            rb.center[0],
            rb.center[1] - 0.2,
            rb.center[2]
          ];
          setOverviewCam({ position: camPos, target: camTarget });
        }

        // Dynamically compute camera framing for all sections
        setSections((prev) =>
          prev.map((sec) => {
            const anchorSec = data.sections[sec.id];
            if (anchorSec && anchorSec.bbox) {
              const framing = computeFramingCamera(anchorSec.bbox, 48, sec.override);
              return {
                ...sec,
                bbox: anchorSec.bbox,
                cameraPosition: framing.position,
                cameraTarget: framing.target,
              };
            }
            return sec;
          })
        );
      })
      .catch((err) => {
        console.warn("Could not load anchors.json, falling back to static defaults:", err);
      });
  }, []);

  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex] ?? sections[0];

  // Predictable State Actions
  const goTo = useCallback(
    (sectionIdOrIndex: string | number) => {
      let targetIndex = 0;
      if (typeof sectionIdOrIndex === "number") {
        targetIndex = Math.max(0, Math.min(sectionIdOrIndex, totalSections - 1));
      } else {
        const found = sections.findIndex((s) => s.id === sectionIdOrIndex);
        if (found !== -1) targetIndex = found;
      }

      // Ignore input if already transitioning
      if (transitioningRef.current) return;

      setIsMenuOpen(false);
      transitioningRef.current = true;
      setNavState("transitioning");
      setCurrentSectionIndex(targetIndex);
    },
    [sections, totalSections]
  );

  const home = useCallback(() => {
    if (transitioningRef.current) return;
    setIsMenuOpen(false);
    transitioningRef.current = true;
    setNavState("transitioning");
    setHighlightedObject(null);
  }, []);

  const next = useCallback(() => {
    if (transitioningRef.current) return;
    if (navState === "overview") {
      goTo(0);
      return;
    }
    if (currentSectionIndex >= totalSections - 1) {
      // Last section NEXT goes to overview
      home();
      return;
    }
    goTo(currentSectionIndex + 1);
  }, [navState, currentSectionIndex, totalSections, goTo, home]);

  const back = useCallback(() => {
    if (transitioningRef.current) return;
    if (navState === "overview") {
      return;
    }
    if (currentSectionIndex <= 0) {
      // First section BACK goes to overview
      home();
      return;
    }
    goTo(currentSectionIndex - 1);
  }, [navState, currentSectionIndex, goTo, home]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleDebug = useCallback(() => {
    setIsDebugOpen((prev) => !prev);
  }, []);

  // Called when camera transition finishes
  const onTransitionComplete = useCallback((reachedState: "overview" | "section") => {
    transitioningRef.current = false;
    setNavState(reachedState);
    if (reachedState === "section") {
      setHighlightedObject(currentSection.objectName);
    } else {
      setHighlightedObject(null);
    }
  }, [currentSection]);

  // Global Keyboard listener for arrow keys, Esc, Home, and G (debug overlay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsMenuOpen(false);
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        home();
      } else if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        toggleDebug();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, back, home, toggleDebug]);

  return {
    navState,
    setNavState,
    currentSectionIndex,
    currentSection,
    totalSections,
    sections,
    anchors,
    overviewCam,
    highlightedObject,
    isMenuOpen,
    setIsMenuOpen,
    isDebugOpen,
    setIsDebugOpen,
    goTo,
    next,
    back,
    home,
    toggleMenu,
    toggleDebug,
    onTransitionComplete,
  };
}
