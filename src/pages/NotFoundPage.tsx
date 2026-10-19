import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { getActivePalette } from "../config/palette";

export const NotFoundPage: React.FC = () => {
  const palette = getActivePalette();

  return (
    <div
      style={{
        backgroundColor: palette.background,
        color: palette.text,
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
      <div
        className="solid-panel"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "36px 28px",
          borderRadius: "6px",
          backgroundColor: "rgba(23, 26, 31, 0.94)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
        }}
      >
        <span
          className="mono-font"
          style={{
            fontSize: "12px",
            color: palette.accent,
            fontWeight: 500,
          }}
        >
          404 error
        </span>

        <h1
          className="heading-font"
          style={{
            fontSize: "28px",
            color: palette.text,
            lineHeight: 1.1,
          }}
        >
          Page not found
        </h1>

        <p style={{ color: palette.textMuted, fontSize: "15px", lineHeight: 1.6, margin: "4px 0 12px 0" }}>
          The page or section you were looking for does not exist or has been moved.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <Link
            to="/club"
            className="btn-primary"
            style={{ flex: 1 }}
          >
            <Compass size={15} />
            <span>Club site</span>
          </Link>

          <Link
            to="/experience"
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            <Home size={15} />
            <span>3D studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
