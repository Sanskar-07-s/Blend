import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + 15;
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
            background: "rgba(139, 92, 246, 0.2)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #c084fc)",
              boxShadow: "0 0 10px #c084fc",
              transition: "width 0.15s ease",
            }}
          />
        </div>

        {/* ENTER Button */}
        {isReady && (
          <button
            onClick={onEnter}
            aria-label="Enter Studio"
            style={{
              marginTop: "8px",
              background: "transparent",
              border: "1px solid #8b5cf6",
              borderRadius: "6px",
              color: "#f5f3ff",
              padding: "10px 24px",
              fontSize: "13px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
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
