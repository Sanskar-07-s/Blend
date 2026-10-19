import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ENV } from "./config/env";
import { Analytics } from "@vercel/analytics/react";

// Lazy-load every route so each route only downloads its own bundle
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const ExperiencePage = lazy(() => import("./pages/ExperiencePage"));
const ClubPage = lazy(() => import("./pages/ClubPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const RouteLoadingFallback: React.FC = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "#05030A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        border: "3px solid rgba(124, 58, 237, 0.3)",
        borderTopColor: "#C084FC",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <span
      className="font-orbitron"
      style={{
        fontSize: "12px",
        letterSpacing: "0.12em",
        color: "#A8A3C7",
      }}
    >
      LOADING ROUTE...
    </span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Vercel Web Analytics (Only active when VITE_ANALYTICS=1) */}
      {ENV.ENABLE_ANALYTICS && <Analytics />}
    </BrowserRouter>
  );
}

export default App;
