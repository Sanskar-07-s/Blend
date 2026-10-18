import { useState } from "react";
import { useSceneNavigation } from "./hooks/useSceneNavigation";
import { ClubRoomScene } from "./scenes/ClubRoomScene";
import { NavigationHUD } from "./components/navigation/NavigationHUD";
import { SectionOverlay } from "./components/ui/SectionOverlay";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { MenuModal } from "./components/ui/MenuModal";
import { DebugPanel } from "./components/ui/DebugPanel";

export function App() {
  const [hasEntered, setHasEntered] = useState(false);

  const {
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
    postProcessingEnabled,
    setPostProcessingEnabled,
    goToSection,
    nextSection,
    prevSection,
    toggleMenu,
    toggleDebug,
  } = useSceneNavigation();

  const handleEnterExperience = () => {
    setHasEntered(true);
    setIsIntroPlaying(true);
  };

  const handleIntroComplete = () => {
    setIsIntroPlaying(false);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#05030a" }}>
      {/* 1. Loading / Boot Screen */}
      {!hasEntered && (
        <LoadingScreen onEnter={handleEnterExperience} />
      )}

      {/* 2. Main 3D Canvas Scene */}
      {hasEntered && (
        <>
          <ClubRoomScene
            currentSectionIndex={currentSectionIndex}
            onSelectSection={goToSection}
            isIntroPlaying={isIntroPlaying}
            onIntroComplete={handleIntroComplete}
            reducedMotion={reducedMotion}
            postProcessingEnabled={postProcessingEnabled}
          />

          {/* 3. Subtle Holographic Scanline Overlay */}
          <div
            className="scanlines"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              pointerEvents: "none",
              opacity: 0.6,
            }}
          />

          {/* 4. Navigation HUD (Active once entered) */}
          <NavigationHUD
            currentIndex={currentSectionIndex}
            totalSections={totalSections}
            onNext={nextSection}
            onPrev={prevSection}
            onSelectIndex={goToSection}
            onOpenMenu={toggleMenu}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onToggleDebug={toggleDebug}
            isDebugOpen={isDebugOpen}
          />

          {/* 5. Active Section Holographic UI Overlay (Hidden while intro assembly plays) */}
          {!isIntroPlaying && (
            <SectionOverlay
              key={currentSection.id}
              section={currentSection}
              onNext={nextSection}
            />
          )}

          {/* 6. Navigation Matrix Menu Modal */}
          <MenuModal
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            currentIndex={currentSectionIndex}
            onSelectSection={goToSection}
          />

          {/* 7. Developer Debug Console */}
          <DebugPanel
            isOpen={isDebugOpen}
            onClose={() => setIsDebugOpen(false)}
            currentSection={currentSection}
            currentIndex={currentSectionIndex}
            isIntroPlaying={isIntroPlaying}
            onSkipIntro={() => setIsIntroPlaying(false)}
            postProcessingEnabled={postProcessingEnabled}
            onTogglePostProcessing={() => setPostProcessingEnabled(!postProcessingEnabled)}
          />
        </>
      )}
    </div>
  );
}

export default App;
