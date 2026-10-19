import React from "react";
import { SECTIONS } from "../../data/sections";
import { ArrowRight, Sparkles } from "lucide-react";

export const Fallback2D: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        backgroundColor: "#05030a",
        color: "#f5f3ff",
        overflowY: "auto",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "clamp(16px, 5vw, 48px) clamp(16px, 6vw, 64px)",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          borderBottom: "1px solid rgba(139, 92, 246, 0.25)",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#c084fc",
              boxShadow: "0 0 12px #8b5cf6",
            }}
          />
          <h1
            className="font-orbitron"
            style={{
              fontSize: "clamp(18px, 4vw, 24px)",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#f5f3ff",
              margin: 0,
            }}
          >
            BLENDER CLUB
          </h1>
        </div>
        <span
          style={{
            fontSize: "12px",
            color: "#c084fc",
            border: "1px solid rgba(192, 132, 252, 0.3)",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(139, 92, 246, 0.15)",
          }}
        >
          2D ARCHIVE MODE
        </span>
      </header>

      {/* Hero Poster Banner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "380px",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "40px",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        <img
          src="/images/room-poster.png"
          alt="Blender Club 3D Cyber Studio Room"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "380px",
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px",
            background: "linear-gradient(to top, rgba(5, 3, 10, 0.95), transparent)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontFamily: "Orbitron, sans-serif",
              color: "#c084fc",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            SPATIAL ENVIRONMENT
          </span>
          <h2
            className="font-orbitron"
            style={{
              fontSize: "clamp(20px, 4vw, 32px)",
              fontWeight: 800,
              color: "#ffffff",
              margin: "4px 0 0 0",
            }}
          >
            CYBER GAMING STUDIO
          </h2>
        </div>
      </div>

      {/* 8 Sections List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "24px",
        }}
      >
        {SECTIONS.map((sec) => (
          <article
            key={sec.id}
            className="glass-panel"
            style={{
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              background: "rgba(15, 10, 30, 0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "Orbitron, sans-serif",
                    color: sec.accentColor || "#c084fc",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {sec.badge}
                </span>
                <span style={{ fontSize: "11px", color: "#a1a1b5" }}>{sec.objectName}</span>
              </div>

              <h3
                className="font-orbitron"
                style={{
                  fontSize: "clamp(16px, 3vw, 20px)",
                  fontWeight: 800,
                  color: "#f5f3ff",
                  marginBottom: "8px",
                }}
              >
                {sec.title}
              </h3>

              <p style={{ fontSize: "14px", color: "#a1a1b5", lineHeight: 1.5, marginBottom: "16px" }}>
                {sec.description}
              </p>

              {sec.cards && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {sec.cards.map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(5, 3, 10, 0.5)",
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
                              padding: "2px 6px",
                              borderRadius: "3px",
                              background: "rgba(139, 92, 246, 0.2)",
                              color: "#c084fc",
                              fontWeight: 700,
                            }}
                          >
                            {card.tag}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: "#a1a1b5", marginTop: "4px" }}>
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              aria-label={sec.ctaText ?? "Explore section"}
              style={{
                width: "100%",
                minHeight: "44px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.95))",
                border: "1px solid #c084fc",
                borderRadius: "8px",
                color: "#ffffff",
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Orbitron, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>{sec.ctaText ?? "EXPLORE"}</span>
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
export default Fallback2D;
