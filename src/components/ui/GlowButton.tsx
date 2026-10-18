import React from "react";
import { soundEngine } from "../../audio/soundEffects";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  glowColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = "secondary",
  glowColor,
  icon,
  children,
  onClick,
  onMouseEnter,
  className = "",
  style,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.playClick();
    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.playHover();
    onMouseEnter?.(e);
  };

  const baseClasses = "cyber-btn rounded relative group font-orbitron text-xs tracking-wider uppercase font-semibold transition-all duration-300";
  const variantClasses = {
    primary: "cyber-btn-primary text-white",
    secondary: "text-purple-100 hover:text-white",
    danger: "bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/40 text-rose-200",
    ghost: "bg-transparent border-transparent hover:bg-purple-900/30 text-purple-300 hover:text-white",
  }[variant];

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{
        ...style,
        ...(glowColor ? { borderColor: glowColor } : {}),
      }}
      {...props}
    >
      {/* Subtle corner tech accent */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-purple-400 group-hover:border-purple-200" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-purple-400 group-hover:border-purple-200" />
      {icon && <span className="text-purple-300 group-hover:text-purple-100 transition-colors">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
