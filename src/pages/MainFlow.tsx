import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Hero from "../components/Hero";
import Navigation from "../components/Navigation";
import AgentCardsView from "../components/AgentCardsView";
import SwimlaneView from "../components/SwimlaneView";
import FlowChartView from "../components/FlowChartView";
import Footer from "../components/Footer";
gsap.registerPlugin(ScrollTrigger);

export default function MainFlow() {
  const [activeTab, setActiveTab] = useState<"cards" | "swimlane" | "flow">("cards");
  const [activePhase, setActivePhase] = useState("all");
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleTabChange = useCallback(
    (tab: "cards" | "swimlane" | "flow") => {
      if (tab === activeTab || tabTransitioning) return;

      setTabTransitioning(true);

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            setActiveTab(tab);
            requestAnimationFrame(() => {
              if (contentRef.current) {
                gsap.fromTo(
                  contentRef.current,
                  { opacity: 0 },
                  {
                    opacity: 1,
                    duration: 0.3,
                    delay: 0.1,
                    ease: "power2.out",
                    onComplete: () => setTabTransitioning(false),
                  }
                );
              } else {
                setTabTransitioning(false);
              }
            });
          },
        });
      } else {
        setActiveTab(tab);
        setTabTransitioning(false);
      }
    },
    [activeTab, tabTransitioning]
  );

  const handleSwimlaneCellClick = useCallback(
    (phase: string) => {
      setActivePhase(phase);

      const cardsBtn = document.querySelector(
        '[data-tab="cards"]'
      ) as HTMLButtonElement | null;
      if (cardsBtn) {
        const originalTransition = cardsBtn.style.transition;
        cardsBtn.style.transition = "box-shadow 0.3s ease";
        cardsBtn.style.boxShadow = "0 0 30px rgba(91,141,239,0.5)";
        cardsBtn.style.background = "rgba(91,141,239,0.2)";
        cardsBtn.style.borderColor = "rgba(91,141,239,0.5)";

        setTimeout(() => {
          cardsBtn.style.boxShadow = "none";
          cardsBtn.style.background = "";
          cardsBtn.style.borderColor = "";
          cardsBtn.style.transition = originalTransition;
        }, 2000);
      }

      if (activeTab !== "cards") {
        handleTabChange("cards");
      }

      setTimeout(() => {
        const grid = document.getElementById("agents-grid-anchor");
        if (grid) {
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    },
    [activeTab, handleTabChange]
  );

  return (
    <div
      style={{
        background: "#0B0F19",
        minHeight: "100vh",
        color: "#F0F2F5",
        fontFamily: "'Geist Sans', 'Geist Variable', system-ui, -apple-system, sans-serif",
      }}
    >
      <Hero />

      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activePhase={activePhase}
        onPhaseChange={setActivePhase}
      />

      <div id="agents-grid-anchor" />

      <div ref={contentRef}>
        {activeTab === "cards" && (
          <AgentCardsView
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
            onScrollToFirstCard={() => {
              const grid = document.getElementById("agents-grid-anchor");
              if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        )}

        {activeTab === "swimlane" && (
          <SwimlaneView onCellClick={handleSwimlaneCellClick} />
        )}

        {activeTab === "flow" && <FlowChartView />}
      </div>

      <Footer />
    </div>
  );
}

