import type { Agent, Phase } from "@/data/agents";
import { phaseNumbers } from "@/data/agents";

const comparisonConfig = [
  { key: "exclusive" as const, label: "AGENT EXCLUSIVE", color: "#E8784A" },
  { key: "sapStandard" as const, label: "Standard SAP", color: "#5B8DEF" },
  { key: "sapCustom" as const, label: "Custom SAP + Automation", color: "#7BA3F0" },
  { key: "d365Standard" as const, label: "Standard D365 BC", color: "#2DD4A8" },
  { key: "d365Custom" as const, label: "Custom D365 BC + Automation", color: "#4DDFB8" },
];

export default function DemoSceneCard({ agent }: { agent: Agent }) {
  const phaseNum = phaseNumbers[agent.phase as Phase] || "";

  return (
    <div
      style={{
        background: "rgba(18,25,41,0.92)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(30,111,92,0.34), rgba(44,155,124,0.12))",
          padding: "18px 20px",
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8B95A8",
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              {phaseNum} · {agent.phase.replace(/^Phase \d+: /, "")}
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#F0F2F5",
                lineHeight: 1.2,
                marginTop: "6px",
              }}
            >
              {agent.name}
            </div>
          </div>
          <span
            style={{
              background: "rgba(212,168,67,0.15)",
              color: "#D4A843",
              border: "1px solid rgba(212,168,67,0.32)",
              borderRadius: "999px",
              padding: "6px 12px",
              fontSize: "12px",
              fontFamily: "'Geist Mono', monospace",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {agent.step}
          </span>
        </div>
      </div>

      <div
        className="overflow-y-auto"
        style={{
          maxHeight: "60vh",
          padding: "18px 20px 20px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.14) transparent",
        }}
      >
        <div
          style={{
            background: "rgba(91,141,239,0.06)",
            borderLeft: "3px solid #5B8DEF",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5B8DEF",
              marginBottom: "6px",
            }}
          >
            Input
          </div>
          <div style={{ fontSize: "13px", color: "#8B95A8", lineHeight: 1.55 }}>
            {agent.input}
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
            background:
              "linear-gradient(135deg, rgba(45,212,168,0.10), rgba(45,212,168,0.05))",
            borderRadius: "10px",
            padding: "12px 14px",
            borderLeft: "3px solid #2DD4A8",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2DD4A8",
              marginBottom: "6px",
            }}
          >
            Agentic Operation
          </div>
          <div style={{ fontSize: "13px", color: "#2DD4A8", lineHeight: 1.55, fontWeight: 600 }}>
            {agent.agentOpSummary}
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
            background: "rgba(45,212,168,0.06)",
            borderLeft: "3px solid #2DD4A8",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2DD4A8",
              marginBottom: "6px",
            }}
          >
            Output
          </div>
          <div style={{ fontSize: "13px", color: "#8B95A8", lineHeight: 1.55 }}>
            {agent.output}
          </div>
        </div>

        <div className="mt-5" style={{ display: "grid", gap: "10px" }}>
          {comparisonConfig.map((cfg) => (
            <div
              key={cfg.key}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                padding: "12px 14px",
                borderLeft: `3px solid ${cfg.color}`,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: cfg.color,
                  marginBottom: "6px",
                }}
              >
                {cfg.label}
              </div>
              <div style={{ fontSize: "12px", color: "#8B95A8", lineHeight: 1.5 }}>
                {agent[cfg.key]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

