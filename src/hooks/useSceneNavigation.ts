import { useState, useEffect, useCallback } from "react";
import { SECTIONS } from "../data/sections";
import { soundEngine } from "../audio/soundEffects";

export function useSceneNavigation() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [postProcessingEnabled, setPostProcessingEnabled] = useState(true);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
    }
  }, []);

  const totalSections = SECTIONS.length;
  const currentSection = SECTIONS[currentSectionIndex];

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= totalSections) return;
    setCurrentSectionIndex(index);
    setIsMenuOpen(false);
    soundEngine.playTransition();
  }, [totalSections]);

  const nextSection = useCallback(() => {
    setCurrentSectionIndex((prev) => {
      const next = (prev + 1) % totalSections;
      soundEngine.playTransition();
      return next;
    });
  }, [totalSections]);

  const prevSection = useCallback(() => {
    setCurrentSectionIndex((prev) => {
      const next = (prev - 1 + totalSections) % totalSections;
      soundEngine.playTransition();
      return next;
    });
  }, [totalSections]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (!next) soundEngine.playClick();
      return next;
    });
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      soundEngine.playClick();
      return !prev;
    });
  }, []);

  const toggleDebug = useCallback(() => {
    setIsDebugOpen((prev) => !prev);
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        toggleMenu();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        if (!isIntroPlaying && !isMenuOpen) {
          e.preventDefault();
          nextSection();
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (!isIntroPlaying && !isMenuOpen) {
          e.preventDefault();
          prevSection();
        }
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "`" || e.key === "~") {
        toggleDebug();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIntroPlaying, isMenuOpen, nextSection, prevSection, toggleMenu, toggleMute, toggleDebug]);

  return {
    currentSectionIndex,
    currentSection,
    totalSections,
    isIntroPlaying,
    setIsIntroPlaying,
    isMenuOpen,
    setIsMenuOpen,
    isDebugOpen,
    setIsDebugOpen,
    isMuted,
    toggleMute,
    reducedMotion,
    setReducedMotion,
    postProcessingEnabled,
    setPostProcessingEnabled,
    goToSection,
    nextSection,
    prevSection,
    toggleMenu,
    toggleDebug,
  };
}
