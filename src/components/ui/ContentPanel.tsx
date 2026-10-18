import React from "react";
import type { SectionItem } from "../../data/sections";
import { ArrowRight } from "lucide-react";

interface ContentPanelProps {
  section: SectionItem;
  onNext: () => void;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ section, onNext }) => {
  // Place on side OPPOSITE the focused object so it never covers it
  // If object is on right, place panel on left; if on left, place panel on right
  const isRight = section.preferredSide === "left";

  return (
    <div
      className="glass-panel thin-brackets panel-animate"
      style={{
        position: "fixed",
        top: "100px",
        [isRight ? "right" : "left"]: "36px",
        maxWidth: "420px",
        width: "calc(100vw - 72px)",
        borderRadius: "12px",
        padding: "24px",
        zIndex: 40,
        pointerEvents: "auto",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.15)",
      }}
    >
      {/* Header: Section number & title */}
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
          fontSize: "20px",
          fontWeight: 800,
          color: "#f5f3ff",
          lineHeight: 1.25,
          marginBottom: "8px",
          letterSpacing: "0.04em",
        }}
      >
        {section.title}
      </h2>

      {/* 2-3 Short paragraphs or cards (Max ~120 words total) */}
      <p
        style={{
          fontSize: "15px",
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

      {/* Single minimal action button */}
      <button
        onClick={onNext}
        aria-label={section.ctaText ?? "Continue to next section"}
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.95))",
          border: "1px solid #c084fc",
          borderRadius: "6px",
          color: "#ffffff",
          padding: "8px 16px",
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
