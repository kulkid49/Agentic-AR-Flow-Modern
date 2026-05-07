import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router";
import ParticleCanvas from "../components/ParticleCanvas";
import { fullAgents } from "@/data/agents";
import DemoHUD from "../components/demo/DemoHUD";
import DemoSceneCard from "../components/demo/DemoSceneCard";
import DemoControls from "../components/demo/DemoControls";
import TypewriterWords from "../components/demo/TypewriterWords";

type Segment = {
  key: string;
  text: string;
  wordDelayMs?: number;
  color?: string;
  weight?: number;
  size?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Demo() {
  const navigate = useNavigate();
  const agents = fullAgents;
  const total = agents.length;

  const [sceneIndex, setSceneIndex] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);
  const [typedStage, setTypedStage] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const isIntro = sceneIndex < 0;
  const isOutro = sceneIndex >= total;
  const stepIndex = !isIntro && !isOutro ? sceneIndex : null;
  const agent = stepIndex !== null ? agents[stepIndex] : null;

  const segments = useMemo<Segment[]>(() => {
    if (isIntro) {
      return [
        { key: "t1", text: "Agentic AI OTC-AR Walkthrough", wordDelayMs: 60, color: "#F0F2F5", weight: 800, size: 26 },
        { key: "t2", text: "Click Next to advance.", wordDelayMs: 70, color: "#8B95A8", weight: 600, size: 14 },
        { key: "t3", text: "Each scene shows the step, the inputs, the agentic operation, and the outcomes.", wordDelayMs: 65, color: "#8B95A8", weight: 600, size: 14 },
        { key: "t4", text: "Watch the full end-to-end journey across SAP S/4HANA and D365 BC contexts.", wordDelayMs: 65, color: "#8B95A8", weight: 600, size: 14 },
      ];
    }

    if (isOutro) {
      return [
        { key: "e1", text: "Journey Complete", wordDelayMs: 65, color: "#F0F2F5", weight: 900, size: 26 },
        { key: "e2", text: "You have reached the end of the OTC-to-AR automation story.", wordDelayMs: 70, color: "#8B95A8", weight: 600, size: 14 },
        { key: "e3", text: "Restart to watch again, or exit back to the main experience.", wordDelayMs: 70, color: "#8B95A8", weight: 600, size: 14 },
      ];
    }

    const a = agents[sceneIndex];
    const prev = sceneIndex > 0 ? agents[sceneIndex - 1] : null;
    const phaseTransition = prev && prev.phase !== a.phase;

    const base: Segment[] = [];
    if (phaseTransition) {
      base.push({
        key: "p0",
        text: `Entering ${a.phase}`,
        wordDelayMs: 55,
        color: "#2DD4A8",
        weight: 800,
        size: 14,
      });
    }

    base.push(
      { key: "s1", text: `${a.step}`, wordDelayMs: 55, color: "#D4A843", weight: 900, size: 18 },
      { key: "s2", text: `${a.name}`, wordDelayMs: 60, color: "#F0F2F5", weight: 800, size: 16 },
      { key: "s3", text: `Input: ${a.input}`, wordDelayMs: 55, color: "#8B95A8", weight: 600, size: 13 },
      { key: "s4", text: `Agentic Operation: ${a.agentOpSummary}`, wordDelayMs: 55, color: "#2DD4A8", weight: 700, size: 13 },
      { key: "s5", text: `Output: ${a.output}`, wordDelayMs: 55, color: "#8B95A8", weight: 600, size: 13 }
    );

    return base;
  }, [agents, isIntro, isOutro, sceneIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setTypedStage(0);

    if (!sceneRef.current) return;
    gsap.fromTo(
      sceneRef.current,
      { opacity: 0, y: 12, scale: 0.99 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
        onComplete: () => setTransitioning(false),
      }
    );
  }, [sceneIndex]);

  const primaryLabel = (() => {
    if (isIntro) return "Begin";
    if (isOutro) return "Restart";
    return sceneIndex === total - 1 ? "Finish" : "Next";
  })();

  const handleExit = () => {
    navigate("/");
  };

  const animateTo = (nextIndex: number, direction: "forward" | "back") => {
    if (transitioning) return;
    if (!sceneRef.current) return;

    setTransitioning(true);

    gsap.to(sceneRef.current, {
      opacity: 0,
      y: direction === "forward" ? -10 : 10,
      scale: 0.99,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setSceneIndex(clamp(nextIndex, -1, total));
      },
    });
  };

  const handlePrimary = () => {
    if (sceneIndex < 0) {
      animateTo(0, "forward");
      return;
    }
    if (sceneIndex >= total) {
      animateTo(-1, "forward");
      return;
    }
    animateTo(sceneIndex + 1, "forward");
  };

  const canGoBack = sceneIndex !== -1 && !transitioning;
  const handleBack = () => {
    if (!canGoBack) return;
    if (sceneIndex >= total) {
      animateTo(total - 1, "back");
      return;
    }
    animateTo(sceneIndex - 1, "back");
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100vh",
        background: "#0B0F19",
        color: "#F0F2F5",
        fontFamily: "'Geist Sans', 'Geist Variable', system-ui, -apple-system, sans-serif",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(45,212,168,0.15), rgba(11,15,25,0.85) 55%, #0B0F19 100%)",
        }}
      />

      <ParticleCanvas />

      <div
        className="relative"
        style={{
          zIndex: 2,
          minHeight: "100vh",
          padding: "22px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="max-w-[1400px] w-full mx-auto">
          <DemoHUD agents={agents} sceneIndex={sceneIndex} />
        </div>

        <div className="flex-1 flex items-center">
          <div
            ref={sceneRef}
            className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6"
            style={{ paddingTop: "18px", paddingBottom: "18px" }}
          >
            <div
              style={{
                background: "rgba(11,15,25,0.62)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                padding: "18px 18px",
                boxShadow: "0 26px 80px rgba(0,0,0,0.45)",
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "grid", gap: "10px" }}>
                {segments.map((seg, i) => (
                  <div
                    key={seg.key}
                    style={{
                      fontSize: seg.size ?? 14,
                      fontWeight: seg.weight ?? 600,
                      color: seg.color ?? "#8B95A8",
                      lineHeight: 1.55,
                    }}
                  >
                    <TypewriterWords
                      text={seg.text}
                      start={typedStage >= i}
                      wordDelayMs={seg.wordDelayMs}
                      caret={typedStage === i && !transitioning}
                      onDone={() => {
                        if (i === typedStage) setTypedStage(i + 1);
                      }}
                      className="block"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <DemoControls
                  primaryLabel={primaryLabel}
                  primaryDisabled={transitioning}
                  onPrimary={handlePrimary}
                  secondaryLabel="Back"
                  secondaryDisabled={!canGoBack}
                  onSecondary={handleBack}
                  onExit={handleExit}
                />
              </div>
            </div>

            <div>
              {agent ? (
                <DemoSceneCard agent={agent} />
              ) : (
                <div
                  style={{
                    background: "rgba(18,25,41,0.72)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "18px",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    minHeight: "360px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "22px",
                    boxShadow: "0 26px 80px rgba(0,0,0,0.45)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#D4A843",
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      Cinematic Mode
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "20px", fontWeight: 900, color: "#F0F2F5" }}>
                      {isIntro ? "The journey begins here." : "Thank you for watching."}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: 600, color: "#8B95A8" }}>
                      {isIntro ? "Click Begin to start Step 1." : "Click Restart to watch again."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
