import React from "react";
import { Menu } from "lucide-react";

interface HeaderNavProps {
  onOpenMenu: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenMenu }) => {
  return (
    <header
      style={{
        position: "fixed",
        top: "24px",
        left: "32px",
        right: "32px",
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Top-Left: Small "BLENDER CLUB" wordmark with a tiny glowing purple dot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "auto",
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

      {/* Top-Right: Minimal MENU button (icon + label) */}
      <button
        onClick={onOpenMenu}
        aria-label="Open navigation drawer"
        className="glass-panel"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 14px",
          borderRadius: "8px",
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
        <Menu size={15} />
        <span>MENU</span>
      </button>
    </header>
  );
};
