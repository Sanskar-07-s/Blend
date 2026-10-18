import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { GlowButton } from "../ui/GlowButton";

interface NextButtonProps {
  onNext: () => void;
  onPrev: () => void;
  nextLabel?: string;
  prevLabel?: string;
}

export const NextButton: React.FC<NextButtonProps> = ({
  onNext,
  onPrev,
  nextLabel = "NEXT",
  prevLabel = "BACK",
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <GlowButton
        variant="secondary"
        onClick={onPrev}
        icon={<ChevronLeft size={16} />}
        aria-label="Previous 3D section"
      >
        {prevLabel}
      </GlowButton>

      <GlowButton
        variant="primary"
        onClick={onNext}
        aria-label="Next 3D section"
      >
        <span>{nextLabel}</span>
        <ChevronRight size={16} style={{ marginLeft: "4px" }} />
      </GlowButton>
    </div>
  );
};
