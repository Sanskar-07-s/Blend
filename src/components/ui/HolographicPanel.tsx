import React from "react";

interface HolographicPanelProps {
  children: React.ReactNode;
  badge?: string;
  className?: string;
  style?: React.CSSProperties;
  accentColor?: string;
}

export const HolographicPanel: React.FC<HolographicPanelProps> = ({
  children,
  badge,
  className = "",
  style,
  accentColor = "#a855f7",
}) => {
  return (
    <div
      className={`cyber-panel cyber-corner-bracket ${className}`}
      style={{
        borderRadius: "8px",
        padding: "24px",
        border: `1px solid ${accentColor}44`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 20px ${accentColor}22`,
        ...style,
      }}
    >
      {badge && (
        <div
          className="font-mono-tech"
          style={{
            position: "absolute",
            top: "-10px",
            left: "20px",
            background: "#0a0618",
            border: `1px solid ${accentColor}88`,
            padding: "2px 8px",
            borderRadius: "3px",
            fontSize: "10px",
            color: accentColor,
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          {badge}
        </div>
      )}
      {children}
    </div>
  );
};
