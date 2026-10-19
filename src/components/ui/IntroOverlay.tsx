import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getActivePalette } from "../../config/palette";

interface IntroOverlayProps {
  onSkip: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onSkip }) => {
  const palette = getActivePalette();
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadedOut(true);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 0.0-1.0s Intro Sequence: Clean dark overlay with subtle center accent line */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: palette.background,
          opacity: fadedOut ? 0 : 0.98,
          transition: "opacity 0.35s ease-out",
          pointerEvents: "none",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Thin accent line drawing across the center */}
        <div
          style={{
            width: "50vw",
            maxWidth: "600px",
            height: "1.5px",
            background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
            borderRadius: "1px",
            animation: "drawCenterLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      </div>

      {/* Top-Right Skip Button */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "24px",
          zIndex: 60,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={onSkip}
          aria-label="Skip Studio Introduction"
          className="btn-secondary"
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            backgroundColor: "rgba(23, 26, 31, 0.94)",
          }}
        >
          <span>Skip intro</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <style>{`
        @keyframes drawCenterLine {
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
