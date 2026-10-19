import React from "react";
import { useProgress } from "@react-three/drei";
import { Link } from "react-router-dom";

interface LoadingScreenProps {
  onEnter: () => void;
  isReadyToEnter?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onEnter,
  isReadyToEnter = false,
}) => {
  const { progress: realProgress } = useProgress();
  const displayProgress = Math.round(isReadyToEnter ? 100 : Math.max(realProgress || 0, 5));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#05030a",
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
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Centered Wordmark with Glowing Dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#c084fc",
              boxShadow: "0 0 16px #8b5cf6, 0 0 32px #c084fc",
            }}
          />
          <h1
            className="font-orbitron"
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#f5f3ff",
            }}
          >
            BLENDER CLUB
          </h1>
        </div>

        {/* Thin Progress Line */}
        <div
          style={{
            width: "220px",
            height: "2px",
            background: "rgba(124, 58, 237, 0.2)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${displayProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
              boxShadow: "0 0 10px #A78BFA",
              transition: "width 0.15s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: "220px", fontSize: "11px", color: "#A8A3C7", fontFamily: "Orbitron, sans-serif" }}>
          <span>{isReadyToEnter ? "READY" : "LOADING ASSETS"}</span>
          <span>{displayProgress}%</span>
        </div>

        {/* ENTER Button: Only enabled when quality tier is final and prewarming complete */}
        {isReadyToEnter && (
          <button
            id="enter-studio-btn"
            data-testid="enter-button"
            onClick={onEnter}
            aria-label="Enter Studio"
            style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(167, 139, 250, 0.3))",
              border: "1px solid rgba(192, 132, 252, 0.6)",
              borderRadius: "6px",
              color: "#F5F3FF",
              padding: "10px 28px",
              fontSize: "13px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(124, 58, 237, 0.4)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c084fc";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(192, 132, 252, 0.7)";
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.6)";
              e.currentTarget.style.boxShadow = "0 0 24px rgba(124, 58, 237, 0.4)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(167, 139, 250, 0.3))";
            }}
          >
            ENTER
          </button>
        )}

        {/* Persistent Skip to site link */}
        <Link
          to="/club"
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#A8A3C7",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(167, 139, 250, 0.2)",
            background: "rgba(20, 16, 42, 0.4)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F5F3FF";
            e.currentTarget.style.borderColor = "#A78BFA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#A8A3C7";
            e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.2)";
          }}
        >
          Skip to site →
        </Link>
      </div>
    </div>
  );
};
