import React from "react";
import { SECTIONS } from "../../data/sections";
import { X, ChevronRight, Box, Compass } from "lucide-react";
import { soundEngine } from "../../audio/soundEffects";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  onSelectSection: (index: number) => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  currentIndex,
  onSelectSection,
}) => {
  if (!isOpen) return null;

  const handleSelect = (idx: number) => {
    soundEngine.playClick();
    onSelectSection(idx);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 3, 10, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="cyber-panel cyber-corner-bracket"
        style={{
          maxWidth: "780px",
          width: "100%",
          maxHeight: "88vh",
          borderRadius: "12px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(168, 85, 247, 0.2)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Compass size={22} color="#c084fc" />
            <div>
              <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#fff", fontWeight: 700 }}>
                NAVIGATION MATRIX
              </h2>
              <div className="font-mono-tech" style={{ fontSize: "11px", color: "#a855f7" }}>
                // DIRECT 3D SPATIAL TELEPORT
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close navigation menu"
            style={{
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#fff",
              borderRadius: "6px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "12px",
            overflowY: "auto",
            maxHeight: "60vh",
            paddingRight: "6px",
          }}
        >
          {SECTIONS.map((sec, idx) => {
            const isSelected = idx === currentIndex;
            const indexNumber = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={sec.id}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => soundEngine.playHover()}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))"
                    : "rgba(18, 12, 38, 0.65)",
                  border: `1px solid ${isSelected ? "#c084fc" : "rgba(168, 85, 247, 0.2)"}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: isSelected ? "0 0 16px rgba(168, 85, 247, 0.3)" : "none",
                }}
                className="hover:border-purple-400 group"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span
                    className="font-orbitron"
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: isSelected ? "#c084fc" : "#64748b",
                    }}
                  >
                    {indexNumber}
                  </span>

                  <div>
                    <h3
                      className="font-orbitron"
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: isSelected ? "#ffffff" : "#e2e8f0",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {sec.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      <Box size={11} color={sec.accentColor} />
                      <span>{sec.objectName}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  color={isSelected ? "#c084fc" : "#64748b"}
                  style={{ transition: "transform 0.2s ease" }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          className="font-mono-tech"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            color: "#64748b",
            borderTop: "1px solid rgba(168, 85, 247, 0.15)",
            paddingTop: "12px",
          }}
        >
          <span>KEYBOARD: [ARROW KEYS] TO CYCLE / [ESC] TO DISMISS</span>
          <span>SPATIAL NODES: 08 ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
