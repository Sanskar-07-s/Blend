import { useState } from "react";
import { useSceneNavigation } from "./hooks/useSceneNavigation";
import { ClubRoomScene } from "./scenes/ClubRoomScene";
import { HeaderNav } from "./components/navigation/HeaderNav";
import { NavigationPill } from "./components/navigation/NavigationPill";
import { NavigationDrawer } from "./components/navigation/NavigationDrawer";
import { ContentPanel } from "./components/ui/ContentPanel";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { IntroOverlay } from "./components/ui/IntroOverlay";

export function App() {
  const [hasEntered, setHasEntered] = useState(false);

  const {
    navState,
    setNavState,
    currentSectionIndex,
    currentSection,
    totalSections,
    sections,
    anchors,
    overviewCam,
    highlightedObject,
    isMenuOpen,
    setIsMenuOpen,
    isDebugOpen,
    goTo,
    next,
    back,
    home,
    toggleMenu,
    onTransitionComplete,
  } = useSceneNavigation();

  const handleEnter = () => {
    setHasEntered(true);
    setNavState("intro");
  };

  const handleSkipIntro = () => {
    // After intro ends, go straight to overview (do not auto-start section 1)
    setNavState("overview");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#05030a",
      }}
    >
      {/* 1. Minimal Loading / Boot Screen */}
      {!hasEntered && <LoadingScreen onEnter={handleEnter} />}

      {/* 2. Main 3D Studio Canvas Scene */}
      {hasEntered && (
        <>
          <ClubRoomScene
            navState={navState}
            currentSection={currentSection}
            overviewCamera={overviewCam}
            anchors={anchors}
            highlightedObject={highlightedObject}
            isDebugOpen={isDebugOpen}
            onTransitionComplete={onTransitionComplete}
          />

          {/* 3. Top Header: Small wordmark with glowing purple dot + Menu button */}
          <HeaderNav onOpenMenu={toggleMenu} />

          {/* 4. Intro Overlay (Max 7s with SKIP button, transitions straight to overview) */}
          {navState === "intro" && <IntroOverlay onSkip={handleSkipIntro} />}

          {/* 5. Content Panel (Only visible in 'section' state, positioned opposite the object) */}
          {navState === "section" && (
            <ContentPanel section={currentSection} onNext={next} />
          )}

          {/* 6. Slim Glass Navigation Pill (8 dots + BACK + Title + NEXT + Home) */}
          {navState !== "intro" && (
            <NavigationPill
              currentIndex={currentSectionIndex}
              totalSections={totalSections}
              currentSection={currentSection}
              isOverview={navState === "overview"}
              onNext={next}
              onPrev={back}
              onHome={home}
              onSelectIndex={goTo}
            />
          )}

          {/* 7. Right-Side Navigation Drawer */}
          <NavigationDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            sections={sections}
            currentIndex={currentSectionIndex}
            onSelectSection={goTo}
          />
        </>
      )}
    </div>
  );
}

export default App;
