import React from "react";
import { Menu, Terminal, Sparkles } from "lucide-react";
import { NextButton } from "./NextButton";
import { SectionIndicator } from "./SectionIndicator";
import { GlowButton } from "../ui/GlowButton";

interface NavigationHUDProps {
  currentIndex: number;
  totalSections: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  onOpenMenu: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onToggleDebug: () => void;
  isDebugOpen: boolean;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  currentIndex,
  totalSections,
  onNext,
  onPrev,
  onSelectIndex,
  onOpenMenu,
  onToggleDebug,
  isDebugOpen,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 32px",
      }}
    >
      {/* TOP HUD BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          pointerEvents: "auto",
        }}
      >
        {/* Top Left: Club Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(192, 132, 252, 0.2))",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(168, 85, 247, 0.4)",
            }}
          >
            <Sparkles size={18} color="#c084fc" />
          </div>

          <div>
            <div
              className="font-orbitron"
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>BLENDER CLUB</span>
              <span
                style={{
                  fontSize: "9px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  fontWeight: 700,
                }}
              >
                LIVE STUDIO
              </span>
            </div>

            <div
              className="font-mono-tech"
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                letterSpacing: "0.15em",
              }}
            >
              SYS.V0 // 3D SPATIAL INTERFACE
            </div>
          </div>
        </div>

        {/* Top Right: Controls & Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Dev Debug Toggle */}
          <button
            onClick={onToggleDebug}
            aria-label="Toggle Debug Mode"
            style={{
              background: isDebugOpen ? "rgba(168, 85, 247, 0.25)" : "rgba(10, 6, 22, 0.75)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${isDebugOpen ? "#c084fc" : "rgba(168, 85, 247, 0.3)"}`,
              color: isDebugOpen ? "#ffffff" : "#94a3b8",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontFamily: "Space Grotesk, monospace",
            }}
            className="hover:border-purple-400"
          >
            <Terminal size={15} />
            <span>DEBUG</span>
          </button>

          {/* Menu Trigger */}
          <GlowButton
            variant="primary"
            onClick={onOpenMenu}
            icon={<Menu size={16} />}
            aria-label="Open navigation menu"
          >
            MENU
          </GlowButton>
        </div>
      </div>

      {/* BOTTOM HUD BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%",
          pointerEvents: "auto",
        }}
      >
        {/* Bottom Left / Center: Next / Back + Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <NextButton onNext={onNext} onPrev={onPrev} />
          <SectionIndicator
            currentIndex={currentIndex}
            total={totalSections}
            onSelectIndex={onSelectIndex}
          />
        </div>

        {/* Bottom Right: Key Navigation Hints */}
        <div
          className="font-mono-tech"
          style={{
            display: "none",
            gap: "12px",
            fontSize: "11px",
            color: "#64748b",
            background: "rgba(10, 6, 22, 0.6)",
            backdropFilter: "blur(6px)",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid rgba(168, 85, 247, 0.15)",
          }}
          id="keyboard-hints"
        >
          <span>[← / →] NAVIGATE</span>
          <span>[ESC] MENU</span>
        </div>
      </div>
    </div>
  );
};
