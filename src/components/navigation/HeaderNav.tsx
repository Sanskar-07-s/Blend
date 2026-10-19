import React, { useState, useEffect } from "react";
import { Menu, Home } from "lucide-react";
import { getActivePalette } from "../../config/palette";

interface HeaderNavProps {
  onOpenMenu: () => void;
  onHome?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenMenu, onHome }) => {
  const palette = getActivePalette();
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
      {/* Top-Left: Home icon or Wordmark */}
      {isPhone ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "auto" }}>
          <button
            onClick={onHome}
            aria-label="Return to Studio Overview"
            className="solid-panel"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              color: palette.text,
              cursor: "pointer",
            }}
          >
            <Home size={18} />
          </button>
          <span
            className="heading-font"
            style={{
              fontSize: "14px",
              color: palette.text,
            }}
          >
            Blender Club
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
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: palette.accent,
            }}
          />
          <span
            className="heading-font"
            style={{
              fontSize: "16px",
              color: palette.text,
            }}
          >
            Blender Club
          </span>
        </div>
      )}

      {/* Top-Right Menu button */}
      <button
        onClick={onOpenMenu}
        aria-label="Open navigation drawer"
        className="solid-panel"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          height: "38px",
          padding: isPhone ? "0 12px" : "0 16px",
          borderRadius: "6px",
          color: palette.text,
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: "'Instrument Sans', sans-serif",
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(35, 39, 47, 0.96)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(23, 26, 31, 0.94)";
        }}
      >
        <Menu size={16} />
        {!isPhone && <span>Menu</span>}
      </button>
    </header>
  );
};
