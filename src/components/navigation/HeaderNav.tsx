import React, { useState, useEffect } from "react";
import { Menu, Home } from "lucide-react";

interface HeaderNavProps {
  onOpenMenu: () => void;
  onHome?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenMenu, onHome }) => {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPhone = windowWidth < 640;

  return (
    <header
      style={{
        position: "fixed",
        top: "calc(16px + env(safe-area-inset-top, 0px))",
        left: "max(16px, env(safe-area-inset-left, 16px))",
        right: "max(16px, env(safe-area-inset-right, 16px))",
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Top-Left: On phone: Home icon button (min 44x44); on desktop: Wordmark */}
      {isPhone ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "auto" }}>
          <button
            onClick={onHome}
            aria-label="Return to Studio Overview"
            className="glass-panel"
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              color: "#f5f3ff",
              background: "rgba(15, 10, 30, 0.7)",
              cursor: "pointer",
            }}
          >
            <Home size={20} />
          </button>
          <span
            className="font-orbitron"
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#f5f3ff",
              letterSpacing: "0.08em",
            }}
          >
            BLENDER CLUB
          </span>
        </div>
      ) : (
        <div
          onClick={onHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "auto",
            cursor: onHome ? "pointer" : "default",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#c084fc",
              boxShadow: "0 0 10px #8b5cf6, 0 0 20px #c084fc",
            }}
          />
          <span
            className="font-orbitron"
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#f5f3ff",
              letterSpacing: "0.1em",
            }}
          >
            BLENDER CLUB
          </span>
        </div>
      )}

      {/* Top-Right: On phone: 44x44 icon button; on desktop: button with text */}
      <button
        onClick={onOpenMenu}
        aria-label="Open navigation drawer"
        className="glass-panel"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minWidth: "44px",
          minHeight: "44px",
          padding: isPhone ? "10px" : "8px 16px",
          borderRadius: isPhone ? "10px" : "8px",
          border: "1px solid rgba(139, 92, 246, 0.35)",
          background: "rgba(15, 10, 30, 0.7)",
          color: "#f5f3ff",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Orbitron, sans-serif",
          cursor: "pointer",
          letterSpacing: "0.06em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#c084fc";
          e.currentTarget.style.boxShadow = "0 0 15px rgba(139, 92, 246, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.35)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Menu size={isPhone ? 20 : 16} />
        {!isPhone && <span>MENU</span>}
      </button>
    </header>
  );
};
