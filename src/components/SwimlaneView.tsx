import { useEffect, useRef } from "react";
import gsap from "gsap";
import { fullAgents, phaseOrder, phaseShortNames, phaseNumbers } from "@/data/agents";
import type { Phase } from "@/data/agents";
import LegendBar from "./LegendBar";

interface SwimlaneViewProps {
  onCellClick: (phase: string) => void;
}

export default function SwimlaneView({ onCellClick }: SwimlaneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headersRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Phase headers entrance
      if (headersRef.current) {
        const headers = headersRef.current.querySelectorAll(".phase-header");
        gsap.fromTo(
          headers,
          { opacity: 0, y: -30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out",
          }
        );
      }

      // Agent labels entrance
      if (rowsRef.current) {
        const labels = rowsRef.current.querySelectorAll(".agent-lane-label");
        gsap.fromTo(
          labels,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: "power3.out",
            delay: 0.2,
          }
        );

        // Active cells entrance
        const cells = rowsRef.current.querySelectorAll(".swimlane-cell-active");
        gsap.fromTo(
          cells,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.04,
            ease: "power3.out",
            delay: 0.3,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCellClick = (agentIndex: number) => {
    const agent = fullAgents[agentIndex];
    if (agent) {
      onCellClick(agent.phase);
    }
  };

  return (
    <div ref={containerRef} className="animate-fadeIn">
      <LegendBar variant="swimlane" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16">
        <div
          className="relative overflow-x-auto overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 200px)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {/* Swimlane wrapper */}
          <div style={{ minWidth: "1400px" }}>
            {/* Phase Headers Row */}
            <div
              ref={headersRef}
              className="grid sticky top-0 z-10"
              style={{
                gridTemplateColumns: "200px repeat(6, 1fr)",
                gap: "10px",
                paddingBottom: "10px",
                background: "#0B0F19",
              }}
            >
              <div /> {/* Empty corner cell */}
              {phaseOrder.map((phase) => {
                const short = phaseShortNames[phase as Phase];
                const num = phaseNumbers[phase as Phase];
                return (
                  <div
                    key={phase}
                    className="phase-header"
                    style={{
                      background: "linear-gradient(135deg, #1e6f5c, #2c9b7c)",
                      borderRadius: "12px",
                      padding: "14px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.7)",
                        marginTop: "2px",
                      }}
                    >
                      {short}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Swimlane Rows */}
            <div ref={rowsRef}>
              {fullAgents.map((agent, agentIdx) => {
                const phaseIdx = phaseOrder.indexOf(
                  agent.phase as Phase
                );

                return (
                  <div
                    key={agent.step}
                    className="grid"
                    style={{
                      gridTemplateColumns: "200px repeat(6, 1fr)",
                      gap: "10px",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    {/* Agent Label */}
                    <div
                      className="agent-lane-label"
                      style={{
                        background: "rgba(240,247,244,0.05)",
                        border: "2px solid rgba(30,111,92,0.4)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        fontWeight: 600,
                        color: "#2DD4A8",
                        fontSize: "12px",
                        wordBreak: "break-word",
                        lineHeight: 1.35,
                      }}
                    >
                      {agent.name}
                    </div>

                    {/* Cells */}
                    {Array.from({ length: 6 }, (_, colIdx) => {
                      if (colIdx === phaseIdx) {
                        const inputShort =
                          agent.input.length > 90
                            ? agent.input.substring(0, 87) + "..."
                            : agent.input;
                        const opShort =
                          agent.agentOpSummary.length > 90
                            ? agent.agentOpSummary.substring(0, 87) + "..."
                            : agent.agentOpSummary;
                        const outputShort =
                          agent.output.length > 90
                            ? agent.output.substring(0, 87) + "..."
                            : agent.output;

                        return (
                          <div
                            key={colIdx}
                            className="swimlane-cell-active"
                            onClick={() => handleCellClick(agentIdx)}
                            style={{
                              background: "#121929",
                              border: "1px solid rgba(45,212,168,0.3)",
                              borderRadius: "14px",
                              padding: "14px",
                              minHeight: "180px",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget;
                              el.style.transform = "translateY(-4px)";
                              el.style.boxShadow =
                                "0 12px 40px rgba(45,212,168,0.15)";
                              el.style.borderColor = "#2DD4A8";
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget;
                              el.style.transform = "translateY(0)";
                              el.style.boxShadow = "none";
                              el.style.borderColor =
                                "rgba(45,212,168,0.3)";
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#2DD4A8",
                              }}
                            >
                              {agent.step}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#F0F2F5",
                                lineHeight: 1.25,
                              }}
                            >
                              {agent.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8B95A8",
                                lineHeight: 1.4,
                              }}
                            >
                              <span
                                style={{
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: "rgba(91,141,239,0.15)",
                                  color: "#5B8DEF",
                                  display: "inline-block",
                                  marginRight: "6px",
                                  marginBottom: "4px",
                                }}
                              >
                                INPUT
                              </span>
                              {inputShort}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8B95A8",
                                lineHeight: 1.4,
                              }}
                            >
                              <span
                                style={{
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: "rgba(212,168,67,0.15)",
                                  color: "#D4A843",
                                  display: "inline-block",
                                  marginRight: "6px",
                                  marginBottom: "4px",
                                }}
                              >
                                AGENTIC OP
                              </span>
                              {opShort}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8B95A8",
                                lineHeight: 1.4,
                              }}
                            >
                              <span
                                style={{
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: "rgba(45,212,168,0.15)",
                                  color: "#2DD4A8",
                                  display: "inline-block",
                                  marginRight: "6px",
                                  marginBottom: "4px",
                                }}
                              >
                                OUTPUT
                              </span>
                              {outputShort}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={colIdx}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px dashed rgba(255,255,255,0.06)",
                            borderRadius: "14px",
                            minHeight: "180px",
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
