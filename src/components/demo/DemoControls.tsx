type DemoControlsProps = {
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  secondaryLabel: string;
  secondaryDisabled?: boolean;
  onSecondary: () => void;
  onExit: () => void;
};

export default function DemoControls({
  primaryLabel,
  primaryDisabled,
  onPrimary,
  secondaryLabel,
  secondaryDisabled,
  onSecondary,
  onExit,
}: DemoControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <button
        type="button"
        onClick={onExit}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#8B95A8",
          borderRadius: "999px",
          padding: "10px 14px",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Exit
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!!secondaryDisabled}
          onClick={onSecondary}
          style={{
            background: secondaryDisabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: secondaryDisabled ? "rgba(139,149,168,0.65)" : "#8B95A8",
            borderRadius: "999px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: secondaryDisabled ? "not-allowed" : "pointer",
            opacity: secondaryDisabled ? 0.7 : 1,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            if (secondaryDisabled) return;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 18px 50px rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          {secondaryLabel}
        </button>

        <button
          type="button"
          disabled={!!primaryDisabled}
          onClick={onPrimary}
          style={{
            background: primaryDisabled ? "rgba(212,168,67,0.15)" : "rgba(212,168,67,0.92)",
            border: "1px solid rgba(212,168,67,0.45)",
            color: primaryDisabled ? "rgba(212,168,67,0.8)" : "#0B0F19",
            borderRadius: "999px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: primaryDisabled ? "not-allowed" : "pointer",
            boxShadow: primaryDisabled ? "none" : "0 18px 50px rgba(212,168,67,0.18)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            opacity: primaryDisabled ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (primaryDisabled) return;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 24px 70px rgba(212,168,67,0.22)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = primaryDisabled
              ? "none"
              : "0 18px 50px rgba(212,168,67,0.18)";
          }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
