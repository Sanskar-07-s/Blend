import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { SectionItem } from "../../data/sections";
import { getActivePalette } from "../../config/palette";

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
  const sectionNumber = String(currentIndex + 1).padStart(2, "0");
  const totalNumber = String(totalSections).padStart(2, "0");

  return (
    <nav
      aria-label="Room Navigation"
      style={{
        position: "fixed",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        pointerEvents: "auto",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {/* Flat Bottom Navigation Bar */}
      <div
        className="solid-panel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: isPhone ? "6px" : "12px",
          padding: isPhone ? "6px 10px" : "8px 16px",
          background: "rgba(23, 26, 31, 0.94)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "6px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          maxWidth: "100%",
        }}
      >
        {/* BACK Text Button */}
        <button
          onClick={onPrev}
          aria-label="Previous Section"
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: palette.text,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            height: "36px",
            padding: "0 12px",
            borderRadius: "4px",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            transition: "background 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ChevronLeft size={16} />
          {!isPhone && <span>Back</span>}
        </button>

        {/* Small Navigation Dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "0 4px",
          }}
        >
          {Array.from({ length: totalSections }).map((_, idx) => {
            const isActive = !isOverview && idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectIndex(idx)}
                aria-label={`Jump to section ${idx + 1}`}
                style={{
                  width: isActive ? "8px" : "5px",
                  height: "5px",
                  borderRadius: "2px",
                  background: isActive ? palette.accent : "rgba(255, 255, 255, 0.20)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}
        </div>

        {/* Section Counter & Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 6px",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "13px",
            color: palette.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: isPhone ? "130px" : "220px",
          }}
        >
          {isOverview ? (
            <span style={{ color: palette.textMuted }}>Overview</span>
          ) : (
            <>
              <span
                className="mono-font"
                style={{
                  color: palette.accent,
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {sectionNumber} / {totalNumber}
              </span>
              <span style={{ color: palette.text, fontWeight: 500 }}>
                {currentSection.title}
              </span>
            </>
          )}
        </div>

        {/* NEXT Text Button */}
        <button
          onClick={onNext}
          aria-label="Next Section"
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: palette.text,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            height: "36px",
            padding: "0 12px",
            borderRadius: "4px",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            transition: "background 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {!isPhone && <span>Next</span>}
          <ChevronRight size={16} />
        </button>

        <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.12)" }} />

        {/* Overview Button */}
        <button
          onClick={onHome}
          aria-label="Return to Studio Overview"
          title="Return to Overview"
          style={{
            background: isOverview ? "rgba(255, 255, 255, 0.08)" : "transparent",
            border: "none",
            color: isOverview ? palette.accent : palette.textMuted,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "4px",
            transition: "color 0.15s ease, background 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = palette.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = isOverview ? palette.accent : palette.textMuted)}
        >
          <LayoutGrid size={16} />
        </button>
      </div>
    </nav>
  );
};
