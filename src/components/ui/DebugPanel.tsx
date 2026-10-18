import React from "react";
import type { SectionItem } from "../../data/sections";
import { Terminal, Zap, Sliders } from "lucide-react";

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: SectionItem;
  currentIndex: number;
  isIntroPlaying: boolean;
  onSkipIntro: () => void;
  postProcessingEnabled: boolean;
  onTogglePostProcessing: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  currentSection,
  currentIndex,
  isIntroPlaying,
  onSkipIntro,
  postProcessingEnabled,
  onTogglePostProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "24px",
        width: "320px",
        background: "rgba(6, 3, 14, 0.92)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(168, 85, 247, 0.4)",
        borderRadius: "8px",
        padding: "16px",
        zIndex: 80,
        boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(168, 85, 247, 0.2)",
      }}
      className="font-mono-tech text-xs"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a855f7", fontWeight: 700 }}>
          <Terminal size={14} />
          <span>DEV_DEBUG_CONSOLE</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          [ESC]
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#cbd5e1" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Active Index:</span>
          <span style={{ color: "#c084fc", fontWeight: 700 }}>{currentIndex} ({currentSection.id})</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Anchor Object:</span>
          <span style={{ color: "#38bdf8" }}>{currentSection.objectId}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Cam Pos:</span>
          <span style={{ color: "#e2e8f0" }}>
            [{currentSection.cameraPosition.map(n => n.toFixed(1)).join(", ")}]
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Cam Target:</span>
          <span style={{ color: "#e2e8f0" }}>
            [{currentSection.cameraTarget.map(n => n.toFixed(1)).join(", ")}]
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Intro Sequence:</span>
          <span style={{ color: isIntroPlaying ? "#f59e0b" : "#10b981" }}>
            {isIntroPlaying ? "RUNNING" : "COMPLETED"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px" }}>
        {isIntroPlaying && (
          <button
            onClick={onSkipIntro}
            style={{
              background: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.5)",
              color: "#fbbf24",
              padding: "6px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
            }}
          >
            <Zap size={12} />
            <span>SKIP INTRO ASSEMBLY</span>
          </button>
        )}

        <button
          onClick={onTogglePostProcessing}
          style={{
            background: postProcessingEnabled ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${postProcessingEnabled ? "#a855f7" : "#475569"}`,
            color: postProcessingEnabled ? "#c084fc" : "#94a3b8",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
          }}
        >
          <Sliders size={12} />
          <span>BLOOM / VFX: {postProcessingEnabled ? "ENABLED" : "DISABLED"}</span>
        </button>
      </div>
    </div>
  );
};
