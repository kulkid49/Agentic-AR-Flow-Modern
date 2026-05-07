import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { phaseOrder, phaseShortNames } from "@/data/agents";

interface NavigationProps {
  activeTab: "cards" | "swimlane";
  onTabChange: (tab: "cards" | "swimlane") => void;
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export default function Navigation({
  activeTab,
  onTabChange,
  activePhase,
  onPhaseChange,
}: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const cardsTabRef = useRef<HTMLButtonElement>(null);
  const swimlaneTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const target = activeTab === "cards" ? cardsTabRef.current : swimlaneTabRef.current;
    if (target && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setIndicatorStyle({
        left: targetRect.left - navRect.left,
        width: targetRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 1.8, ease: "power3.out" }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-[100] opacity-0"
      style={{
        background: "rgba(11,15,25,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div
            className="hidden sm:block"
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "11px",
              color: "#D4A843",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            AGENTIC AI
          </div>

          {/* Tabs */}
          <div className="relative flex items-center gap-1">
            <button
              ref={cardsTabRef}
              onClick={() => onTabChange("cards")}
              className="relative px-4 py-2 transition-colors duration-200 flex items-center gap-2"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: activeTab === "cards" ? "#D4A843" : "#8B95A8",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "cards") (e.target as HTMLElement).style.color = "#F0F2F5";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "cards") (e.target as HTMLElement).style.color = "#8B95A8";
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Agent Cards
            </button>
            <button
              ref={swimlaneTabRef}
              onClick={() => onTabChange("swimlane")}
              className="relative px-4 py-2 transition-colors duration-200 flex items-center gap-2"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: activeTab === "swimlane" ? "#D4A843" : "#8B95A8",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "swimlane") (e.target as HTMLElement).style.color = "#F0F2F5";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "swimlane") (e.target as HTMLElement).style.color = "#8B95A8";
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
                <line x1="8" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="16" y2="21" />
              </svg>
              Swimlane
            </button>

            {/* Active tab indicator */}
            <div
              ref={tabIndicatorRef}
              className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                background: "#D4A843",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Phase Filters - only on cards tab */}
          {activeTab === "cards" && (
            <div
              className="hidden lg:flex items-center gap-1.5 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <button
                onClick={() => onPhaseChange("all")}
                className="transition-all duration-200"
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
                  padding: "4px 12px",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: activePhase === "all" ? "#D4A843" : "#8B95A8",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ALL
              </button>
              {phaseOrder.map((phase) => (
                <button
                  key={phase}
                  onClick={() => onPhaseChange(phase)}
                  className="transition-all duration-200"
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
                    padding: "4px 12px",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: activePhase === phase ? "#D4A843" : "#8B95A8",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (activePhase !== phase)
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (activePhase !== phase)
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  {phaseShortNames[phase]}
                </button>
              ))}
            </div>
          )}

          {/* Empty spacer when swimlane is active */}
          {activeTab === "swimlane" && <div className="hidden lg:block w-[200px]" />}
        </div>
      </div>
    </nav>
  );
}
