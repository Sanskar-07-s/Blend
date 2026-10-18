import React from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import type { SectionItem } from "../../data/sections";

interface NavigationPillProps {
  currentIndex: number;
  totalSections: number;
  currentSection: SectionItem;
  isOverview: boolean;
  onNext: () => void;
  onPrev: () => void;
  onHome: () => void;
  onSelectIndex: (index: number) => void;
}

export const NavigationPill: React.FC<NavigationPillProps> = ({
  currentIndex,
  totalSections,
  currentSection,
  isOverview,
  onNext,
  onPrev,
  onHome,
  onSelectIndex,
}) => {
  const sectionNumber = String(currentIndex + 1).padStart(2, "0");
  const totalNumber = String(totalSections).padStart(2, "0");

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        pointerEvents: "auto",
      }}
    >
      {/* 8 Progress Dots */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {Array.from({ length: totalSections }).map((_, idx) => {
          const isActive = !isOverview && idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              aria-label={`Jump to section ${idx + 1}`}
              style={{
                width: isActive ? "16px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: isActive ? "#c084fc" : "rgba(161, 161, 181, 0.35)",
                boxShadow: isActive ? "0 0 8px #8b5cf6" : "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s ease",
              }}
            />
          );
        })}
      </div>

      {/* Slim Glass Navigation Pill */}
      <div
        className="glass-panel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "6px 14px",
          borderRadius: "9999px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* BACK Button */}
        <button
          onClick={onPrev}
          aria-label="Previous Section"
          style={{
            background: "transparent",
            border: "none",
            color: "#f5f3ff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f5f3ff")}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center Label: "03 / 08 PROJECTS" or "STUDIO OVERVIEW" */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#f5f3ff",
            minWidth: "160px",
            textAlign: "center",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          {isOverview ? (
            <span style={{ color: "#c084fc" }}>STUDIO OVERVIEW</span>
          ) : (
            <span>
              <span style={{ color: "#a1a1b5", marginRight: "6px" }}>
                {sectionNumber} / {totalNumber}
              </span>
              <span>{currentSection.title}</span>
            </span>
          )}
        </div>

        {/* NEXT Button */}
        <button
          onClick={onNext}
          aria-label="Next Section"
          style={{
            background: "transparent",
            border: "none",
            color: "#f5f3ff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f5f3ff")}
        >
          <ChevronRight size={18} />
        </button>

        <div style={{ width: "1px", height: "16px", background: "rgba(139, 92, 246, 0.3)" }} />

        {/* HOME Button */}
        <button
          onClick={onHome}
          aria-label="Return to Studio Overview"
          style={{
            background: isOverview ? "rgba(139, 92, 246, 0.3)" : "transparent",
            border: "none",
            color: isOverview ? "#c084fc" : "#a1a1b5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = isOverview ? "#c084fc" : "#a1a1b5")}
        >
          <Home size={16} />
        </button>
      </div>
    </div>
  );
};
