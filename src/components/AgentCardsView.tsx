import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fullAgents, phaseOrder, phaseShortNames } from "@/data/agents";
import type { Phase } from "@/data/agents";
import AgentCard from "./AgentCard";
import LegendBar from "./LegendBar";

gsap.registerPlugin(ScrollTrigger);

interface AgentCardsViewProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
  onScrollToFirstCard: () => void;
}

export default function AgentCardsView({
  activePhase,
  onPhaseChange,
}: AgentCardsViewProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevPhaseRef = useRef(activePhase);

  const filteredAgents =
    activePhase === "all"
      ? fullAgents
      : fullAgents.filter((a) => a.phase === activePhase);

  // Animate cards on mount / filter change
  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    if (prevPhaseRef.current !== activePhase) {
      // Filter transition: animate out then in
      const ctx = gsap.context(() => {
        gsap.to(cards, {
          opacity: 0,
          scale: 0.95,
          duration: 0.25,
          stagger: 0.02,
          ease: "power2.in",
          onComplete: () => {
            prevPhaseRef.current = activePhase;
            // Next tick: animate new cards in
            requestAnimationFrame(() => {
              const newCards = cardRefs.current.filter(Boolean);
              gsap.fromTo(
                newCards,
                { opacity: 0, y: 40, scale: 0.97 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  stagger: 0.06,
                  ease: "power3.out",
                }
              );
            });
          },
        });
      }, gridRef);
      return () => ctx.revert();
    } else {
      // Initial mount entrance
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
            },
          }
        );
      }, gridRef);
      return () => ctx.revert();
    }
  }, [activePhase]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  return (
    <div className="animate-fadeIn">
      {/* Mobile Phase Filter */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={() => onPhaseChange("all")}
            className="transition-all duration-200 flex-shrink-0"
            style={{
              background:
                activePhase === "all"
                  ? "rgba(212,168,67,0.15)"
                  : "rgba(255,255,255,0.05)",
              border:
                activePhase === "all"
                  ? "1px solid rgba(212,168,67,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: 500,
              color: activePhase === "all" ? "#D4A843" : "#8B95A8",
              cursor: "pointer",
            }}
          >
            ALL
          </button>
          {phaseOrder.map((phase) => (
            <button
              key={phase}
              onClick={() => onPhaseChange(phase)}
              className="transition-all duration-200 flex-shrink-0"
              style={{
                background:
                  activePhase === phase
                    ? "rgba(212,168,67,0.15)"
                    : "rgba(255,255,255,0.05)",
                border:
                  activePhase === phase
                    ? "1px solid rgba(212,168,67,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 500,
                color: activePhase === phase ? "#D4A843" : "#8B95A8",
                cursor: "pointer",
              }}
            >
              {phaseShortNames[phase as Phase]}
            </button>
          ))}
        </div>
      </div>

      <LegendBar />

      {/* Cards Grid */}
      <div
        ref={gridRef}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: "20px",
          marginTop: "1rem",
        }}
      >
        {filteredAgents.map((agent, index) => (
          <AgentCard
            key={`${agent.step}-${activePhase}`}
            agent={agent}
            ref={setCardRef(index)}
          />
        ))}

        {filteredAgents.length === 0 && (
          <div
            className="flex items-center justify-center py-20"
            style={{ gridColumn: "1 / -1" }}
          >
            <p style={{ fontSize: "14px", color: "#8B95A8" }}>
              No agents found for the selected phase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
