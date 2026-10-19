import React, { useState, useEffect } from "react";
import type { SectionItem } from "../../data/sections";
import type { QualityTier } from "../../config/quality";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface ContentPanelProps {
  section: SectionItem;
  onNext: () => void;
  tier?: QualityTier;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  section,
  onNext,
  tier = "high",
}) => {
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

  const useBlur = tier === "high";

  // Common panel style
  const panelBackground = useBlur ? "rgba(15, 10, 30, 0.78)" : "rgba(12, 8, 24, 0.96)";
  const panelBackdrop = useBlur ? "blur(12px)" : "none";

  if (isPhone) {
    // Phone Layout: Bottom Sheet (max 40% height, scrollable, drag handle collapses to title bar)
    return (
      <div
        className="glass-panel thin-brackets panel-animate"
        data-testid="bottom-sheet"
        style={{
          position: "fixed",
          bottom: "calc(74px + env(safe-area-inset-bottom, 0px))",
          left: "max(12px, env(safe-area-inset-left, 12px))",
          right: "max(12px, env(safe-area-inset-right, 12px))",
          maxHeight: isCollapsed ? "54px" : "40dvh",
          backgroundColor: panelBackground,
          backdropFilter: panelBackdrop,
          WebkitBackdropFilter: panelBackdrop,
          border: "1px solid rgba(139, 92, 246, 0.35)",
          borderRadius: "14px",
          zIndex: 40,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.15)",
          transition: "max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        {/* Drag handle / Title header bar */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand section details" : "Collapse section details"}
          style={{
            width: "100%",
            minHeight: "44px",
            background: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 16px",
            cursor: "pointer",
            color: "#f5f3ff",
            textAlign: "left",
            flexShrink: 0,
          }}
        >
          {/* Visual pill drag handle */}
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "rgba(192, 132, 252, 0.5)",
              marginBottom: "4px",
            }}
          />

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  color: "#c084fc",
                }}
              >
                {section.badge}
              </span>
              <span
                className="font-orbitron"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#f5f3ff",
                  lineHeight: 1.2,
                }}
              >
                {section.title}
              </span>
            </div>

            <div style={{ color: "#c084fc", display: "flex", alignItems: "center" }}>
              {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </button>

        {/* Scrollable details body */}
        {!isCollapsed && (
          <div
            style={{
              padding: "4px 16px 16px 16px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              flex: 1,
            }}
          >
            <p
              style={{
                fontSize: "clamp(13px, 3.4vw, 14px)",
                color: "#a1a1b5",
                lineHeight: 1.45,
                marginBottom: "12px",
              }}
            >
              {section.description}
            </p>

            {section.cards && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {section.cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(15, 10, 30, 0.45)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#f5f3ff" }}>
                        {card.title}
                      </span>
                      {card.tag && (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: "rgba(139, 92, 246, 0.2)",
                            color: "#c084fc",
                            fontWeight: 700,
                          }}
                        >
                          {card.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "#a1a1b5", marginTop: "2px", lineHeight: 1.3 }}>
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onNext}
              aria-label={section.ctaText ?? "Continue to next section"}
              style={{
                width: "100%",
                minHeight: "44px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(168, 85, 247, 0.95))",
                border: "1px solid #c084fc",
                borderRadius: "8px",
                color: "#ffffff",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Orbitron, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)",
              }}
            >
              <span>{section.ctaText ?? "NEXT SECTION"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Tablet & Desktop Layout
  return (
    <div
      className="glass-panel thin-brackets panel-animate"
      data-testid="side-panel"
      style={{
        position: "fixed",
        top: "calc(88px + env(safe-area-inset-top, 0px))",
        [isRight ? "right" : "left"]: isTablet ? "24px" : "36px",
        width: isTablet ? "360px" : "420px",
        maxWidth: "calc(100vw - 48px)",
        maxHeight: "calc(100dvh - 180px)",
        overflowY: "auto",
        backgroundColor: panelBackground,
        backdropFilter: panelBackdrop,
        WebkitBackdropFilter: panelBackdrop,
        borderRadius: "12px",
        padding: "24px",
        zIndex: 40,
        pointerEvents: "auto",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.15)",
      }}
    >
      {/* Header: Section badge & title */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span
          style={{
            fontSize: "11px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: 700,
            color: "#c084fc",
            letterSpacing: "0.1em",
          }}
        >
          {section.badge}
        </span>
      </div>

      <h2
        className="font-orbitron"
        style={{
          fontSize: "clamp(18px, 2.5vw, 21px)",
          fontWeight: 800,
          color: "#f5f3ff",
          lineHeight: 1.25,
          marginBottom: "8px",
          letterSpacing: "0.04em",
        }}
      >
        {section.title}
      </h2>

      <p
        style={{
          fontSize: "clamp(13px, 1.8vw, 15px)",
          color: "#a1a1b5",
          lineHeight: 1.5,
          marginBottom: "14px",
        }}
      >
        {section.description}
      </p>

      {section.cards && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {section.cards.map((card, i) => (
            <div
              key={i}
              style={{
                background: "rgba(15, 10, 30, 0.45)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#f5f3ff" }}>
                  {card.title}
                </span>
                {card.tag && (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      background: "rgba(139, 92, 246, 0.2)",
                      color: "#c084fc",
                      border: "1px solid rgba(192, 132, 252, 0.3)",
                      fontWeight: 700,
                    }}
                  >
                    {card.tag}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "#a1a1b5", marginTop: "2px", lineHeight: 1.35 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action button with min 44px touch target */}
      <button
        onClick={onNext}
        aria-label={section.ctaText ?? "Continue to next section"}
        style={{
          minHeight: "44px",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.95))",
          border: "1px solid #c084fc",
          borderRadius: "8px",
          color: "#ffffff",
          padding: "10px 18px",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "Orbitron, sans-serif",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 24px rgba(192, 132, 252, 0.7)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 16px rgba(139, 92, 246, 0.4)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span>{section.ctaText ?? "NEXT SECTION"}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
