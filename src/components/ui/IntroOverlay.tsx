import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface IntroOverlayProps {
  onSkip: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSkip]);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "32px",
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={onSkip}
        aria-label="Skip Studio Introduction"
        className="glass-panel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "8px",
          color: "#f5f3ff",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "Orbitron, sans-serif",
          cursor: "pointer",
          letterSpacing: "0.08em",
        }}
      >
        <span>SKIP ({timeLeft}s)</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
