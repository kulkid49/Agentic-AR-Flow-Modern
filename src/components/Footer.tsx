import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="opacity-0"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "30px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "12px", color: "#8B95A8", lineHeight: 1.6 }}>
        Agent Exclusive = cannot be achieved by standard ERP modules nor custom
        automation. Swimlane click-through enabled.
      </p>
      <p
        className="mt-2"
        style={{ fontSize: "11px", color: "rgba(139,149,168,0.5)" }}
      >
        Agentic AI · OTC-AR Journey Dashboard · Autonomous Multi-Agent Finance
      </p>
    </footer>
  );
}
