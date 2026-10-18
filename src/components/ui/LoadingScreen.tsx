import React, { useEffect, useState } from "react";
import { GlowButton } from "./GlowButton";
import { Sparkles, Terminal, ArrowRight } from "lucide-react";
import { soundEngine } from "../../audio/soundEffects";

interface LoadingScreenProps {
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const bootLogs = [
    "MOUNTING QUANTUM VIEWPORT...",
    "CALIBRATING 3D SHADER MATRICES...",
    "PREPARING CYBERNETIC ASSET REGISTRY...",
    "ESTABLISHING PROCEDURAL LIGHT PIPELINE...",
    "ASSEMBLING VIRTUAL BLENDER STUDIO...",
    "SYSTEM READY // 100% INITIALIZED",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          soundEngine.playPowerUp();
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 8;
        const next = Math.min(prev + step, 100);
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < bootLogs.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    return () => clearInterval(logInterval);
  }, [bootLogs.length]);

  const handleStart = () => {
    soundEngine.playPowerUp();
    onEnter();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#05030a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "24px",
      }}
      className="tech-grid"
    >
      {/* Background ambient radial glow */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Animated Diamond Emblem */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 20px",
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid #a855f7",
            borderRadius: "12px",
            transform: "rotate(45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
            animation: "pulse 2s infinite ease-in-out",
          }}
        >
          <div style={{ transform: "rotate(-45deg)" }}>
            <Sparkles size={28} color="#c084fc" />
          </div>
        </div>

        <div
          className="font-mono-tech"
          style={{
            fontSize: "12px",
            color: "#a855f7",
            letterSpacing: "0.25em",
            marginBottom: "6px",
          }}
        >
          // INITIALIZING 3D ENVIRONMENT
        </div>

        <h1
          className="font-orbitron"
          style={{
            fontSize: "36px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#ffffff",
            marginBottom: "8px",
            textShadow: "0 0 20px rgba(168, 85, 247, 0.6)",
          }}
        >
          BLENDER CLUB
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#94a3b8",
            marginBottom: "32px",
            letterSpacing: "0.05em",
          }}
        >
          FUTURISTIC 3D INTERACTIVE STUDIO & CREATIVE MATRIX
        </p>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "rgba(30, 20, 50, 0.8)",
            borderRadius: "3px",
            overflow: "hidden",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            marginBottom: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7c3aed, #c084fc)",
              boxShadow: "0 0 12px #a855f7",
              transition: "width 0.2s ease-out",
            }}
          />
        </div>

        {/* Boot Logs */}
        <div
          className="font-mono-tech"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "12px",
            color: isReady ? "#10b981" : "#c084fc",
            minHeight: "24px",
            marginBottom: "32px",
          }}
        >
          <Terminal size={14} />
          <span>{bootLogs[logIndex]}</span>
        </div>

        {/* Enter Experience Button */}
        {isReady ? (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <GlowButton
              variant="primary"
              onClick={handleStart}
              icon={<ArrowRight size={16} />}
              style={{
                fontSize: "14px",
                padding: "12px 28px",
                boxShadow: "0 0 30px rgba(192, 132, 252, 0.6)",
              }}
            >
              ENTER 3D STUDIO →
            </GlowButton>
          </div>
        ) : (
          <div
            className="font-mono-tech"
            style={{
              fontSize: "13px",
              color: "#64748b",
              letterSpacing: "0.1em",
            }}
          >
            BOOTING ENGINE [{progress}%]
          </div>
        )}
      </div>
    </div>
  );
};
