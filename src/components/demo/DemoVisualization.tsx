import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import type { Agent } from "@/data/agents";

type Variant =
  | "ingest"
  | "matrix"
  | "radar"
  | "network"
  | "timeline"
  | "invoice"
  | "kpi"
  | "match"
  | "routing"
  | "closure"
  | "audit";

function stepNumber(step: string) {
  const m = /Step\s+(\d+)/i.exec(step);
  return m ? Number(m[1]) : null;
}

function pickVariant(agent: Agent | null): Variant {
  if (!agent) return "network";
  const n = stepNumber(agent.step);
  if (n === 1) return "ingest";
  if (n === 2) return "matrix";
  if (n === 3) return "radar";
  if (n === 4 || n === 5) return "network";
  if (n === 6 || n === 7 || n === 8) return "timeline";
  if (n === 9) return "matrix";
  if (n === 10 || n === 11) return "invoice";
  if (n === 12) return "kpi";
  if (n === 13 || n === 14) return "match";
  if (n === 15) return "network";
  if (n === 16) return "routing";
  if (n === 17) return "radar";
  if (n === 18) return "closure";
  if (n === 19) return "audit";
  return "network";
}

function truncate(s: string, max: number) {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function neonGradient() {
  return "radial-gradient(700px 260px at 25% 40%, rgba(45,212,168,0.20), rgba(11,15,25,0.15) 55%, rgba(11,15,25,0.0) 100%)";
}

function GoldTag({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#D4A843",
        background: "rgba(212,168,67,0.12)",
        border: "1px solid rgba(212,168,67,0.28)",
        padding: "6px 10px",
        borderRadius: "999px",
        fontFamily: "'Geist Mono', monospace",
      }}
    >
      {children}
    </span>
  );
}

function CyanTag({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#2DD4A8",
        background: "rgba(45,212,168,0.10)",
        border: "1px solid rgba(45,212,168,0.22)",
        padding: "6px 10px",
        borderRadius: "999px",
        fontFamily: "'Geist Mono', monospace",
      }}
    >
      {children}
    </span>
  );
}

function GlassCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className="demo-holo-card"
      style={{
        background: "rgba(18,25,41,0.62)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "14px",
        padding: "10px 12px",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8B95A8",
          fontWeight: 800,
          fontFamily: "'Geist Mono', monospace",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#F0F2F5",
          fontWeight: 700,
          marginTop: "6px",
          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BasePanel({
  headerLeft,
  headerRight,
  children,
}: {
  headerLeft: React.ReactNode;
  headerRight: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "rgba(11,15,25,0.44)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        minHeight: "240px",
        boxShadow: "0 22px 70px rgba(0,0,0,0.40)",
      }}
    >
      <div
        className="demo-grid"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.22,
        }}
      />

      <div
        className="demo-neon"
        style={{
          position: "absolute",
          inset: 0,
          background: neonGradient(),
          opacity: 0.95,
        }}
      />

      <div
        className="demo-scanline"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "2px",
          background: "linear-gradient(90deg, rgba(45,212,168,0), rgba(45,212,168,0.9), rgba(212,168,67,0.55), rgba(45,212,168,0))",
          filter: "blur(0.2px)",
          opacity: 0.9,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "12px 12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">{headerLeft}</div>
          <div className="flex items-center gap-2 flex-wrap">{headerRight}</div>
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: "180px" }}>{children}</div>
      </div>
    </div>
  );
}

