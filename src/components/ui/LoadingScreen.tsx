import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  onEnter: () => void;
  isReadyToEnter?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onEnter,
  isReadyToEnter = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

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
              width: `${isReadyToEnter ? 100 : Math.min(progress, 90)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
              boxShadow: "0 0 10px #A78BFA",
              transition: "width 0.15s ease",
            }}
          />
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
              background: "transparent",
              border: "1px solid rgba(124, 58, 237, 0.5)",
              borderRadius: "6px",
              color: "#F5F3FF",
              padding: "10px 24px",
              fontSize: "13px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.35)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c084fc";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(192, 132, 252, 0.7)";
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#8b5cf6";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.4)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            ENTER
          </button>
        )}
      </div>
    </div>
  );
};
