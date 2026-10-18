import React, { useState } from "react";
import type { SectionItem } from "../../data/sections";
import { HolographicPanel } from "./HolographicPanel";
import { GlowButton } from "./GlowButton";
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Calendar, 
  BookOpen, 
  Users, 
  Radio, 
  UserPlus, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Send
} from "lucide-react";

interface SectionOverlayProps {
  section: SectionItem;
  onNext: () => void;
}

export const SectionOverlay: React.FC<SectionOverlayProps> = ({
  section,
  onNext,
}) => {
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", skill: "Beginner" });

  const getSectionIcon = (id: string) => {
    switch (id) {
      case "about": return <Sparkles size={20} color={section.accentColor} />;
      case "what-we-do": return <Layers size={20} color={section.accentColor} />;
      case "projects": return <Cpu size={20} color={section.accentColor} />;
      case "events": return <Calendar size={20} color={section.accentColor} />;
      case "learning": return <BookOpen size={20} color={section.accentColor} />;
      case "team": return <Users size={20} color={section.accentColor} />;
      case "community": return <Radio size={20} color={section.accentColor} />;
      case "join": return <UserPlus size={20} color={section.accentColor} />;
      default: return <Sparkles size={20} color={section.accentColor} />;
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setJoinSubmitted(true);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "80px",
        left: "32px",
        maxWidth: "600px",
        width: "calc(100vw - 64px)",
        pointerEvents: "auto",
        zIndex: 20,
        animation: "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <HolographicPanel
        badge={section.badge}
        accentColor={section.accentColor}
        style={{
          maxHeight: "calc(100vh - 180px)",
          overflowY: "auto",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              background: `${section.accentColor}18`,
              border: `1px solid ${section.accentColor}66`,
            }}
          >
            {getSectionIcon(section.id)}
          </div>

          <div>
            <div
              className="font-mono-tech"
              style={{
                fontSize: "11px",
                color: section.accentColor,
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              {section.subtitle}
            </div>
            <h1
              className="font-orbitron"
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
              }}
            >
              {section.title}
            </h1>
          </div>
        </div>

        {/* Anchor Object Indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(168, 85, 247, 0.1)",
            padding: "3px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#e2e8f0",
            marginBottom: "14px",
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: section.accentColor,
              boxShadow: `0 0 6px ${section.accentColor}`,
            }}
          />
          <span style={{ color: "#94a3b8" }}>FOCUSED 3D ANCHOR:</span>
          <strong style={{ color: "#fff" }}>{section.objectName}</strong>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#e9d5ff",
            marginBottom: "10px",
            lineHeight: 1.4,
          }}
        >
          "{section.tagline}"
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "13px",
            color: "#cbd5e1",
            lineHeight: 1.6,
            marginBottom: "16px",
          }}
        >
          {section.description}
        </p>

        {/* Stats Grid */}
        {section.stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {section.stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(18, 12, 38, 0.8)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                }}
              >
                <div
                  className="font-orbitron"
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: section.accentColor,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Cards */}
        {section.interactiveCards && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {section.interactiveCards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(18, 12, 38, 0.8)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h4
                    className="font-orbitron"
                    style={{ fontSize: "13px", color: "#f8fafc", fontWeight: 600 }}
                  >
                    {card.title}
                  </h4>
                  {card.tag && (
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: `${section.accentColor}22`,
                        color: section.accentColor,
                        border: `1px solid ${section.accentColor}44`,
                        fontWeight: 700,
                      }}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>
                {card.subtitle && (
                  <div style={{ fontSize: "11px", color: "#a855f7", marginBottom: "4px" }}>
                    {card.subtitle}
                  </div>
                )}
                <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Features List */}
        {section.features && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            {section.features.map((feat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
              >
                <CheckCircle2
                  size={14}
                  color={section.accentColor}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Special Join Form on Section 8 */}
        {section.id === "join" && (
          <div style={{ marginBottom: "16px" }}>
            {joinSubmitted ? (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.5)",
                  padding: "16px",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <ShieldCheck size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
                <h4 className="font-orbitron" style={{ color: "#10b981", fontSize: "15px" }}>
                  SIGNAL TRANSMITTED // ACCESS GRANTED
                </h4>
                <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
                  Welcome to the collective, <strong>{formData.name}</strong>. Verification coordinates dispatched to Discord.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="YOUR CALLSIGN / NAME"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      background: "rgba(10, 6, 22, 0.85)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="STUDENT EMAIL / DISCORD"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      background: "rgba(10, 6, 22, 0.85)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    style={{
                      background: "rgba(10, 6, 22, 0.85)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      color: "#c084fc",
                      fontSize: "12px",
                      outline: "none",
                      flex: 1,
                    }}
                  >
                    <option value="Beginner">Experience: Absolute Beginner</option>
                    <option value="Intermediate">Experience: Intermediate 3D Artist</option>
                    <option value="Advanced">Experience: Advanced / VFX Specialist</option>
                  </select>
                  <GlowButton
                    type="submit"
                    variant="primary"
                    icon={<Send size={14} />}
                    style={{ flexShrink: 0 }}
                  >
                    SUBMIT
                  </GlowButton>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer CTA */}
        {section.ctaText && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <GlowButton
              variant="primary"
              onClick={onNext}
              icon={<ArrowRight size={14} />}
            >
              {section.ctaText}
            </GlowButton>
          </div>
        )}
      </HolographicPanel>
    </div>
  );
};
