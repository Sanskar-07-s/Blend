import React, { useState, useEffect } from "react";
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
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPhone = windowWidth < 640;
  const sectionNumber = String(currentIndex + 1).padStart(2, "0");
  const totalNumber = String(totalSections).padStart(2, "0");

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        pointerEvents: "auto",
        maxWidth: "calc(100vw - 24px)",
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
                width: isActive ? (isPhone ? "14px" : "18px") : "6px",
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

      {/* Slim Glass Navigation Pill with min 44x44px touch targets */}
      <div
        className="glass-panel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: isPhone ? "4px" : "8px",
          padding: isPhone ? "2px 6px" : "4px 12px",
          borderRadius: "9999px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(139, 92, 246, 0.35)",
          background: "rgba(15, 10, 30, 0.8)",
          maxWidth: "100%",
        }}
      >
        {/* BACK Button (min 44x44 touch target) */}
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
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f5f3ff")}
        >
          <ChevronLeft size={isPhone ? 22 : 18} />
        </button>

        {/* Center Label: "03 / 08 PROJECTS" or "STUDIO OVERVIEW" */}
        <div
          style={{
            fontSize: isPhone ? "11px" : "13px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#f5f3ff",
            minWidth: isPhone ? "110px" : "160px",
            textAlign: "center",
            fontFamily: "Orbitron, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "0 4px",
          }}
        >
          {isOverview ? (
            <span style={{ color: "#c084fc" }}>OVERVIEW</span>
          ) : (
            <span>
              <span style={{ color: "#a1a1b5", marginRight: "4px" }}>
                {sectionNumber}/{totalNumber}
              </span>
              <span>{currentSection.title}</span>
            </span>
          )}
        </div>

        {/* NEXT Button (min 44x44 touch target) */}
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
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f5f3ff")}
        >
          <ChevronRight size={isPhone ? 22 : 18} />
        </button>

        <div style={{ width: "1px", height: "16px", background: "rgba(139, 92, 246, 0.3)" }} />

        {/* HOME Button (min 44x44 touch target) */}
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
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = isOverview ? "#c084fc" : "#a1a1b5")}
        >
          <Home size={isPhone ? 18 : 16} />
        </button>
      </div>
    </div>
  );
};
