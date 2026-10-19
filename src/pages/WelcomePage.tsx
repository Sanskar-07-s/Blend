import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { detectDeviceTier, QualityTier } from "../config/quality";
import { getActivePalette } from "../config/palette";
import { MODEL_MANIFEST } from "../config/models";
import { ArrowRight, Compass } from "lucide-react";

const WelcomeHeroCanvas = React.lazy(() => import("../components/welcome/WelcomeHeroCanvas"));

export const WelcomePage: React.FC = () => {
  const palette = getActivePalette();
  const navigate = useNavigate();
  const [tier, setTier] = useState<QualityTier>(() => {
    if (typeof window !== "undefined") {
      const isMobile = Math.min(window.innerWidth, window.innerHeight) < 640 || /android|iphone|ipad|mobile/i.test(navigator.userAgent || "");
      if (isMobile) return "low";
    }
    return "medium";
  });
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.title = "Blender Club — 3D Studio";
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    detectDeviceTier().then((detected) => setTier(detected));

    // Prefetch /experience and room.glb on non-mobile desktop connections when idle
    let prefetchTimeout: NodeJS.Timeout | null = null;
    const nav = navigator as any;
    const isSaveData = nav.connection?.saveData === true;
    const isSlow = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";
    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || ("ontouchstart" in window && nav.maxTouchPoints > 0));

    if (!isSaveData && !isSlow && !isMobileDevice) {
      prefetchTimeout = setTimeout(() => {
        import("./ExperiencePage").catch(() => {});
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "fetch";
        link.href = MODEL_MANIFEST.room;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }, 3000);
    }

    return () => {
      if (prefetchTimeout) clearTimeout(prefetchTimeout);
    };
  }, []);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);

    if (reducedMotion) {
      navigate("/experience");
      return;
    }

    setTimeout(() => {
      navigate("/experience");
    }, 700);
  };

  const isLowTier = tier === "low";

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: palette.background,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Radial Lift */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70vw",
          height: "70vw",
          maxWidth: "800px",
          maxHeight: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.backgroundCenter} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 3D Canvas Hero or CSS 2D Fallback for Low Tier */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {!isLowTier ? (
          <Suspense fallback={null}>
            <WelcomeHeroCanvas isExiting={isExiting} tier={tier} />
          </Suspense>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: `2px solid ${palette.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isExiting ? 0 : 0.8,
              transition: "opacity 0.6s ease",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `1px dashed ${palette.accentSoft}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Header bar */}
      <header
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: palette.accent,
            }}
          />
          <span
            className="heading-font"
            style={{
              fontSize: "15px",
              color: palette.text,
            }}
          >
            Blender Club
          </span>
        </div>

        <Link
          to="/club"
          id="welcome-skip-to-site"
          aria-label="Skip 3D studio and go directly to main club site"
          className="btn-secondary"
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            backgroundColor: "rgba(23, 26, 31, 0.8)",
          }}
        >
          <Compass size={14} />
          <span>Skip to site</span>
        </Link>
      </header>

      {/* Center Content: Title & Interactive Controls */}
      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <span
          className="mono-font"
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: palette.accent,
          }}
        >
          Collegiate 3D studio
        </span>

        <h1
          className="heading-font"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
            color: palette.text,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Blender Club
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: palette.textMuted,
            margin: 0,
            maxWidth: "480px",
          }}
        >
          A community of student 3D artists, animators, and technical creators exploring digital design in Blender.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button
            onClick={handleEnter}
            id="welcome-enter-btn"
            aria-label="Enter the 3D Studio Experience"
            className="btn-primary"
            style={{
              padding: "12px 28px",
              fontSize: "15px",
            }}
          >
            <span>Enter studio</span>
            <ArrowRight size={16} />
          </button>

          <Link
            to="/club"
            id="welcome-explore-site-btn"
            className="btn-secondary"
            style={{
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            Explore club site
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: palette.textMuted,
          zIndex: 10,
        }}
      >
        <span className="mono-font">Three.js + Blender PBR</span>
        <span className="mono-font">Scroll to explore</span>
      </footer>

      {/* Exit crossfade */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: palette.background,
          opacity: isExiting ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />
    </main>
  );
};
