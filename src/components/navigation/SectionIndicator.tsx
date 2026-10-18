import React from "react";
import { SECTIONS } from "../../data/sections";

interface SectionIndicatorProps {
  currentIndex: number;
  total: number;
  onSelectIndex: (index: number) => void;
}

export const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  currentIndex,
  total,
  onSelectIndex,
}) => {
  const currentFormatted = String(currentIndex + 1).padStart(2, "0");
  const totalFormatted = String(total).padStart(2, "0");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "rgba(10, 6, 22, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(168, 85, 247, 0.25)",
        padding: "6px 14px",
        borderRadius: "6px",
      }}
    >
      {/* 01 / 08 counter */}
      <div
        className="font-orbitron"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#e2e8f0",
        }}
      >
        <span style={{ color: "#c084fc", fontSize: "16px" }}>{currentFormatted}</span>
        <span style={{ color: "#64748b", fontSize: "12px" }}>/</span>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>{totalFormatted}</span>
      </div>

      {/* Cyber Progress Indicator Dots */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {SECTIONS.map((sec, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectIndex(idx)}
              aria-label={`Jump to ${sec.title}`}
              style={{
                width: isActive ? "24px" : "8px",
                height: "6px",
                borderRadius: "3px",
                background: isActive
                  ? "linear-gradient(90deg, #a855f7, #c084fc)"
                  : "rgba(148, 163, 184, 0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isActive ? "0 0 10px rgba(168, 85, 247, 0.6)" : "none",
              }}
              title={sec.title}
            />
          );
        })}
      </div>
    </div>
  );
};
