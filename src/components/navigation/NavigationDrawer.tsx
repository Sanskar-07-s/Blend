import React from "react";
import { X, ChevronRight } from "lucide-react";
import type { SectionItem } from "../../data/sections";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionItem[];
  currentIndex: number;
  onSelectSection: (index: number) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  sections,
  currentIndex,
  onSelectSection,
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

        <div style={{ fontSize: "11px", color: "#a1a1b5", borderTop: "1px solid rgba(139, 92, 246, 0.2)", paddingTop: "12px" }}>
          [Esc] to dismiss drawer • [G] to toggle debug 3D bboxes
        </div>
      </div>
    </div>
  );
};
