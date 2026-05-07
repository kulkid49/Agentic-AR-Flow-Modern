import { useMemo } from "react";
import type { Agent } from "@/data/agents";
import { phaseShortNames, phaseNumbers } from "@/data/agents";
import type { Phase } from "@/data/agents";

type PhaseGroup = { phase: string; start: number; end: number };

function buildPhaseGroups(agents: Agent[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  for (let i = 0; i < agents.length; i += 1) {
    const phase = agents[i]?.phase ?? "";
    const last = groups[groups.length - 1];
    if (!last || last.phase !== phase) {
      groups.push({ phase, start: i, end: i });
    } else {
      last.end = i;
    }
  }
  return groups;
}

export default function DemoHUD({
  agents,
  sceneIndex,
}: {
  agents: Agent[];
  sceneIndex: number;
}) {
  const total = agents.length;

  const groups = useMemo(() => buildPhaseGroups(agents), [agents]);
  const stepIndex = sceneIndex >= 0 && sceneIndex < total ? sceneIndex : null;
  const currentPhase = stepIndex !== null ? agents[stepIndex]?.phase ?? "" : "";

  const currentPhaseLabel = (() => {
    const p = currentPhase as Phase;
    if (!currentPhase) return "";
    return `${phaseNumbers[p] ?? ""} · ${phaseShortNames[p] ?? currentPhase}`;
  })();

  const currentGroup = useMemo(() => {
    if (stepIndex === null) return null;
    return groups.find((g) => stepIndex >= g.start && stepIndex <= g.end) ?? null;
  }, [groups, stepIndex]);

  const groupProgress = (() => {
    if (!currentGroup || stepIndex === null) return null;
    const idxInGroup = stepIndex - currentGroup.start + 1;
    const size = currentGroup.end - currentGroup.start + 1;
    return `${idxInGroup}/${size}`;
  })();

  return (
    <div
      className="w-full"
      style={{
        background: "rgba(11,15,25,0.6)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#D4A843",
            fontWeight: 600,
          }}
        >
          Agentic AI · OTC-AR · Walkthrough Demo
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {stepIndex === null ? (
            <span
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "999px",
                padding: "6px 10px",
                fontSize: "12px",
                color: "#8B95A8",
              }}
            >
              {sceneIndex < 0 ? "Intro" : "End"}
            </span>
          ) : (
            <>
              <span
                style={{
                  background: "rgba(212,168,67,0.12)",
                  border: "1px solid rgba(212,168,67,0.30)",
                  borderRadius: "999px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "#D4A843",
                  fontWeight: 600,
                }}
              >
                Step {stepIndex + 1}/{total}
              </span>
              <span
                style={{
                  background: "rgba(45,212,168,0.10)",
                  border: "1px solid rgba(45,212,168,0.26)",
                  borderRadius: "999px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "#2DD4A8",
                  fontWeight: 600,
                }}
              >
                {currentPhaseLabel}
              </span>
              {groupProgress && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "999px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    color: "#8B95A8",
                    fontWeight: 600,
                  }}
                >
                  Segment {groupProgress}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-6 min-w-max">
          {groups.map((g) => {
            const isActiveGroup = currentGroup?.phase === g.phase && stepIndex !== null;
            const startNum = g.start + 1;
            const endNum = g.end + 1;
            return (
              <div key={`${g.phase}-${g.start}`} className="flex items-center gap-2">
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: isActiveGroup ? "#F0F2F5" : "#8B95A8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {startNum}-{endNum}
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: g.end - g.start + 1 }, (_, i) => {
                    const idx = g.start + i;
                    const isActive = idx === stepIndex;
                    const isDone = stepIndex !== null && idx < stepIndex;
                    const bg = isActive ? "#D4A843" : isDone ? "rgba(45,212,168,0.9)" : "rgba(255,255,255,0.14)";
                    const ring = isActive ? "0 0 0 3px rgba(212,168,67,0.25)" : "none";
                    return (
                      <span
                        key={idx}
                        aria-hidden
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "999px",
                          background: bg,
                          boxShadow: ring,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
