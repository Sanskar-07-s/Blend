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
  const [isGoingOverview, setIsGoingOverview] = useState(false);

  // Safety fallback timeout for transitions
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex] ?? sections[0];

  useEffect(() => {
    document.body.dataset.navState = navState;
    document.body.dataset.section = currentSection?.id || "";
    if (typeof window !== "undefined" && (window as any).__bc) {
      (window as any).__bc.state = navState;
      (window as any).__bc.section = currentSection?.id || "";
    }
  }, [navState, currentSection]);

  useEffect(() => {
    fetch("/models/anchors.json")
      .then((res) => res.json())
      .then((data: AnchorsData) => {
        setAnchors(data);

        if (data.roomBounds) {
          const rb = data.roomBounds;
          const fov = 48;
          const maxDim = Math.max(rb.size[0], rb.size[1], rb.size[2]);
          const fovRad = (fov * Math.PI) / 180;
          const dist = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.05;

          const camPos: [number, number, number] = [
            rb.center[0] + 0.5,
            rb.center[1] + dist * 0.35,
            rb.center[2] + dist * 0.95,
          ];
          const camTarget: [number, number, number] = [
            rb.center[0],
            rb.center[1] - 0.2,
            rb.center[2],
          ];
          setOverviewCam({ position: camPos, target: camTarget });
        }

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
        console.warn("Could not load anchors.json:", err);
      });
  }, []);

  const onTransitionComplete = useCallback((reachedState: "overview" | "section") => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setNavState(reachedState);
    if (reachedState === "section") {
      setHighlightedObject(currentSection.objectName);
    } else {
      setHighlightedObject(null);
    }
  }, [currentSection]);

  const startTransition = useCallback((nextState: "overview" | "section") => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    setNavState("transitioning");

    // Safety fallback: if GSAP onComplete doesn't fire within 2.4s, forcefully settle
    transitionTimerRef.current = setTimeout(() => {
      onTransitionComplete(nextState);
    }, 2400);
  }, [onTransitionComplete]);

  const goTo = useCallback(
    (sectionIdOrIndex: string | number) => {
      let targetIndex = 0;
      if (typeof sectionIdOrIndex === "number") {
        targetIndex = Math.max(0, Math.min(sectionIdOrIndex, totalSections - 1));
      } else {
        const found = sections.findIndex((s) => s.id === sectionIdOrIndex);
        if (found !== -1) targetIndex = found;
      }

      setIsMenuOpen(false);
      setIsGoingOverview(false);
      setCurrentSectionIndex(targetIndex);
      startTransition("section");
    },
    [sections, totalSections, startTransition]
  );

  const home = useCallback(() => {
    setIsMenuOpen(false);
    setIsGoingOverview(true);
    setHighlightedObject(null);
    startTransition("overview");
  }, [startTransition]);

  const next = useCallback(() => {
    if (navState === "transitioning") return;
    if (navState === "overview") {
      goTo(0);
      return;
    }
    if (currentSectionIndex >= totalSections - 1) {
      home();
      return;
    }
    goTo(currentSectionIndex + 1);
  }, [navState, currentSectionIndex, totalSections, goTo, home]);

  const back = useCallback(() => {
    if (navState === "transitioning") return;
    if (navState === "overview") {
      return;
    }
    if (currentSectionIndex <= 0) {
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
    isGoingOverview,
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
