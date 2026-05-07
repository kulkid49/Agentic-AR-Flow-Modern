import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const legendItems = [
  { label: "Agent Exclusive", color: "#E8784A" },
  { label: "Standard SAP", color: "#5B8DEF" },
  { label: "Custom SAP", color: "#7BA3F0" },
  { label: "Standard D365", color: "#2DD4A8" },
  { label: "Custom D365", color: "#4DDFB8" },
];

interface LegendBarProps {
  variant?: "default" | "swimlane";
}

export default function LegendBar({ variant = "default" }: LegendBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: barRef.current,
            start: "top 95%",
          },
        }
      );
    }, barRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-x-6 gap-y-2 py-4 opacity-0"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "12px",
              color: "#8B95A8",
              fontWeight: 400,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
      {variant === "swimlane" && (
        <>
          <div className="flex items-center gap-2">
            <span
              className="inline-block"
              style={{
                padding: "2px 9px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(91,141,239,0.15)",
                color: "#5B8DEF",
              }}
            >
              INPUT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block"
              style={{
                padding: "2px 9px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(212,168,67,0.15)",
                color: "#D4A843",
              }}
            >
              AGENTIC OP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block"
              style={{
                padding: "2px 9px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(45,212,168,0.15)",
                color: "#2DD4A8",
              }}
            >
              OUTPUT
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "#8B95A8" }}>
            Click any box → jump to cards filtered by phase
          </span>
        </>
      )}
    </div>
  );
}
