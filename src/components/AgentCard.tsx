import { forwardRef } from "react";
import type { Agent } from "@/data/agents";
import { phaseNumbers } from "@/data/agents";
import type { Phase } from "@/data/agents";

interface AgentCardProps {
  agent: Agent;
}

const comparisonConfig = [
  { key: "exclusive" as const, label: "AGENT EXCLUSIVE", color: "#E8784A" },
  { key: "sapStandard" as const, label: "Standard SAP", color: "#5B8DEF" },
  { key: "sapCustom" as const, label: "Custom SAP + Automation", color: "#7BA3F0" },
  { key: "d365Standard" as const, label: "Standard D365 BC", color: "#2DD4A8" },
  { key: "d365Custom" as const, label: "Custom D365 BC + Automation", color: "#4DDFB8" },
];

const AgentCard = forwardRef<HTMLDivElement, AgentCardProps>(({ agent }, ref) => {
  const phaseNum = phaseNumbers[agent.phase as Phase] || "";

  return (
    <div
      ref={ref}
      className="group"
      style={{
        background: "#121929",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)";
        el.style.borderColor = "rgba(212,168,67,0.2)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "rgba(255,255,255,0.06)";
      }}
    >
      {/* Card Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(30,111,92,0.3), rgba(44,155,124,0.15))",
          padding: "20px 24px",
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#F0F2F5",
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {agent.name}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              style={{
                background: "rgba(212,168,67,0.15)",
                color: "#D4A843",
                borderRadius: "20px",
                padding: "3px 12px",
                fontSize: "11px",
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {agent.step}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <span
            style={{
              background: "rgba(45,212,168,0.1)",
              color: "#2DD4A8",
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "11px",
              fontWeight: 500,
              display: "inline-block",
            }}
          >
            {phaseNum} · {agent.phase.replace(/^Phase \d+: /, "")}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "20px 24px" }}>
        {/* Input Block */}
        <div
          style={{
            background: "rgba(91,141,239,0.06)",
            borderLeft: "3px solid #5B8DEF",
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#5B8DEF",
              marginBottom: "6px",
            }}
          >
            INPUT
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#8B95A8",
              lineHeight: 1.5,
            }}
          >
            {agent.input}
          </p>
        </div>

        {/* Comparison Stack */}
        <div className="mt-4 flex flex-col gap-2">
          {comparisonConfig.map((cfg) => (
            <div
              key={cfg.key}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                padding: "12px 16px",
                borderLeft: `3px solid ${cfg.color}`,
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: cfg.color,
                  marginBottom: "4px",
                }}
              >
                {cfg.label}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#8B95A8",
                  lineHeight: 1.45,
                }}
              >
                {agent[cfg.key]}
              </p>
            </div>
          ))}
        </div>

        {/* Agent Operation Banner */}
        <div
          style={{
            marginTop: "16px",
            background:
              "linear-gradient(135deg, rgba(45,212,168,0.1), rgba(45,212,168,0.05))",
            borderRadius: "10px",
            padding: "12px 16px",
            borderLeft: "3px solid #2DD4A8",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#2DD4A8",
              marginBottom: "4px",
            }}
          >
            AGENTIC OPERATION
          </div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#2DD4A8",
              lineHeight: 1.45,
            }}
          >
            {agent.agentOpSummary}
          </p>
        </div>

        {/* Output Block */}
        <div
          style={{
            marginTop: "16px",
            background: "rgba(45,212,168,0.06)",
            borderLeft: "3px solid #2DD4A8",
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#2DD4A8",
              marginBottom: "6px",
            }}
          >
            OUTPUT
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#8B95A8",
              lineHeight: 1.5,
            }}
          >
            {agent.output}
          </p>
        </div>
      </div>
    </div>
  );
});

AgentCard.displayName = "AgentCard";
export default AgentCard;
