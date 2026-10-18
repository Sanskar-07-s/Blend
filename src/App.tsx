import { useState, useCallback, lazy, Suspense } from "react";
import { useSceneNavigation } from "./hooks/useSceneNavigation";
import { HeaderNav } from "./components/navigation/HeaderNav";
import { NavigationPill } from "./components/navigation/NavigationPill";
import { NavigationDrawer } from "./components/navigation/NavigationDrawer";
import { ContentPanel } from "./components/ui/ContentPanel";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { IntroOverlay } from "./components/ui/IntroOverlay";

const ClubRoomScene = lazy(() => import("./scenes/ClubRoomScene"));

export function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPrewarmed, setIsPrewarmed] = useState(false);

  const {
    navState,
    setNavState,
    isGoingOverview,
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

  const handlePrewarmComplete = useCallback(() => {
    setIsPrewarmed(true);
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    setNavState("intro");
  };

  const handleSkipIntro = () => {
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
      <Suspense fallback={null}>
        <ClubRoomScene
          navState={navState}
          isGoingOverview={isGoingOverview}
          currentSection={currentSection}
          overviewCamera={overviewCam}
          anchors={anchors}
          highlightedObject={highlightedObject}
          isDebugOpen={isDebugOpen}
          onTransitionComplete={onTransitionComplete}
          onPrewarmComplete={handlePrewarmComplete}
        />
      </Suspense>

      {!hasEntered && (
        <LoadingScreen onEnter={handleEnter} isReadyToEnter={isPrewarmed} />
      )}

      {hasEntered && (
        <>
          <HeaderNav onOpenMenu={toggleMenu} />

          {navState === "intro" && <IntroOverlay onSkip={handleSkipIntro} />}

          {navState === "section" && (
            <ContentPanel section={currentSection} onNext={next} />
          )}

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
