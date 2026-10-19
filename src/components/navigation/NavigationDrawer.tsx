import React from "react";
import { X, ChevronRight, ArrowRight } from "lucide-react";
import type { SectionItem } from "../../data/sections";
import type { QualityPreference, QualityTier } from "../../config/quality";
import { getActivePalette } from "../../config/palette";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionItem[];
  currentIndex: number;
  onSelectSection: (index: number) => void;
  preference?: QualityPreference;
  activeTier?: QualityTier;
  onChangePreference?: (pref: QualityPreference) => void;
  onExitStudio?: () => void;
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
  onExitStudio,
}) => {
  const palette = getActivePalette();
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 90,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="solid-panel"
        style={{
          width: "100%",
          maxWidth: "360px",
          height: "100%",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "rgba(23, 26, 31, 0.98)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: 0,
          boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="heading-font" style={{ fontSize: "18px", color: palette.text }}>
              Sections
            </h3>
            <span style={{ fontSize: "13px", color: palette.textMuted }}>Room overview</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu drawer"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              color: palette.text,
              borderRadius: "4px",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flex: 1 }}>
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
                  padding: "10px 12px",
                  borderRadius: "4px",
                  background: isActive
                    ? "rgba(255, 255, 255, 0.08)"
                    : "transparent",
                  border: `1px solid ${isActive ? palette.hairline : "transparent"}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    className="mono-font"
                    style={{
                      fontSize: "12px",
                      color: isActive ? palette.accent : palette.textMuted,
                      fontWeight: 500,
                    }}
                  >
                    {num}
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: isActive ? palette.text : palette.textMuted }}>
                      {sec.title}
                    </div>
                  </div>
                </div>

                <ChevronRight size={15} color={isActive ? palette.accent : palette.textMuted} />
              </button>
            );
          })}
        </div>

        {/* Exit to Site Action */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => {
              onClose();
              if (onExitStudio) {
                onExitStudio();
              } else {
                window.location.href = "/club";
              }
            }}
            aria-label="Exit to Club Site"
            className="btn-secondary"
            style={{
              justifyContent: "space-between",
              width: "100%",
              padding: "10px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: palette.text }}>
                Exit to club site
              </span>
            </div>
            <ArrowRight size={15} color={palette.textMuted} />
          </button>
        </div>

        {/* Quality Controls */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.10)", paddingTop: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: palette.text }}>
              Graphics quality
            </span>
            <span className="mono-font" style={{ fontSize: "11px", color: palette.accent }}>
              {activeTier}
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
                    minHeight: "34px",
                    padding: "4px",
                    borderRadius: "4px",
                    background: isSelected ? palette.accent : "rgba(255, 255, 255, 0.05)",
                    border: "none",
                    color: isSelected ? "#0F1115" : palette.textMuted,
                    fontSize: "12px",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mono-font" style={{ fontSize: "11px", color: palette.textMuted, borderTop: "1px solid rgba(255, 255, 255, 0.10)", paddingTop: "10px" }}>
          Esc to close drawer
        </div>
      </div>
    </div>
  );
};
