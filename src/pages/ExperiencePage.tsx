import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSceneNavigation } from "../hooks/useSceneNavigation";
import { HeaderNav } from "../components/navigation/HeaderNav";
import { NavigationPill } from "../components/navigation/NavigationPill";
import { NavigationDrawer } from "../components/navigation/NavigationDrawer";
import { ContentPanel } from "../components/ui/ContentPanel";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { IntroOverlay } from "../components/ui/IntroOverlay";
import { Fallback2D } from "../components/ui/Fallback2D";
import {
  detectDeviceTier,
  getStoredPreference,
  setStoredPreference,
  injectModelPreload,
  isWebGLAvailable,
  TIER_CONFIG,
  type QualityTier,
  type QualityPreference,
} from "../config/quality";
import gsap from "gsap";

const ClubRoomScene = lazy(() => import("../scenes/ClubRoomScene"));

export const ExperiencePage: React.FC = () => {
  const navigate = useNavigate();
  const [hasEntered, setHasEntered] = useState(false);
  const [isPrewarmed, setIsPrewarmed] = useState(false);
  const [isTierReady, setIsTierReady] = useState(false);
  const [webGlSupported] = useState(() => isWebGLAvailable());

  // Quality Tier State
  const [preference, setPreference] = useState<QualityPreference>(() => getStoredPreference());
  const [tier, setTier] = useState<QualityTier>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("quality")?.toLowerCase();
      if (q === "low" || q === "medium" || q === "high") return q as QualityTier;
      const pref = getStoredPreference();
      if (pref !== "auto") return pref as QualityTier;
    }
    return "medium";
  });
  const [sceneKey, setSceneKey] = useState(0);

  // Context loss & Tab pause
  const [isContextRestoring, setIsContextRestoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Exit cinematic state
  const [isExiting, setIsExiting] = useState(false);
  const [exitFlash, setExitFlash] = useState(false);
  const [exitOverlayOpacity, setExitOverlayOpacity] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null);

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

  // 1. Lock body scrolling while Experience is mounted
  useEffect(() => {
    document.body.classList.add("experience-lock");
    return () => {
      document.body.classList.remove("experience-lock");
    };
  }, []);

  // 2. Initial Device Tier Detection & Preload
  useEffect(() => {
    let active = true;
    detectDeviceTier().then((detectedTier) => {
      if (!active) return;
      setTier(detectedTier);
      setIsTierReady(true);
      const config = TIER_CONFIG[detectedTier];
      injectModelPreload(config.modelUrl);

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

  useEffect(() => {
    if (tier === "low") {
      document.body.classList.add("tier-low");
    } else {
      document.body.classList.remove("tier-low");
    }
  }, [tier]);

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

  // Context Loss & Restoration
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

  // Tab Visibility Change
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
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

    if (dt < 450 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        next();
      } else {
        back();
      }
    }
  };

  const handlePrewarmComplete = useCallback(() => {
    setIsPrewarmed(true);
  }, []);

  // Safety fallback in case WebGL context loses event or errors: 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPrewarmed(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Enter studio logic with sessionStorage intro tracking
  const handleEnter = () => {
    if (typeof window !== "undefined" && (window as any).__bc) {
      (window as any).__bc.frameTimes = [];
    }
    setHasEntered(true);
    const introSeen = sessionStorage.getItem("bc_intro_seen");
    if (introSeen === "true") {
      setNavState("overview");
    } else {
      setNavState("intro");
      sessionStorage.setItem("bc_intro_seen", "true");
    }
  };

  const handleSkipIntro = () => {
    sessionStorage.setItem("bc_intro_seen", "true");
    setNavState("overview");
  };

  // Exit Studio sequence (about 2.5s cinematic exit -> /club)
  const handleExitStudio = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Reduced motion: a plain 0.5 s crossfade
      gsap.to({ val: 0 }, {
        val: 1,
        duration: 0.5,
        onUpdate: function () {
          setExitOverlayOpacity(this.targets()[0].val);
        },
        onComplete: () => {
          navigate("/club");
        },
      });
      return;
    }

    // Full 2.5s cinematic exit sequence
    // 1. Move camera towards neon sign / portal
    goTo(7); // Jump / orient to neon sign
    const tl = gsap.timeline();
    exitTimelineRef.current = tl;

    // Emissive and flash pulse
    tl.to({}, {
      duration: 0.3,
      onStart: () => setExitFlash(true),
    });
    tl.to({}, {
      duration: 0.4,
      onStart: () => setExitFlash(false),
    });

    // Violet overlay fades in
    tl.to({ val: 0 }, {
      val: 1,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: function () {
        setExitOverlayOpacity(this.targets()[0].val);
      },
    }, "-=0.3");

    // Complete and navigate to /club
    tl.call(() => {
      navigate("/club");
    });
  }, [isExiting, goTo, navigate]);

  // Memory Cleanup on Exit / Unmount
  useEffect(() => {
    return () => {
      // 1. Kill any active GSAP animations
      if (exitTimelineRef.current) {
        exitTimelineRef.current.kill();
      }
      gsap.killTweensOf("*");

      // 2. Traversal and disposal of WebGL Scene & Renderer
      const win = window as any;
      if (win.__scene) {
        win.__scene.traverse((obj: any) => {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat: any) => {
                Object.keys(mat).forEach((prop) => {
                  if (mat[prop] && typeof mat[prop].dispose === "function") {
                    mat[prop].dispose();
                  }
                });
                mat.dispose();
              });
            } else {
              Object.keys(obj.material).forEach((prop) => {
                if (obj.material[prop] && typeof obj.material[prop].dispose === "function") {
                  obj.material[prop].dispose();
                }
              });
              obj.material.dispose();
            }
          }
        });
      }

      if (win.__gl) {
        try {
          win.__gl.dispose();
          win.__gl.forceContextLoss();
        } catch (e) {
          console.warn("[WebGL Cleanup] Warning disposing renderer:", e);
        }
      }

      // Clear debug handles
      win.__gl = null;
      win.__scene = null;
      win.__camera = null;
      if (win.__bc) {
        win.__bc.renderInfo = null;
      }
    };
  }, []);

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

      {/* Exit Sequence Flash and Violet Overlay */}
      {exitFlash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(245, 243, 255, 0.75)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 95,
            transition: "opacity 0.2s ease",
          }}
        />
      )}

      {exitOverlayOpacity > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#7C3AED",
            opacity: exitOverlayOpacity,
            pointerEvents: "none",
            zIndex: 98,
          }}
        />
      )}

      {!hasEntered && (
        <LoadingScreen onEnter={handleEnter} isReadyToEnter={isPrewarmed && isTierReady} />
      )}

      {hasEntered && (
        <>
          <HeaderNav onOpenMenu={toggleMenu} onHome={home} />

          {navState === "intro" && <IntroOverlay onSkip={handleSkipIntro} />}

          {navState === "section" && (
            <ContentPanel
              section={currentSection}
              onNext={next}
              tier={tier}
              onExitStudio={handleExitStudio}
            />
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
            onExitStudio={handleExitStudio}
          />
        </>
      )}
    </div>
  );
};

export default ExperiencePage;