function SvgNetwork({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".demo-node",
        { opacity: 0.55, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.4, ease: "sine.inOut", stagger: 0.08, yoyo: true, repeat: -1 }
      );

      gsap.to(".demo-link", {
        strokeDashoffset: -220,
        duration: 2.6,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".demo-dot", {
        x: 320,
        duration: 2.4,
        ease: "none",
        repeat: -1,
        stagger: 0.25,
      });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  const accent = variant === "invoice" ? "#D4A843" : "#2DD4A8";

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(45,212,168,0.85)" />
          <stop offset="1" stopColor="rgba(212,168,67,0.65)" />
        </linearGradient>
        <radialGradient id="n1" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor={accent} stopOpacity="0.9" />
          <stop offset="1" stopColor={accent} stopOpacity="0.0" />
        </radialGradient>
      </defs>

      <g opacity="0.85">
        <path
          className="demo-link"
          d="M80 150 C170 70, 240 70, 320 115 C390 155, 440 170, 520 120"
          fill="none"
          stroke="url(#g1)"
          strokeWidth="2"
          strokeDasharray="10 10"
          strokeDashoffset="0"
        />
        <path
          className="demo-link"
          d="M80 90 C170 170, 260 180, 340 130 C410 90, 470 70, 520 95"
          fill="none"
          stroke="rgba(91,141,239,0.55)"
          strokeWidth="1.6"
          strokeDasharray="9 12"
          strokeDashoffset="0"
        />
      </g>

      {[
        { x: 80, y: 120 },
        { x: 200, y: 80 },
        { x: 320, y: 120 },
        { x: 420, y: 165 },
        { x: 520, y: 110 },
        { x: 260, y: 185 },
      ].map((p, i) => (
        <g key={i} className="demo-node">
          <circle cx={p.x} cy={p.y} r="18" fill="url(#n1)" />
          <circle cx={p.x} cy={p.y} r="5" fill={accent} opacity="0.95" />
          <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={accent} opacity="0.35" />
        </g>
      ))}

      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="demo-dot" transform={`translate(${20 + i * 60}, 0)`} opacity="0.85">
          <circle cx="80" cy="150" r="3" fill={accent} />
          <circle cx="80" cy="150" r="8" fill={accent} opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}

function SvgMatrix({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".demo-cell",
        { opacity: 0.25 },
        { opacity: 0.8, duration: 1.6, ease: "sine.inOut", stagger: 0.03, yoyo: true, repeat: -1 }
      );
      gsap.to(".demo-sweep", { x: 520, duration: 2.2, ease: "none", repeat: -1 });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="m1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0)" />
          <stop offset="0.5" stopColor="rgba(45,212,168,0.65)" />
          <stop offset="1" stopColor="rgba(212,168,67,0)" />
        </linearGradient>
      </defs>
      <g transform="translate(40,30)">
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => {
            const x = c * 50;
            const y = r * 30;
            return (
              <rect
                key={`${r}-${c}`}
                className="demo-cell"
                x={x}
                y={y}
                width="42"
                height="22"
                rx="6"
                fill="rgba(255,255,255,0.06)"
                stroke={c % 3 === 0 ? "rgba(45,212,168,0.25)" : "rgba(255,255,255,0.08)"}
              />
            );
          })
        )}
        <rect className="demo-sweep" x="0" y="0" width="70" height="180" fill="url(#m1)" opacity="0.55" />
      </g>
    </svg>
  );
}

