import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE_CONTENT, ProjectItem, GalleryItem } from "../content/site";
import { Hero3DAccent } from "../components/club/Hero3DAccent";
import {
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Box,
  Compass,
  Cpu,
  GraduationCap,
  Users,
} from "lucide-react";

export const ClubPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [entryFade, setEntryFade] = useState(() => {
    if (typeof window !== "undefined") {
      const fromStudio = sessionStorage.getItem("bc_exiting_to_club");
      if (fromStudio) {
        sessionStorage.removeItem("bc_exiting_to_club");
        return true;
      }
    }
    return false;
  });

  // Set document title & meta tags
  useEffect(() => {
    document.title = SITE_CONTENT.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", SITE_CONTENT.meta.description);
    }

    // Ensure body is not locked for scrolling
    document.body.classList.remove("experience-lock");

    // Smooth entry fade when coming from studio exit
    if (entryFade) {
      const timer = setTimeout(() => {
        setEntryFade(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [entryFade]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const filteredEvents = SITE_CONTENT.events.items.filter(
    (ev) => ev.status === eventTab
  );

  return (
    <div
      style={{
        backgroundColor: "#0F1115",
        color: "#F5F3FF",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Skip to content accessible link */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          top: "-40px",
          left: "12px",
          backgroundColor: "#F28C28",
          color: "#FFFFFF",
          padding: "8px 16px",
          zIndex: 1000,
          borderRadius: "4px",
          transition: "top 0.2s ease",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.top = "12px")}
        onBlur={(e) => (e.currentTarget.style.top = "-40px")}
      >
        Skip to main content
      </a>

      {/* Entry Violet Crossfade matching Experience exit */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#F28C28",
          opacity: entryFade ? 1 : 0,
          pointerEvents: "none",
          zIndex: 999,
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* STICKY SLIM TOP NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          backgroundColor: "rgba(5, 3, 10, 0.85)",
          borderBottom: "1px solid rgba(124, 58, 237, 0.25)",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "0 20px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Wordmark */}
          <a
            href="#hero"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#F5F3FF",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#FFB765",
                boxShadow: "0 0 12px #F28C28",
              }}
            />
            <span
              className="heading-font"
              style={{
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "#F5F3FF",
              }}
            >
              {SITE_CONTENT.navigation.brand}
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            style={{
              display: "none",
              gap: "24px",
              alignItems: "center",
            }}
            className="desktop-nav"
          >
            {SITE_CONTENT.navigation.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#A8A3C7",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  padding: "6px 0",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F3FF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A3C7")}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div
            style={{ display: "none", alignItems: "center", gap: "12px" }}
            className="desktop-cta"
          >
            <Link
              to="/experience"
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#F5F3FF",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid rgba(124, 58, 237, 0.4)",
                background: "rgba(20, 16, 42, 0.6)",
                textDecoration: "none",
                transition: "all 0.2s ease",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFB765";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(124, 58, 237, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ENTER STUDIO
            </Link>

            <a
              href="#join"
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #F28C28, #FFB765)",
                textDecoration: "none",
                boxShadow: "0 0 16px rgba(124, 58, 237, 0.4)",
                transition: "all 0.2s ease",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 24px rgba(167, 139, 250, 0.7)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 16px rgba(124, 58, 237, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              JOIN
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="mobile-menu-btn"
            style={{
              background: "transparent",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              borderRadius: "6px",
              padding: "10px",
              color: "#F5F3FF",
              cursor: "pointer",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: "rgba(10, 7, 22, 0.98)",
              borderBottom: "1px solid rgba(124, 58, 237, 0.3)",
              padding: "20px 24px 28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              animation: "panelSlideIn 0.25s ease-out forwards",
            }}
          >
            <nav aria-label="Mobile Navigation" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {SITE_CONTENT.navigation.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#F5F3FF",
                    textDecoration: "none",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              <Link
                to="/experience"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: "1px solid #F28C28",
                  background: "rgba(20, 16, 42, 0.7)",
                  color: "#F5F3FF",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                ENTER 3D STUDIO
              </Link>
              <a
                href="#join"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #F28C28, #FFB765)",
                  color: "#FFFFFF",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                JOIN THE CLUB
              </a>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT LANDMARK */}
      <main id="main-content">
        {/* HERO SECTION (#hero) */}
        <section
          id="hero"
          style={{
            position: "relative",
            padding: "80px 20px 100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Subtle violet radial background accent */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(5, 3, 10, 0) 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center",
              width: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(124, 58, 237, 0.15)",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                  marginBottom: "20px",
                }}
              >
                <Sparkles size={14} color="#FFB765" />
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#FFB765",
                  }}
                >
                  COLLEGIATE 3D LAB
                </span>
              </div>

              {/* Single primary H1 for the page */}
              <h1
                className="heading-font"
                style={{
                  fontSize: "clamp(34px, 5.5vw, 62px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "0.04em",
                  color: "#F5F3FF",
                  marginBottom: "24px",
                }}
              >
                {SITE_CONTENT.hero.headline}
              </h1>

              <p
                style={{
                  fontSize: "clamp(16px, 2vw, 19px)",
                  lineHeight: 1.6,
                  color: "#A8A3C7",
                  maxWidth: "560px",
                  marginBottom: "36px",
                }}
              >
                {SITE_CONTENT.hero.subline}
              </p>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <a
                  href="#join"
                  style={{
                    minHeight: "48px",
                    padding: "12px 28px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #F28C28, #FFB765)",
                    color: "#FFFFFF",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 24px rgba(124, 58, 237, 0.4)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 32px rgba(167, 139, 250, 0.7)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 24px rgba(124, 58, 237, 0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>{SITE_CONTENT.hero.ctaPrimary}</span>
                  <ArrowRight size={16} />
                </a>

                <Link
                  to="/experience"
                  style={{
                    minHeight: "48px",
                    padding: "12px 28px",
                    borderRadius: "8px",
                    background: "rgba(20, 16, 42, 0.65)",
                    border: "1px solid rgba(167, 139, 250, 0.4)",
                    color: "#F5F3FF",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FFB765";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(124, 58, 237, 0.35)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.4)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>{SITE_CONTENT.hero.ctaSecondary}</span>
                  <Box size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Looping 3D Accent with IntersectionObserver */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Hero3DAccent />
            </div>
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* ABOUT SECTION (#about) */}
        <section
          id="about"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.about.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.about.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
              marginBottom: "56px",
            }}
          >
            {/* Mission */}
            <div
              style={{
                backgroundColor: "rgba(20, 16, 42, 0.6)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                borderRadius: "12px",
                padding: "32px",
              }}
            >
              <h3 className="heading-font" style={{ fontSize: "18px", color: "#C084FC", marginBottom: "14px" }}>
                OUR MISSION
              </h3>
              <p style={{ color: "#A8A3C7", lineHeight: 1.6, fontSize: "15px" }}>
                {SITE_CONTENT.about.mission}
              </p>
            </div>

            {/* Vision */}
            <div
              style={{
                backgroundColor: "rgba(20, 16, 42, 0.6)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                borderRadius: "12px",
                padding: "32px",
              }}
            >
              <h3 className="heading-font" style={{ fontSize: "18px", color: "#C084FC", marginBottom: "14px" }}>
                OUR VISION
              </h3>
              <p style={{ color: "#A8A3C7", lineHeight: 1.6, fontSize: "15px" }}>
                {SITE_CONTENT.about.vision}
              </p>
            </div>
          </div>

          {/* 3 Key Fact Tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {SITE_CONTENT.about.facts.map((fact, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(15, 10, 30, 0.75)",
                  border: "1px solid rgba(167, 139, 250, 0.25)",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  className="heading-font"
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#FFB765",
                    marginBottom: "8px",
                  }}
                >
                  {fact.metric}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#F5F3FF", marginBottom: "6px" }}>
                  {fact.label}
                </div>
                <div style={{ fontSize: "12px", color: "#A8A3C7", lineHeight: 1.4 }}>
                  {fact.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* WHAT WE DO SECTION (#what-we-do) */}
        <section
          id="what-we-do"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.whatWeDo.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.whatWeDo.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {SITE_CONTENT.whatWeDo.cards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.55)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "12px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFB765";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(124, 58, 237, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#C084FC",
                      }}
                    >
                      {idx % 3 === 0 ? <Box size={20} /> : idx % 3 === 1 ? <Layers size={20} /> : <Cpu size={20} />}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "Orbitron, sans-serif",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        color: "#FFB765",
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3
                    className="heading-font"
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#F5F3FF",
                      marginBottom: "10px",
                    }}
                  >
                    {card.title}
                  </h3>

                  <p style={{ fontSize: "14px", color: "#A8A3C7", lineHeight: 1.55 }}>
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* PROJECTS SECTION (#projects) */}
        <section
          id="projects"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.projects.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.projects.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            {SITE_CONTENT.projects.items.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.6)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFB765";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 16px 32px rgba(124, 58, 237, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Project Image Placeholder */}
                <div
                  style={{
                    height: "190px",
                    width: "100%",
                    backgroundColor: "rgba(15, 10, 30, 0.9)",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(124, 58, 237, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFB765",
                    }}
                  >
                    <Box size={28} />
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "14px",
                      fontSize: "11px",
                      fontFamily: "Orbitron, sans-serif",
                      fontWeight: 700,
                      color: "#C084FC",
                      backgroundColor: "rgba(5, 3, 10, 0.8)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {proj.category}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3
                      className="heading-font"
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#F5F3FF",
                        marginBottom: "8px",
                      }}
                    >
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#A8A3C7", lineHeight: 1.5, marginBottom: "16px" }}>
                      {proj.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          backgroundColor: "rgba(124, 58, 237, 0.15)",
                          color: "#FFB765",
                          border: "1px solid rgba(124, 58, 237, 0.25)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECT LIGHTBOX MODAL */}
        {selectedProject && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(5, 3, 10, 0.85)",
              backdropFilter: "blur(12px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setSelectedProject(null)}
          >
            <div
              style={{
                backgroundColor: "#14102A",
                border: "1px solid #F28C28",
                borderRadius: "14px",
                maxWidth: "600px",
                width: "100%",
                padding: "32px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "#FFB765" }}>
                    {selectedProject.category}
                  </span>
                  <h3 className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "#F5F3FF", marginTop: "4px" }}>
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project modal"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#A8A3C7",
                    cursor: "pointer",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  height: "220px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(5, 3, 10, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  color: "#FFB765",
                }}
              >
                <Box size={48} />
              </div>

              <p style={{ fontSize: "14px", color: "#A8A3C7", lineHeight: 1.6, marginBottom: "20px" }}>
                {selectedProject.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {selectedProject.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(124, 58, 237, 0.2)",
                      color: "#F5F3FF",
                      border: "1px solid rgba(167, 139, 250, 0.3)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  width: "100%",
                  minHeight: "44px",
                  background: "linear-gradient(135deg, #F28C28, #FFB765)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                CLOSE PREVIEW
              </button>
            </div>
          </div>
        )}

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* EVENTS SECTION (#events) */}
        <section
          id="events"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.events.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.events.headline}
            </h2>
          </div>

          {/* Upcoming vs Past Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "40px",
            }}
          >
            {(["upcoming", "past"] as const).map((tab) => {
              const isActive = eventTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setEventTab(tab)}
                  style={{
                    minHeight: "44px",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    background: isActive ? "linear-gradient(135deg, #F28C28, #FFB765)" : "rgba(20, 16, 42, 0.6)",
                    border: `1px solid ${isActive ? "#FFB765" : "rgba(124, 58, 237, 0.3)"}`,
                    color: isActive ? "#FFFFFF" : "#A8A3C7",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab} Events
                </button>
              );
            })}
          </div>

          {/* Events List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px", margin: "0 auto" }}>
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.6)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "Orbitron, sans-serif",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        color: "#C084FC",
                        textTransform: "uppercase",
                      }}
                    >
                      {ev.tag}
                    </span>
                    <h3 className="heading-font" style={{ fontSize: "18px", fontWeight: 700, color: "#F5F3FF", marginTop: "6px" }}>
                      {ev.title}
                    </h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#A8A3C7", fontSize: "13px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={14} color="#FFB765" />
                      {ev.date}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} color="#FFB765" />
                      {ev.time}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "#A8A3C7", lineHeight: 1.55 }}>
                  {ev.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#F28C28", fontWeight: 600 }}>
                  <MapPin size={14} />
                  <span>{ev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* LEARNING HUB SECTION (#learning) */}
        <section
          id="learning"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.learning.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.learning.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {SITE_CONTENT.learning.resources.map((res) => (
              <div
                key={res.id}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.55)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#C084FC", fontFamily: "Orbitron, sans-serif" }}>
                      {res.category}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(15, 10, 30, 0.9)",
                        border: `1px solid ${res.level === "Beginner" ? "#9CC3FF" : res.level === "Intermediate" ? "#FFB765" : "#FFB765"}`,
                        color: res.level === "Beginner" ? "#67E8F9" : res.level === "Intermediate" ? "#DDD6FE" : "#F472B6",
                        fontWeight: 700,
                      }}
                    >
                      {res.level}
                    </span>
                  </div>

                  <h3 className="heading-font" style={{ fontSize: "16px", fontWeight: 700, color: "#F5F3FF", marginBottom: "8px" }}>
                    {res.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#A8A3C7", lineHeight: 1.5, marginBottom: "16px" }}>
                    {res.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(124, 58, 237, 0.15)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "11px", color: "#A8A3C7" }}>{res.duration}</span>
                  <a
                    href={res.link}
                    style={{
                      fontSize: "12px",
                      color: "#FFB765",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600,
                    }}
                  >
                    <span>Access Resource</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* GALLERY SECTION (#gallery) */}
        <section
          id="gallery"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.gallery.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.gallery.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {SITE_CONTENT.gallery.items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryItem(item)}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.6)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFB765";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    height: "220px",
                    width: "100%",
                    backgroundColor: "rgba(10, 7, 22, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Box size={36} color="#FFB765" />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "12px",
                      fontSize: "10px",
                      backgroundColor: "rgba(5, 3, 10, 0.8)",
                      color: "#A8A3C7",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {item.aspectRatio}
                  </span>
                </div>

                <div style={{ padding: "16px" }}>
                  <h3 className="heading-font" style={{ fontSize: "15px", fontWeight: 700, color: "#F5F3FF" }}>
                    {item.title}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "12px", color: "#A8A3C7" }}>
                    <span>{item.author}</span>
                    <span>{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY LIGHTBOX MODAL */}
        {selectedGalleryItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(5, 3, 10, 0.9)",
              backdropFilter: "blur(12px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setSelectedGalleryItem(null)}
          >
            <div
              style={{
                backgroundColor: "#14102A",
                border: "1px solid #F28C28",
                borderRadius: "14px",
                maxWidth: "700px",
                width: "100%",
                padding: "28px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="heading-font" style={{ fontSize: "20px", color: "#F5F3FF" }}>
                    {selectedGalleryItem.title}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#A8A3C7" }}>
                    {selectedGalleryItem.author} • {selectedGalleryItem.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  aria-label="Close gallery modal"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#A8A3C7",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  height: "360px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(5, 3, 10, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C084FC",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                }}
              >
                <Box size={64} />
              </div>
            </div>
          </div>
        )}

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* TEAM LEADERSHIP SECTION (#team) */}
        <section
          id="team"
          style={{
            padding: "100px 20px",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.team.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.team.headline}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {SITE_CONTENT.team.members.map((member) => (
              <div
                key={member.id}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.55)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(124, 58, 237, 0.2)",
                    border: "2px solid #F28C28",
                    margin: "0 auto 16px auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFB765",
                  }}
                >
                  <Users size={32} />
                </div>
                <h3 className="heading-font" style={{ fontSize: "16px", fontWeight: 700, color: "#F5F3FF" }}>
                  {member.name}
                </h3>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#C084FC", marginTop: "4px" }}>
                  {member.role}
                </div>
                <div style={{ fontSize: "11px", color: "#A8A3C7", marginTop: "4px" }}>
                  {member.department}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* COMMUNITY SECTION (#community) */}
        <section
          id="community"
          style={{
            padding: "100px 20px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                color: "#FFB765",
                letterSpacing: "0.15em",
              }}
            >
              {SITE_CONTENT.community.subline.toUpperCase()}
            </span>
            <h2
              className="heading-font"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                color: "#F5F3FF",
                marginTop: "8px",
              }}
            >
              {SITE_CONTENT.community.headline}
            </h2>
          </div>

          {/* Social Links Placeholders */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            {SITE_CONTENT.community.socials.map((soc) => (
              <a
                key={soc.platform}
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  minHeight: "44px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(20, 16, 42, 0.6)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  color: "#F5F3FF",
                  textDecoration: "none",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFB765";
                  e.currentTarget.style.color = "#C084FC";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.color = "#F5F3FF";
                }}
              >
                <span>{soc.platform}</span>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {SITE_CONTENT.community.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "rgba(20, 16, 42, 0.55)",
                    border: "1px solid rgba(124, 58, 237, 0.25)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      minHeight: "52px",
                      padding: "16px 20px",
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#F5F3FF",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: 600 }}>{item.question}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        color: "#FFB765",
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 20px 20px 20px",
                        fontSize: "14px",
                        color: "#A8A3C7",
                        lineHeight: 1.6,
                        borderTop: "1px solid rgba(124, 58, 237, 0.15)",
                        paddingTop: "12px",
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* THIN NEON DIVIDER */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        />

        {/* JOIN SECTION (#join) */}
        <section
          id="join"
          style={{
            padding: "100px 20px 120px 20px",
            maxWidth: "960px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              color: "#FFB765",
              letterSpacing: "0.15em",
            }}
          >
            {SITE_CONTENT.join.subline.toUpperCase()}
          </span>
          <h2
            className="heading-font"
            style={{
              fontSize: "clamp(28px, 4.5vw, 48px)",
              fontWeight: 800,
              color: "#F5F3FF",
              marginTop: "8px",
              marginBottom: "24px",
            }}
          >
            {SITE_CONTENT.join.headline}
          </h2>

          {/* 3 Steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              marginBottom: "48px",
              textAlign: "left",
            }}
          >
            {SITE_CONTENT.join.steps.map((st) => (
              <div
                key={st.number}
                style={{
                  backgroundColor: "rgba(20, 16, 42, 0.6)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <div
                  className="heading-font"
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#C084FC",
                    marginBottom: "8px",
                  }}
                >
                  {st.number}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#F5F3FF", marginBottom: "6px" }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#A8A3C7", lineHeight: 1.5 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Join CTA Button or Disabled State */}
          {SITE_CONTENT.join.joinUrl ? (
            <a
              href={SITE_CONTENT.join.joinUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                minHeight: "52px",
                padding: "14px 40px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #F28C28, #FFB765)",
                color: "#FFFFFF",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 30px rgba(124, 58, 237, 0.5)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 40px rgba(217, 70, 239, 0.8)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(124, 58, 237, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span>SUBMIT MEMBERSHIP APPLICATION</span>
              <ArrowRight size={16} />
            </a>
          ) : (
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                disabled
                style={{
                  minHeight: "52px",
                  padding: "14px 36px",
                  borderRadius: "8px",
                  background: "rgba(20, 16, 42, 0.5)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  color: "#A8A3C7",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "not-allowed",
                  letterSpacing: "0.08em",
                }}
              >
                Join link coming soon
              </button>
              <span style={{ fontSize: "12px", color: "#A8A3C7" }}>
                Applications open soon. Check back shortly!
              </span>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(124, 58, 237, 0.25)",
          backgroundColor: "#080512",
          padding: "48px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div className="heading-font" style={{ fontSize: "16px", fontWeight: 800, color: "#F5F3FF" }}>
              {SITE_CONTENT.navigation.brand}
            </div>
            <div style={{ fontSize: "12px", color: "#A8A3C7", marginTop: "4px" }}>
              {SITE_CONTENT.footer.tagline}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link
              to="/experience"
              style={{
                fontSize: "13px",
                color: "#FFB765",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              3D Studio Room
            </Link>
            <Link
              to="/"
              style={{
                fontSize: "13px",
                color: "#A8A3C7",
                textDecoration: "none",
              }}
            >
              Welcome Hero
            </Link>
            <a
              href="#hero"
              style={{
                fontSize: "13px",
                color: "#A8A3C7",
                textDecoration: "none",
              }}
            >
              Back to Top ↑
            </a>
          </div>

          <div style={{ fontSize: "12px", color: "#A8A3C7", width: "100%", borderTop: "1px solid rgba(124, 58, 237, 0.15)", paddingTop: "20px", marginTop: "12px" }}>
            {SITE_CONTENT.footer.copyright}
          </div>
        </div>
      </footer>

      {/* Responsive CSS for desktop vs mobile nav */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ClubPage;
