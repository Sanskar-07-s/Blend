import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import { useSceneNavigation } from "./hooks/useSceneNavigation";
import { HeaderNav } from "./components/navigation/HeaderNav";
import { NavigationPill } from "./components/navigation/NavigationPill";
import { NavigationDrawer } from "./components/navigation/NavigationDrawer";
import { ContentPanel } from "./components/ui/ContentPanel";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { IntroOverlay } from "./components/ui/IntroOverlay";
import { Fallback2D } from "./components/ui/Fallback2D";
import {
  detectDeviceTier,
  getStoredPreference,
  setStoredPreference,
  injectModelPreload,
  isWebGLAvailable,
  TIER_CONFIG,
  type QualityTier,
  type QualityPreference,
} from "./config/quality";

const ClubRoomScene = lazy(() => import("./scenes/ClubRoomScene"));

export function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPrewarmed, setIsPrewarmed] = useState(false);
  const [isTierReady, setIsTierReady] = useState(false);
  const [webGlSupported] = useState(() => isWebGLAvailable());

  // Quality Tier State
  const [preference, setPreference] = useState<QualityPreference>(() => getStoredPreference());
  const [tier, setTier] = useState<QualityTier>("high");
  const [sceneKey, setSceneKey] = useState(0);

  // Robustness: Context loss & Tab pause
  const [isContextRestoring, setIsContextRestoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const {
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
    goTo,
    next,
    back,
    home,
    toggleMenu,
    onTransitionComplete,
  } = useSceneNavigation();

  // 1. Initial Device Tier Detection & Preload
  useEffect(() => {
    let active = true;
    detectDeviceTier().then((detectedTier) => {
      if (!active) return;
      setTier(detectedTier);
      setIsTierReady(true);
      const config = TIER_CONFIG[detectedTier];
      injectModelPreload(config.modelUrl);

      // Add low-tier CSS class to body if tier is low
      if (detectedTier === "low") {
        document.body.classList.add("tier-low");
      } else {
        document.body.classList.remove("tier-low");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Update body class whenever tier changes
  useEffect(() => {
    if (tier === "low") {
      document.body.classList.add("tier-low");
    } else {
      document.body.classList.remove("tier-low");
    }
  }, [tier]);

  // Handle Quality preference changes from Menu
  const handlePreferenceChange = useCallback((newPref: QualityPreference) => {
    setPreference(newPref);
    setStoredPreference(newPref);

    if (newPref === "auto") {
      detectDeviceTier().then((autoTier) => {
        setTier(autoTier);
        injectModelPreload(TIER_CONFIG[autoTier].modelUrl);
      });
    } else {
      setTier(newPref);
      injectModelPreload(TIER_CONFIG[newPref].modelUrl);
    }
  }, []);

  // Automatic PerformanceMonitor tier degradation
  const handleDegradeTier = useCallback(() => {
    setTier((currentTier) => {
      if (currentTier === "high") {
        console.warn("[PerformanceMonitor] Stepping tier down from HIGH to MEDIUM due to FPS < 45");
        return "medium";
      }
      if (currentTier === "medium") {
        console.warn("[PerformanceMonitor] Stepping tier down from MEDIUM to LOW due to FPS < 45");
        return "low";
      }
      return currentTier;
    });
  }, []);

  // 2. WebGL Context Loss & Restoration Listeners
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("[WebGL] Context lost detected. Attempting restoration...");
      setIsContextRestoring(true);
    };

    const handleContextRestored = () => {
      console.log("[WebGL] Context restored cleanly. Reloading 3D scene...");
      setIsContextRestoring(false);
      setSceneKey((k) => k + 1);
    };

    window.addEventListener("webglcontextlost", handleContextLost, false);
    window.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, []);

  // 3. Tab Visibility Change (Pause rendering when backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 4. Touch Gestures: Horizontal Swipe for NEXT/BACK on mobile canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only capture single finger swipe on canvas background
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: performance.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const dt = performance.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    // Must be a decisive horizontal swipe within 450ms
    if (dt < 450 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        // Swipe left -> NEXT
        next();
      } else {
        // Swipe right -> BACK
        back();
      }
    }
  };

  const handlePrewarmComplete = useCallback(() => {
    setIsPrewarmed(true);
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    setNavState("intro");
  };

  const handleSkipIntro = () => {
    setNavState("overview");
  };

  // If WebGL is not available on this device, show lightweight 2D fallback
  if (!webGlSupported) {
    return <Fallback2D />;
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "#05030a",
      }}
    >
      <Suspense fallback={null}>
        <ClubRoomScene
          key={sceneKey}
          navState={navState}
          isGoingOverview={isGoingOverview}
          currentSection={currentSection}
          overviewCamera={overviewCam}
          anchors={anchors}
          highlightedObject={highlightedObject}
          isDebugOpen={isDebugOpen}
          onTransitionComplete={onTransitionComplete}
          onPrewarmComplete={handlePrewarmComplete}
          tier={tier}
          onDegradeTier={handleDegradeTier}
          isPaused={isPaused}
        />
      </Suspense>

      {/* Context Loss Recovery Banner */}
      {isContextRestoring && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(5, 3, 10, 0.92)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "#f5f3ff",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(139, 92, 246, 0.3)",
              borderTopColor: "#c084fc",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span className="font-orbitron" style={{ fontSize: "14px", letterSpacing: "0.08em" }}>
            RESTORING GRAPHICS CONTEXT...
          </span>
        </div>
      )}

      {!hasEntered && (
        <LoadingScreen onEnter={handleEnter} isReadyToEnter={isPrewarmed && isTierReady} />
      )}

      {hasEntered && (
        <>
          <HeaderNav onOpenMenu={toggleMenu} onHome={home} />

          {navState === "intro" && <IntroOverlay onSkip={handleSkipIntro} />}

          {navState === "section" && (
            <ContentPanel section={currentSection} onNext={next} tier={tier} />
          )}

          {navState !== "intro" && (
            <NavigationPill
              currentIndex={currentSectionIndex}
              totalSections={totalSections}
              currentSection={currentSection}
              isOverview={navState === "overview"}
              onNext={next}
              onPrev={back}
              onHome={home}
              onSelectIndex={goTo}
            />
          )}

          <NavigationDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            sections={sections}
            currentIndex={currentSectionIndex}
            onSelectSection={goTo}
            preference={preference}
            activeTier={tier}
            onChangePreference={handlePreferenceChange}
          />
        </>
      )}
    </div>
  );
}

export default App;