function SvgRadar({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".demo-sweep", { rotate: 360, transformOrigin: "300px 120px", duration: 2.8, ease: "none", repeat: -1 });
      gsap.fromTo(
        ".demo-ring",
        { opacity: 0.25 },
        { opacity: 0.65, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 }
      );
      gsap.fromTo(
        ".demo-blip",
        { opacity: 0.15, scale: 0.8 },
        { opacity: 1, scale: 1.15, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.2 }
      );
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <radialGradient id="r1" cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor="rgba(45,212,168,0.30)" />
          <stop offset="1" stopColor="rgba(45,212,168,0.0)" />
        </radialGradient>
        <linearGradient id="r2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0.0)" />
          <stop offset="0.6" stopColor="rgba(45,212,168,0.50)" />
          <stop offset="1" stopColor="rgba(212,168,67,0.0)" />
        </linearGradient>
      </defs>

      <circle cx="300" cy="120" r="92" fill="url(#r1)" />
      {[30, 55, 78, 100].map((r, i) => (
        <circle key={i} className="demo-ring" cx="300" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.08)" />
      ))}
      <path d="M300 20 L300 220" stroke="rgba(255,255,255,0.06)" />
      <path d="M200 120 L400 120" stroke="rgba(255,255,255,0.06)" />

      <g className="demo-sweep">
        <path d="M300 120 L520 120" stroke="url(#r2)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <circle cx="520" cy="120" r="7" fill="#D4A843" opacity="0.7" />
      </g>

      {[
        { x: 252, y: 84 },
        { x: 332, y: 66 },
        { x: 355, y: 148 },
        { x: 270, y: 165 },
      ].map((p, i) => (
        <g key={i} className="demo-blip">
          <circle cx={p.x} cy={p.y} r="4" fill="#2DD4A8" />
          <circle cx={p.x} cy={p.y} r="12" fill="#2DD4A8" opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}

function SvgTimeline({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".demo-tick",
        { opacity: 0.35 },
        { opacity: 1, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 }
      );
      gsap.to(".demo-travel", { x: 520, duration: 2.4, ease: "none", repeat: -1, stagger: 0.25 });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="t1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0.75)" />
          <stop offset="0.7" stopColor="rgba(212,168,67,0.55)" />
          <stop offset="1" stopColor="rgba(45,212,168,0.18)" />
        </linearGradient>
      </defs>
      <path d="M60 150 L540 150" stroke="url(#t1)" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      {[60, 170, 280, 390, 540].map((x, i) => (
        <g key={i} className="demo-tick">
          <circle cx={x} cy="150" r="7" fill="#2DD4A8" opacity="0.8" />
          <circle cx={x} cy="150" r="18" fill="#2DD4A8" opacity="0.10" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="demo-travel" transform={`translate(${i * -120}, 0)`} opacity="0.85">
          <circle cx="60" cy="150" r="3" fill="#D4A843" />
          <circle cx="60" cy="150" r="10" fill="#D4A843" opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}

function SvgKpi({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".demo-bar", { scaleY: 1.25, transformOrigin: "50% 100%", duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.08 });
      gsap.to(".demo-kpi-scan", { y: 150, duration: 2.2, ease: "none", repeat: -1 });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="k1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(45,212,168,0.75)" />
          <stop offset="1" stopColor="rgba(45,212,168,0.12)" />
        </linearGradient>
        <linearGradient id="k2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0)" />
          <stop offset="0.5" stopColor="rgba(45,212,168,0.55)" />
          <stop offset="1" stopColor="rgba(212,168,67,0)" />
        </linearGradient>
      </defs>
      <rect x="60" y="50" width="480" height="150" rx="18" fill="rgba(18,25,41,0.48)" stroke="rgba(255,255,255,0.10)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} className="demo-bar" x={110 + i * 60} y={140 - i * 10} width="34" height={60 + i * 10} rx="10" fill="url(#k1)" opacity="0.9" />
      ))}
      <rect className="demo-kpi-scan" x="80" y="70" width="520" height="12" fill="url(#k2)" opacity="0.55" />
    </svg>
  );
}

function SvgMatch({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".demo-match-line", { strokeDashoffset: -260, duration: 2.4, ease: "none", repeat: -1, stagger: 0.15 });
      gsap.fromTo(".demo-match-node", { opacity: 0.55 }, { opacity: 1, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="a1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0.75)" />
          <stop offset="0.8" stopColor="rgba(212,168,67,0.55)" />
          <stop offset="1" stopColor="rgba(45,212,168,0.20)" />
        </linearGradient>
      </defs>
      <g opacity="0.95">
        <rect x="70" y="60" width="170" height="120" rx="16" fill="rgba(18,25,41,0.55)" stroke="rgba(45,212,168,0.25)" />
        <rect x="360" y="60" width="170" height="120" rx="16" fill="rgba(18,25,41,0.55)" stroke="rgba(91,141,239,0.22)" />
        <text x="155" y="92" textAnchor="middle" fill="#2DD4A8" fontSize="12" fontWeight="800">
          BANK
        </text>
        <text x="445" y="92" textAnchor="middle" fill="#5B8DEF" fontSize="12" fontWeight="800">
          INVOICES
        </text>
      </g>

      {[
        { y1: 115, y2: 115 },
        { y1: 135, y2: 150 },
        { y1: 155, y2: 130 },
      ].map((p, i) => (
        <path
          key={i}
          className="demo-match-line"
          d={`M240 ${p.y1} C290 ${p.y1 - 30}, 310 ${p.y2 + 30}, 360 ${p.y2}`}
          fill="none"
          stroke="url(#a1)"
          strokeWidth="2"
          strokeDasharray="10 12"
          strokeDashoffset="0"
          opacity="0.9"
        />
      ))}

      {[
        { x: 240, y: 115 },
        { x: 240, y: 135 },
        { x: 240, y: 155 },
        { x: 360, y: 115 },
        { x: 360, y: 150 },
        { x: 360, y: 130 },
      ].map((p, i) => (
        <g key={i} className="demo-match-node">
          <circle cx={p.x} cy={p.y} r="4" fill="#D4A843" opacity="0.95" />
          <circle cx={p.x} cy={p.y} r="14" fill="#D4A843" opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}

function SvgClosure({ variant }: { variant: Variant }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".demo-check",
        { opacity: 0.25, scale: 0.98 },
        { opacity: 1, scale: 1.02, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      gsap.to(".demo-close-scan", { x: 520, duration: 2.4, ease: "none", repeat: -1 });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <svg ref={ref} viewBox="0 0 600 240" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="c1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(45,212,168,0)" />
          <stop offset="0.5" stopColor="rgba(45,212,168,0.55)" />
          <stop offset="1" stopColor="rgba(212,168,67,0)" />
        </linearGradient>
      </defs>
      <rect x="70" y="55" width="460" height="130" rx="22" fill="rgba(18,25,41,0.50)" stroke="rgba(255,255,255,0.10)" />
      <g className="demo-check">
        <circle cx="160" cy="120" r="34" fill="rgba(45,212,168,0.14)" stroke="rgba(45,212,168,0.45)" />
        <path d="M145 120 L157 132 L178 108" fill="none" stroke="#2DD4A8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M220 120 L520 120" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <rect className="demo-close-scan" x="80" y="95" width="70" height="50" fill="url(#c1)" opacity="0.55" />
    </svg>
  );
}

export default function DemoVisualization({
  agent,
}: {
  agent: Agent | null;
}) {
  const variant = useMemo(() => pickVariant(agent), [agent]);
  const rootRef = useRef<HTMLDivElement>(null);

  const summaryLeft = agent
    ? truncate(agent.agentOpSummary, 58)
    : "Adaptive orchestration visuals.";
  const summaryRight = agent ? truncate(agent.output, 58) : "Context-aware.";

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(".demo-scanline", { y: 0 });
      gsap.to(".demo-scanline", { y: 220, duration: 2.8, ease: "none", repeat: -1 });
      gsap.fromTo(
        ".demo-holo-card",
        { y: 6, opacity: 0.75 },
        { y: 0, opacity: 1, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [variant]);

  const headerLeft = (
    <>
      <GoldTag>Visualization</GoldTag>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#8B95A8",
          fontFamily: "'Geist Mono', monospace",
        }}
      >
        Adaptive · Cinematic
      </span>
    </>
  );

  const headerRight = (
    <>
      <CyanTag>{variant}</CyanTag>
    </>
  );

  return (
    <div ref={rootRef} style={{ width: "100%" }}>
      <BasePanel headerLeft={headerLeft} headerRight={headerRight}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            padding: "12px",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <GlassCard title="AI Operation" value={summaryLeft} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}>
            <GlassCard title="Outcome" value={summaryRight} />
          </div>
        </div>

        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {variant === "ingest" && <SvgNetwork variant={variant} />}
          {variant === "network" && <SvgNetwork variant={variant} />}
          {variant === "invoice" && <SvgNetwork variant={variant} />}
          {variant === "matrix" && <SvgMatrix variant={variant} />}
          {variant === "radar" && <SvgRadar variant={variant} />}
          {variant === "timeline" && <SvgTimeline variant={variant} />}
          {variant === "kpi" && <SvgKpi variant={variant} />}
          {variant === "match" && <SvgMatch variant={variant} />}
          {variant === "routing" && <SvgNetwork variant={variant} />}
          {variant === "closure" && <SvgClosure variant={variant} />}
          {variant === "audit" && <SvgKpi variant={variant} />}
        </div>
      </BasePanel>
    </div>
  );
}

