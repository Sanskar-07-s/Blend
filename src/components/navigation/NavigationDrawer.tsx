import React from "react";
import { X, ChevronRight } from "lucide-react";
import type { SectionItem } from "../../data/sections";

import type { QualityPreference, QualityTier } from "../../config/quality";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionItem[];
  currentIndex: number;
  onSelectSection: (index: number) => void;
  preference?: QualityPreference;
  activeTier?: QualityTier;
  onChangePreference?: (pref: QualityPreference) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  sections,
  currentIndex,
  onSelectSection,
  preference = "auto",
  activeTier = "medium",
  onChangePreference,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 3, 10, 0.65)",
        backdropFilter: "blur(8px)",
        zIndex: 90,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "360px",
          height: "100%",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          borderLeft: "1px solid rgba(139, 92, 246, 0.35)",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.8)",
          transform: "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="font-orbitron" style={{ fontSize: "16px", color: "#f5f3ff", fontWeight: 800 }}>
              SECTIONS
            </h3>
            <span style={{ fontSize: "12px", color: "#a1a1b5" }}>8 Spatial Waypoints</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu drawer"
            style={{
              background: "transparent",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "#f5f3ff",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 8 Sections List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1 }}>
          {sections.map((sec, idx) => {
            const isActive = idx === currentIndex;
            const num = String(idx + 1).padStart(2, "0");

            return (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectSection(idx);
                  onClose();
                }}
                aria-label={`Go to section ${num} ${sec.title}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: isActive
                    ? "rgba(139, 92, 246, 0.25)"
                    : "rgba(15, 10, 30, 0.45)",
                  border: `1px solid ${isActive ? "#c084fc" : "rgba(139, 92, 246, 0.15)"}`,
                  boxShadow: isActive ? "0 0 16px rgba(139, 92, 246, 0.3)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    className="font-orbitron"
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: isActive ? "#c084fc" : "#a1a1b5",
                    }}
                  >
                    {num}
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: isActive ? "#ffffff" : "#f5f3ff" }}>
                      {sec.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#a1a1b5" }}>
                      {sec.objectName}
                    </div>
                  </div>
                </div>

                <ChevronRight size={16} color={isActive ? "#c084fc" : "#a1a1b5"} />
              </button>
            );
          })}
        </div>

        {/* Quality Controls */}
        <div style={{ borderTop: "1px solid rgba(139, 92, 246, 0.2)", paddingTop: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "#f5f3ff" }}>
              GRAPHICS QUALITY
            </span>
            <span style={{ fontSize: "10px", color: "#c084fc", fontWeight: 600 }}>
              TIER: {activeTier.toUpperCase()}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px",
            }}
          >
            {(["auto", "low", "medium", "high"] as const).map((mode) => {
              const isSelected = preference === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onChangePreference?.(mode)}
                  aria-label={`Set graphics quality to ${mode}`}
                  style={{
                    minHeight: "36px",
                    padding: "6px 4px",
                    borderRadius: "6px",
                    background: isSelected ? "rgba(139, 92, 246, 0.35)" : "rgba(15, 10, 30, 0.5)",
                    border: `1px solid ${isSelected ? "#c084fc" : "rgba(139, 92, 246, 0.2)"}`,
                    color: isSelected ? "#ffffff" : "#a1a1b5",
                    fontSize: "11px",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    transition: "all 0.2s ease",
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "#a1a1b5", borderTop: "1px solid rgba(139, 92, 246, 0.2)", paddingTop: "12px" }}>
          [Esc] to dismiss drawer • [G] to toggle debug 3D bboxes
        </div>
      </div>
    </div>
  );
};
