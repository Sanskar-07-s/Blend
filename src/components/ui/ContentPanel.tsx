import React, { useState, useEffect } from "react";
import type { SectionItem } from "../../data/sections";
import type { QualityTier } from "../../config/quality";
import { ArrowRight, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { getActivePalette } from "../../config/palette";

interface ContentPanelProps {
  section: SectionItem;
  onNext: () => void;
  tier?: QualityTier;
  onExitStudio?: () => void;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  section,
  onNext,
  onExitStudio,
}) => {
  const palette = getActivePalette();
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPhone = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth <= 1024;
  const isRight = section.preferredSide === "left";

  if (isPhone) {
    // Phone Layout: Bottom Sheet with 6px radius, solid panel, left-aligned
    return (
      <div
        className="solid-panel panel-animate"
        data-testid="bottom-sheet"
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          left: "max(12px, env(safe-area-inset-left, 12px))",
          right: "max(12px, env(safe-area-inset-right, 12px))",
          maxHeight: isCollapsed ? "54px" : "42dvh",
          backgroundColor: "rgba(23, 26, 31, 0.94)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "6px",
          zIndex: 40,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
          transition: "max-height 0.25s ease",
          overflow: "hidden",
        }}
      >
        {/* Header bar / Collapse toggle */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand section details" : "Collapse section details"}
          style={{
            width: "100%",
            minHeight: "48px",
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            cursor: "pointer",
            color: palette.text,
            textAlign: "left",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className="mono-font"
              style={{
                fontSize: "12px",
                color: palette.accent,
                fontWeight: 500,
              }}
            >
              {section.badge}
            </span>
            <span
              className="heading-font"
              style={{
                fontSize: "16px",
                color: palette.text,
              }}
            >
              {section.title}
            </span>
            {section.isPlaceholder && (
              <span className="placeholder-tag">Placeholder</span>
            )}
          </div>

          <div style={{ color: palette.textMuted }}>
            {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Scrollable details body */}
        {!isCollapsed && (
          <div
            style={{
              padding: "4px 16px 16px 16px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                color: palette.textMuted,
              }}
            >
              {section.description}
            </p>

            {section.cards && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      padding: "10px 12px",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: palette.text }}>
                        {card.title}
                      </span>
                      {card.tag && (
                        <span
                          className="mono-font"
                          style={{
                            fontSize: "10px",
                            padding: "2px 5px",
                            borderRadius: "3px",
                            background: "rgba(255, 255, 255, 0.06)",
                            color: palette.textMuted,
                          }}
                        >
                          {card.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: palette.textMuted, marginTop: "4px", lineHeight: 1.5 }}>
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button
                onClick={onNext}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                <span>{section.ctaText ?? "Next"}</span>
                <ArrowRight size={14} />
              </button>

              {section.id === "join" && onExitStudio && (
                <button
                  id="exit-studio-mobile-btn"
                  data-testid="exit-studio-btn"
                  onClick={onExitStudio}
                  aria-label="Exit Studio to Club Site"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  <span>Exit studio</span>
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tablet & Desktop Layout
  return (
    <div
      className="solid-panel panel-animate"
      data-testid="side-panel"
      style={{
        position: "fixed",
        top: "calc(88px + env(safe-area-inset-top, 0px))",
        [isRight ? "right" : "left"]: isTablet ? "24px" : "36px",
        width: isTablet ? "360px" : "400px",
        maxWidth: "calc(100vw - 48px)",
        maxHeight: "calc(100dvh - 180px)",
        overflowY: "auto",
        backgroundColor: "rgba(23, 26, 31, 0.94)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        borderRadius: "6px",
        padding: "24px",
        zIndex: 40,
        pointerEvents: "auto",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Header: Mono section number & placeholder indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span
          className="mono-font"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: palette.accent,
          }}
        >
          {section.badge}
        </span>
        {section.isPlaceholder && (
          <span className="placeholder-tag">Placeholder</span>
        )}
      </div>

      <h2
        className="heading-font"
        style={{
          fontSize: "22px",
          color: palette.text,
          marginBottom: "12px",
        }}
      >
        {section.title}
      </h2>

      <p
        style={{
          fontSize: "15px",
          color: palette.textMuted,
          lineHeight: 1.6,
          marginBottom: "18px",
        }}
      >
        {section.description}
      </p>

      {section.cards && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {section.cards.map((card, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                padding: "10px 14px",
                borderRadius: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: palette.text }}>
                  {card.title}
                </span>
                {card.tag && (
                  <span
                    className="mono-font"
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: "rgba(255, 255, 255, 0.06)",
                      color: palette.textMuted,
                    }}
                  >
                    {card.tag}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "13px", color: palette.textMuted, marginTop: "4px", lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onNext}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          <span>{section.ctaText ?? "Next"}</span>
          <ArrowRight size={14} />
        </button>

        {section.id === "join" && onExitStudio && (
          <button
            id="exit-studio-desktop-btn"
            data-testid="exit-studio-btn"
            onClick={onExitStudio}
            aria-label="Exit Studio to Club Site"
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            <span>Exit studio</span>
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
