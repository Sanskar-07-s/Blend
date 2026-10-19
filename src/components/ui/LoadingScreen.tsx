import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { Link } from "react-router-dom";
import { getActivePalette } from "../../config/palette";

interface LoadingScreenProps {
  onEnter: () => void;
  isReadyToEnter?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onEnter,
  isReadyToEnter = false,
}) => {
  const palette = getActivePalette();
  const { progress: realProgress } = useProgress();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const isReady = isReadyToEnter || minTimePassed || (realProgress >= 100);
  const displayProgress = Math.round(isReady ? 100 : Math.max(realProgress || 0, 15));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: palette.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Title */}
        <h1
          className="heading-font"
          style={{
            fontSize: "26px",
            color: palette.text,
            letterSpacing: "-0.01em",
          }}
        >
          Blender Club
        </h1>

        {/* Thin Progress Line */}
        <div
          style={{
            width: "200px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${displayProgress}%`,
              height: "100%",
              background: palette.accent,
              transition: "width 0.15s ease",
            }}
          />
        </div>

        <div
          className="mono-font"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "200px",
            fontSize: "11px",
            color: palette.textMuted,
          }}
        >
          <span>{isReady ? "Ready" : "Loading"}</span>
          <span>{displayProgress}%</span>
        </div>

        {/* Enter Button: Always in DOM */}
        <button
          id="enter-studio-btn"
          data-testid="enter-button"
          onClick={onEnter}
          aria-label="Enter Studio"
          className="btn-primary"
          style={{
            marginTop: "8px",
            padding: "10px 32px",
            fontSize: "14px",
            opacity: isReady ? 1 : 0.6,
            transition: "opacity 0.2s ease",
          }}
        >
          Enter
        </button>

        {/* Skip to club site link */}
        <Link
          to="/club"
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: palette.textMuted,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = palette.text;
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.20)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = palette.textMuted;
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          Skip to site →
        </Link>
      </div>
    </div>
  );
};
