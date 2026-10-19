import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#05030A",
        color: "#F5F3FF",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(124, 58, 237, 0.2)",
            border: "1px solid rgba(167, 139, 250, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#A78BFA",
            marginBottom: "8px",
          }}
        >
          <Compass size={32} />
        </div>

        <span
          style={{
            fontSize: "12px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: 700,
            color: "#C084FC",
            letterSpacing: "0.15em",
          }}
        >
          404 / SECTOR NOT FOUND
        </span>

        <h1
          className="font-orbitron"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "#F5F3FF",
          }}
        >
          LOST IN 3D SPACE
        </h1>

        <p style={{ color: "#A8A3C7", fontSize: "15px", lineHeight: 1.5, marginBottom: "16px" }}>
          The waypoint or coordinate you requested does not exist in our studio matrix.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            to="/club"
            style={{
              minHeight: "44px",
              padding: "10px 24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              color: "#FFFFFF",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            <span>GO TO CLUB SITE</span>
            <Home size={16} />
          </Link>

          <Link
            to="/experience"
            style={{
              minHeight: "44px",
              padding: "10px 24px",
              borderRadius: "8px",
              background: "rgba(20, 16, 42, 0.7)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#F5F3FF",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeft size={16} />
            <span>ENTER 3D STUDIO</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
