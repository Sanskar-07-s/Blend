import React, { useRef, useState, useEffect, Suspense } from "react";

const Hero3DCanvas = React.lazy(() => import("./Hero3DCanvas"));

interface Hero3DAccentProps {
  isLowTier?: boolean;
}

export const Hero3DAccent: React.FC<Hero3DAccentProps> = ({ isLowTier }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return Math.min(window.innerWidth, window.innerHeight) < 640 || /android|iphone|ipad|mobile/i.test(navigator.userAgent || "");
    }
    return false;
  });

  const effectiveLowTier = isLowTier ?? isMobile;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (effectiveLowTier) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(5, 3, 10, 0) 70%)",
            border: "1px solid rgba(167, 139, 250, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 35px rgba(124, 58, 237, 0.3)",
          }}
        >
          <span className="font-orbitron" style={{ fontSize: "36px", fontWeight: 800, color: "#C084FC" }}>
            BC
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "360px",
        minHeight: "300px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isInView && (
        <Suspense fallback={null}>
          <Hero3DCanvas />
        </Suspense>
      )}
    </div>
  );
};
