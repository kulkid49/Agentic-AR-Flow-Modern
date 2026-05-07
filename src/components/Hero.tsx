import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleCanvas from "./ParticleCanvas";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade hero on scroll
      gsap.to(heroRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "50% top",
          scrub: true,
        },
      });

      // Label entrance
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );

      // Title word-by-word entrance
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll(".hero-word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            delay: 0.5,
            ease: "power3.out",
          }
        );
      }

      // Subtitle entrance
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.0, ease: "power3.out" }
      );

      // Arrow entrance + continuous bob
      gsap.fromTo(
        arrowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 1.5, ease: "power2.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "linear-gradient(180deg, rgba(11,15,25,0.3) 0%, rgba(11,15,25,0.85) 70%, #0B0F19 100%)",
        }}
      />

      {/* Particle Canvas */}
      <ParticleCanvas />

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 2, height: "100%" }}
      >
        <div
          ref={labelRef}
          className="opacity-0 mb-6"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#D4A843",
            fontFamily: "'Geist Sans', sans-serif",
          }}
        >
          AUTONOMOUS MULTI-AGENT FINANCE
        </div>

        <h1
          ref={titleRef}
          className="font-light"
          style={{
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#F0F2F5",
          }}
        >
          <span
            className="hero-word inline-block opacity-0"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            Agentic AI
          </span>
          <br />
          <span
            className="hero-word inline-block opacity-0"
            style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              marginTop: "8px",
            }}
          >
            OTC-AR Journey
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="opacity-0 mt-6"
          style={{
            fontSize: "16px",
            fontWeight: 400,
            color: "#8B95A8",
            maxWidth: "540px",
            lineHeight: 1.6,
          }}
        >
          18 autonomous agents · 6 business phases · SAP S/4HANA vs D365 BC
        </p>

        {/* Scroll Indicator */}
        <div
          ref={arrowRef}
          className="absolute bottom-10 opacity-0"
          style={{ animation: "chevronBob 2s ease-in-out infinite" }}
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            stroke="#8B95A8"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </section>
  );
}
