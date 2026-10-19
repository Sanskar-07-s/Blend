import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface IntroOverlayProps {
  onSkip: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onSkip }) => {
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadedOut(true);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 0.0-1.0s Intro Sequence: Near-black overlay with center neon line */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#2b2a2eff",
          opacity: fadedOut ? 0 : 0.95,
          transition: "opacity 0.35s ease-out",
          pointerEvents: "none",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Thin neon line drawing across the center */}
        <div
          className="intro-neon-line"
          style={{
            width: "60vw",
            maxWidth: "700px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #a855f7, #ec4899, #38bdf8, transparent)",
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.8), 0 0 24px rgba(236, 72, 153, 0.4)",
            borderRadius: "1px",
            animation: "drawCenterNeonLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      </div>

      {/* Top-Right SKIP Button - Always Available */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "32px",
          zIndex: 60,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={onSkip}
          aria-label="Skip Studio Introduction"
          className="glass-panel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            color: "#f5f3ff",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "Orbitron, sans-serif",
            cursor: "pointer",
            letterSpacing: "0.08em",
            boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            background: "rgba(15, 10, 30, 0.92)",
          }}
        >
          <span>SKIP INTRO</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        @keyframes drawCenterNeonLine {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
