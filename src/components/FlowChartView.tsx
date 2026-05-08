import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import TypewriterChars from "./flow/TypewriterChars";

type StepKind = "erp" | "agent" | "decision";

type FlowStep = {
  id: string;
  stepNo: number;
  phase: string;
  title: string;
  kind: StepKind;
  agentName?: string;
  details: string;
  decision?: {
    question: string;
    branches: Array<{ label: string; note: string; kind: "warning" | "success" | "error" }>;
  };
};

type NodeKind = "start" | "end" | StepKind | "branch";

type NodeSpec = {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  stepNo?: number;
  branchKind?: "warning" | "success" | "error";
};

type EdgeSpec = {
  id: string;
  from: string;
  to: string;
  dashed?: boolean;
};

function pathBetween(from: NodeSpec, to: NodeSpec) {
  const fromCenterX = from.x + from.w / 2;
  const fromCenterY = from.y + from.h / 2;
  const toCenterX = to.x + to.w / 2;
  const toCenterY = to.y + to.h / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  const fromBottom = { x: fromCenterX, y: from.y + from.h };
  const fromTop = { x: fromCenterX, y: from.y };
  const fromLeft = { x: from.x, y: fromCenterY };
  const fromRight = { x: from.x + from.w, y: fromCenterY };

  const toBottom = { x: toCenterX, y: to.y + to.h };
  const toTop = { x: toCenterX, y: to.y };
  const toLeft = { x: to.x, y: toCenterY };
  const toRight = { x: to.x + to.w, y: toCenterY };

  const mostlyVertical = Math.abs(dy) > Math.abs(dx) * 0.9;

  if (mostlyVertical) {
    const start = dy >= 0 ? fromBottom : fromTop;
    const end = dy >= 0 ? toTop : toBottom;
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  }

  const start = dx >= 0 ? fromRight : fromLeft;
  const end = dx >= 0 ? toLeft : toRight;
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

function clipText(s: string, max: number) {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "s1",
    stepNo: 1,
    phase: "Phase 1 – Customer Validation / Onboarding & PO Acceptance",
    title: "PO Receipt",
    kind: "agent",
    agentName: "Orchestrator + Extractor Agent",
    details:
      "Customer sends Purchase Order via email, EDI, or portal. Orchestrator & Extractor Agent captures unstructured document, extracts key data (Customer, Tax ID, material, quantity, delivery date, pricing) using NLP/OCR. Structured order data sent to ERP.",
  },
  {
    id: "s2",
    stepNo: 2,
    phase: "Phase 1 – Customer Validation / Onboarding & PO Acceptance",
    title: "Customer Master Check",
    kind: "agent",
    agentName: "Orchestrator + Customer Agent",
    details:
      "Agent queries ERP customer master and credit data via API. Existing customer: validates VAT, bank details, block status, credit limit; auto-corrects missing data. New customer: duplicate check using fuzzy logic; creates master record and sets initial credit limit. On failure, order is placed on hold and Sales notified.",
  },
  {
    id: "s3",
    stepNo: 3,
    phase: "Phase 1 – Customer Validation / Onboarding & PO Acceptance",
    title: "Credit Pre-Assessment",
    kind: "decision",
    agentName: "Credit Risk Agent",
    details:
      "Risk assessment based on order value, aging, payment history, and external credit bureau data. Updates credit exposure. High risk → order flagged for managerial approval; medium/low risk → continuation.",
    decision: {
      question: "Credit risk acceptable?",
      branches: [
        { label: "High risk", note: "Managerial approval", kind: "warning" },
        { label: "Medium/Low", note: "Continue processing", kind: "success" },
      ],
    },
  },
  {
    id: "s4",
    stepNo: 4,
    phase: "Phase 2 – Sales Order Processing",
    title: "Sales Order Creation",
    kind: "agent",
    agentName: "Orchestrator Agent",
    details:
      "Agent triggers Sales Order creation API. ERP automatically performs availability check, re-verifies credit, and determines final pricing. Returns Sales Order number and delivery schedule. If credit block occurs, Credit Agent resolves it.",
  },
  {
    id: "s5",
    stepNo: 5,
    phase: "Phase 2 – Sales Order Processing",
    title: "Order Confirmation",
    kind: "agent",
    agentName: "Orchestrator Agent",
    details:
      "Lifecycle status set to ‘Fulfilment Pending’. ERP output management sends order confirmation to customer via email/EDI.",
  },
  {
    id: "s6",
    stepNo: 6,
    phase: "Phase 3 – Fulfilment & Logistics",
    title: "Delivery Creation",
    kind: "agent",
    agentName: "Billing Agent (event subscriber)",
    details:
      "ERP creates delivery document (automatically or manually). ‘Delivery Created’ event pushes notification; Billing Agent subscribes and prepares for invoicing.",
  },
  {
    id: "s7",
    stepNo: 7,
    phase: "Phase 3 – Fulfilment & Logistics",
    title: "Picking & Packing",
    kind: "agent",
    agentName: "Monitoring Agent",
    details:
      "ERP generates warehouse transfer/picking instructions. Physical picking confirmed via RF scanners. Agent monitors completion status, ready to trigger next step.",
  },
  {
    id: "s8",
    stepNo: 8,
    phase: "Phase 3 – Fulfilment & Logistics",
    title: "Post Goods Issue (PGI)",
    kind: "agent",
    agentName: "Billing Agent (triggered)",
    details:
      "Goods issued in ERP. System debits Cost of Goods Sold, credits Inventory. ‘Goods Issue Posted’ event fires, triggering Billing Agent to start billing.",
  },
  {
    id: "s9",
    stepNo: 9,
    phase: "Phase 4 – Intelligent Billing",
    title: "Billing Pre-Validation",
    kind: "agent",
    agentName: "Billing Agent",
    details:
      "Retrieves Delivery, Sales Order, and Customer Master data. Validates quantity match, pricing completeness, tax correctness, Proof of Delivery (if needed), and no delivery blocks. Errors stop the flow and alert Sales/Logistics.",
  },
  {
    id: "s10",
    stepNo: 10,
    phase: "Phase 4 – Intelligent Billing",
    title: "Invoice Creation",
    kind: "agent",
    agentName: "Billing Agent",
    details:
      "Agent triggers invoice creation API. ERP debits Accounts Receivable, credits Revenue, creates open item in AR. Returns Invoice Number and Accounting Document Number.",
  },
  {
    id: "s11",
    stepNo: 11,
    phase: "Phase 4 – Intelligent Billing",
    title: "Invoice Dispatch",
    kind: "agent",
    agentName: "Reporting Agent (log)",
    details:
      "ERP output management sends invoice to customer via email/EDI. Agent logs ‘Sent’ status and starts aging clock for DSO calculation.",
  },
  {
    id: "s12",
    stepNo: 12,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Open Item Monitoring",
    kind: "agent",
    agentName: "Reporting Agent",
    details:
      "Reads open items and aging reports from ERP. Tracks DSO, overdue buckets, and high-risk customer exposure.",
  },
  {
    id: "s13",
    stepNo: 13,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Payment Receipt (Trigger)",
    kind: "erp",
    details:
      "Customer initiates bank transfer. Electronic bank statement is imported into ERP. ‘New Bank Statement’ event triggers Cash Application Agent.",
  },
  {
    id: "s14",
    stepNo: 14,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Cash Application",
    kind: "agent",
    agentName: "Cash Application Agent",
    details:
      "Parses payment reference (invoice/PO number). Applies fuzzy matching to open items. Exact match → post clearing; short payment → create dispute case; overpayment → park to suspense account; no match → temporary suspense. Posts clearing document via API.",
  },
  {
    id: "s15",
    stepNo: 15,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Dispute Handling (If Deduction)",
    kind: "decision",
    agentName: "Dispute Agent",
    details:
      "Creates dispute case in ERP. Analyzes Sales Order, Delivery, Pricing. Valid deduction → issue credit memo; invalid → notify Collections team for full collection.",
    decision: {
      question: "Deduction valid?",
      branches: [
        { label: "Valid", note: "Issue credit memo", kind: "success" },
        { label: "Invalid", note: "Escalate to collections", kind: "error" },
      ],
    },
  },
  {
    id: "s16",
    stepNo: 16,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Dunning & Collections",
    kind: "agent",
    agentName: "Collections Agent",
    details:
      "Evaluates aging bucket, risk score, and payment history. Sends dunning letters or personalised reminders to high-priority customers.",
  },
  {
    id: "s17",
    stepNo: 17,
    phase: "Phase 5 – Accounts Receivable Automation",
    title: "Continuous Credit Monitoring",
    kind: "agent",
    agentName: "Credit Risk Agent",
    details:
      "Monitors live credit exposure, aging trends, and payment patterns. Dynamically updates credit master records and blocks future orders if risk thresholds are breached.",
  },
  {
    id: "s18",
    stepNo: 18,
    phase: "Phase 6 – Payment & Closure",
    title: "Invoice Fully Cleared",
    kind: "agent",
    agentName: "Orchestrator Agent",
    details:
      "Invoice marked as fully cleared in ERP. Agent sets lifecycle stage to ‘CLOSED’ and updates KPIs: DSO, Collection Efficiency, Customer Risk Score.",
  },
  {
    id: "s19",
    stepNo: 19,
    phase: "Phase 6 – Payment & Closure",
    title: "Bank Reconciliation",
    kind: "agent",
    agentName: "Reporting Agent",
    details:
      "Bank account reconciled in ERP. Agent updates dashboards and logs audit trail. End of flow.",
  },
];

function nodeStyle(kind: NodeKind, branchKind?: "warning" | "success" | "error") {
  if (kind === "start") return { fill: "#15803D", stroke: "rgba(21,128,61,0.55)", text: "#ECFDF5" };
  if (kind === "end") return { fill: "#B91C1C", stroke: "rgba(185,28,28,0.55)", text: "#FEF2F2" };
  if (kind === "erp") return { fill: "rgba(148,163,184,0.16)", stroke: "rgba(255,255,255,0.14)", text: "#F0F2F5" };
  if (kind === "agent") return { fill: "url(#agentGrad)", stroke: "rgba(30,58,138,0.55)", text: "#F0F2F5" };
  if (kind === "decision") return { fill: "rgba(180,83,9,0.10)", stroke: "rgba(180,83,9,0.9)", text: "#F0F2F5" };
  if (kind === "branch") {
    const palette =
      branchKind === "success"
        ? { fill: "rgba(21,128,61,0.12)", stroke: "rgba(21,128,61,0.55)" }
        : branchKind === "warning"
          ? { fill: "rgba(180,83,9,0.10)", stroke: "rgba(180,83,9,0.70)" }
          : { fill: "rgba(185,28,28,0.10)", stroke: "rgba(185,28,28,0.70)" };
    return { ...palette, text: "#8B95A8" };
  }
  return { fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.12)", text: "#F0F2F5" };
}

export default function FlowChartView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [started, setStarted] = useState(false);
  const [revealStepNo, setRevealStepNo] = useState<number>(0);
  const [animating, setAnimating] = useState(false);
  const [typedDone, setTypedDone] = useState(true);
  const [showOnlyAgentSteps, setShowOnlyAgentSteps] = useState(false);
  const [zoom, setZoom] = useState(0.82);

  const steps = FLOW_STEPS;

  const { nodesAll, edgesAll, endNodeId, pathNodeIdsAll } = useMemo(() => {
    const nodes: NodeSpec[] = [];
    const edges: EdgeSpec[] = [];

    const startNode: NodeSpec = {
      id: "start",
      kind: "start",
      label: "START",
      x: 420,
      y: 40,
      w: 360,
      h: 56,
    };
    nodes.push(startNode);

    const nodeW = 420;
    const nodeH = 66;
    const leftX = 120;
    const rightX = 660;
    const topY = 140;
    const rowGap = 120;

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = col === 0 ? leftX : rightX;
      const y = topY + row * rowGap;
      const base: NodeSpec = {
        id: step.id,
        kind: step.kind,
        label: `Step ${step.stepNo}: ${step.title}`,
        sublabel: step.agentName,
        x,
        y,
        w: nodeW,
        h: nodeH,
        stepNo: step.stepNo,
      };
      nodes.push(base);

      if (step.decision) {
        const b1 = step.decision.branches[0];
        const b2 = step.decision.branches[1];
        nodes.push({
          id: `${step.id}-b1`,
          kind: "branch",
          label: `${b1.label}: ${b1.note}`,
          x: x - 80,
          y: y + 92,
          w: 300,
          h: 54,
          stepNo: step.stepNo,
          branchKind: b1.kind,
        });
        nodes.push({
          id: `${step.id}-b2`,
          kind: "branch",
          label: `${b2.label}: ${b2.note}`,
          x: x + 200,
          y: y + 92,
          w: 300,
          h: 54,
          stepNo: step.stepNo,
          branchKind: b2.kind,
        });

        edges.push({ id: `${step.id}-to-b1`, from: step.id, to: `${step.id}-b1`, dashed: true });
        edges.push({ id: `${step.id}-to-b2`, from: step.id, to: `${step.id}-b2`, dashed: true });
      }

      if (i === 0) edges.push({ id: "start-to-s1", from: "start", to: step.id });
      if (i > 0) edges.push({ id: `${steps[i - 1].id}-to-${step.id}`, from: steps[i - 1].id, to: step.id });
    }

    const last = steps[steps.length - 1];
    const endNode: NodeSpec = {
      id: "end",
      kind: "end",
      label: "END",
      x: 420,
      y: (nodes.find((n) => n.id === last.id)?.y ?? 0) + 180,
      w: 360,
      h: 56,
    };
    nodes.push(endNode);
    edges.push({ id: `${last.id}-to-end`, from: last.id, to: "end" });

    const pathNodeIds = ["start", ...steps.map((s) => s.id), "end"];
    return { nodesAll: nodes, edgesAll: edges, endNodeId: "end", pathNodeIdsAll: pathNodeIds };
  }, [steps]);

  const allowedNode = (node: NodeSpec) => {
    if (!showOnlyAgentSteps) return true;
    if (node.kind === "start" || node.kind === "end") return true;
    if (node.kind === "decision") return true;
    if (node.kind === "agent") return true;
    if (node.kind === "branch") return true;
    return false;
  };

  const revealedNodes = useMemo(() => {
    if (!started) return new Set<string>();
    const ids = new Set<string>();

    const target = Math.min(revealStepNo, steps.length + 1);
    for (let i = 0; i < pathNodeIdsAll.length; i += 1) {
      const id = pathNodeIdsAll[i];
      if (id === "start") {
        ids.add("start");
        continue;
      }
      if (id === endNodeId) {
        if (target >= steps.length + 1) ids.add(endNodeId);
        continue;
      }
      const step = steps.find((s) => s.id === id);
      if (step && step.stepNo <= target) ids.add(id);
    }

    for (const step of steps) {
      if (step.decision && ids.has(step.id)) {
        ids.add(`${step.id}-b1`);
        ids.add(`${step.id}-b2`);
      }
    }

    return ids;
  }, [started, revealStepNo, steps, pathNodeIdsAll, endNodeId]);

  const visibleNodes = useMemo(() => {
    const list = nodesAll.filter((n) => revealedNodes.has(n.id) && allowedNode(n));
    return list;
  }, [nodesAll, revealedNodes, showOnlyAgentSteps]);

  const nodeById = useMemo(() => {
    const map = new Map<string, NodeSpec>();
    for (const n of nodesAll) map.set(n.id, n);
    return map;
  }, [nodesAll]);

  const visibleEdges = useMemo(() => {
    const edges: EdgeSpec[] = [];

    const visibleSet = new Set(visibleNodes.map((n) => n.id));
    for (const e of edgesAll) {
      if (!visibleSet.has(e.from) || !visibleSet.has(e.to)) continue;
      edges.push(e);
    }

    if (!showOnlyAgentSteps) return edges;

    const pathVisible = pathNodeIdsAll.filter((id) => visibleSet.has(id) && allowedNode(nodeById.get(id)!));
    const simplified: EdgeSpec[] = [];
    for (let i = 1; i < pathVisible.length; i += 1) {
      simplified.push({ id: `simp-${pathVisible[i - 1]}-to-${pathVisible[i]}`, from: pathVisible[i - 1], to: pathVisible[i] });
    }

    for (const e of edges) {
      if (e.dashed) simplified.push(e);
    }

    return simplified;
  }, [visibleNodes, edgesAll, showOnlyAgentSteps, pathNodeIdsAll, nodeById]);

  const currentStep = useMemo(() => {
    if (!started) return null;
    if (revealStepNo <= 0) return null;
    if (revealStepNo > steps.length) return null;
    return steps[revealStepNo - 1] ?? null;
  }, [started, revealStepNo, steps]);

  const canAdvance = started && !animating && typedDone;
  const isDone = started && revealStepNo >= steps.length + 1;

  useEffect(() => {
    if (!started) return;
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".flow-ambient", { opacity: 0.75, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, svgRef);
    return () => ctx.revert();
  }, [started]);

  const animateReveal = (nodeId: string, edgeId: string | null) => {
    if (!svgRef.current) return;
    const node = svgRef.current.querySelector(`[data-node="${nodeId}"]`);
    if (node) {
      gsap.fromTo(
        node,
        { opacity: 0, scale: 0.9, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    }

    if (edgeId) {
      const edge = svgRef.current.querySelector(`[data-edge="${edgeId}"]`) as SVGPathElement | null;
      if (edge) {
        const length = edge.getTotalLength();
        edge.style.strokeDasharray = `${length}`;
        edge.style.strokeDashoffset = `${length}`;
        gsap.to(edge, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" });
      }
    }
  };

  const startFlow = () => {
    if (started) return;
    setStarted(true);
    setRevealStepNo(1);
    setAnimating(true);
    setTypedDone(false);

    requestAnimationFrame(() => {
      animateReveal("start", null);
      animateReveal("s1", "start-to-s1");
      setAnimating(false);
    });
  };

  const advance = () => {
    if (!canAdvance) return;
    setAnimating(true);
    setTypedDone(false);

    const next = revealStepNo + 1;
    setRevealStepNo(next);

    requestAnimationFrame(() => {
      if (next === steps.length + 1) {
        const last = steps[steps.length - 1];
        animateReveal("end", `${last.id}-to-end`);
        setAnimating(false);
        setTypedDone(true);
        return;
      }

      const step = steps[next - 1];
      const prev = steps[next - 2];
      const edgeId = prev ? `${prev.id}-to-${step.id}` : "start-to-s1";
      animateReveal(step.id, edgeId);
      if (step.decision) {
        animateReveal(`${step.id}-b1`, `${step.id}-to-b1`);
        animateReveal(`${step.id}-b2`, `${step.id}-to-b2`);
      }
      setAnimating(false);
    });
  };

  const restart = () => {
    setStarted(false);
    setRevealStepNo(0);
    setAnimating(false);
    setTypedDone(true);
  };

  const svgHeight = useMemo(() => {
    const lastNode = nodesAll.find((n) => n.id === "end");
    return (lastNode?.y ?? 1400) + 120;
  }, [nodesAll]);

  const viewTransform = useMemo(() => {
    const z = Math.max(0.6, Math.min(1.1, zoom));
    const dx = (1200 * (1 - z)) / 2;
    return `translate(${dx} 0) scale(${z})`;
  }, [zoom]);

  return (
    <div className="animate-fadeIn">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-16">
        <div
          style={{
            background: "rgba(18,25,41,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between gap-3 flex-wrap"
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(11,15,25,0.65)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#D4A843",
                    fontWeight: 700,
                  }}
                >
                  Generalized Order-to-Cash Process – Agentic AI Flow
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: "#8B95A8", fontWeight: 600 }}>
                  Interactive OTC + AR flow · 19 steps · enterprise-grade visualization
                </div>
              </div>

              <div
                className="flex items-center gap-3"
                style={{
                  height: "30px",
                  background: "rgba(11,15,25,0.60)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "999px",
                  padding: "0 10px",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  maxWidth: "860px",
                }}
              >
                <div
                  className="flex items-center gap-3 overflow-x-auto"
                  style={{ scrollbarWidth: "none", whiteSpace: "nowrap" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 14,
                        height: 9,
                        borderRadius: 4,
                        background: "rgba(148,163,184,0.18)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                      ERP
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 14,
                        height: 9,
                        borderRadius: 4,
                        background: "linear-gradient(135deg, rgba(30,58,138,0.85), rgba(15,118,110,0.65))",
                        border: "1px solid rgba(30,58,138,0.55)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                      Agent
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        transform: "rotate(45deg)",
                        background: "rgba(180,83,9,0.10)",
                        border: "1px solid rgba(180,83,9,0.9)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                      Decision
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 14,
                        height: 9,
                        borderRadius: 999,
                        background: "#15803D",
                        border: "1px solid rgba(21,128,61,0.55)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                      Start
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 14,
                        height: 9,
                        borderRadius: 999,
                        background: "#B91C1C",
                        border: "1px solid rgba(185,28,28,0.55)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                      End
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span style={{ fontSize: "11px", color: "#8B95A8", fontWeight: 700 }}>
                    Agents only
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOnlyAgentSteps((v) => !v)}
                    style={{
                      width: 40,
                      height: 20,
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: showOnlyAgentSteps ? "rgba(45,212,168,0.18)" : "rgba(255,255,255,0.06)",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    aria-pressed={showOnlyAgentSteps}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: showOnlyAgentSteps ? 20 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: showOnlyAgentSteps ? "#2DD4A8" : "rgba(255,255,255,0.30)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.05) * 100) / 100))}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "#F0F2F5",
                      borderRadius: "10px",
                      padding: "9px 10px",
                      fontSize: "12px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(0.82)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "#8B95A8",
                      borderRadius: "10px",
                      padding: "9px 10px",
                      fontSize: "12px",
                      fontWeight: 900,
                      cursor: "pointer",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.1, Math.round((z + 0.05) * 100) / 100))}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "#F0F2F5",
                      borderRadius: "10px",
                      padding: "9px 10px",
                      fontSize: "12px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>

                {!started && (
                  <button
                    type="button"
                    onClick={startFlow}
                    style={{
                      background: "rgba(212,168,67,0.92)",
                      border: "1px solid rgba(212,168,67,0.45)",
                      color: "#0B0F19",
                      borderRadius: "999px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Start
                  </button>
                )}

                {started && !isDone && (
                  <button
                    type="button"
                    disabled={!canAdvance}
                    onClick={advance}
                    style={{
                      background: canAdvance ? "rgba(212,168,67,0.92)" : "rgba(212,168,67,0.14)",
                      border: "1px solid rgba(212,168,67,0.45)",
                      color: canAdvance ? "#0B0F19" : "rgba(212,168,67,0.7)",
                      borderRadius: "999px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: canAdvance ? "pointer" : "not-allowed",
                      opacity: canAdvance ? 1 : 0.8,
                    }}
                  >
                    Next
                  </button>
                )}

                {isDone && (
                  <button
                    type="button"
                    onClick={restart}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "#F0F2F5",
                      borderRadius: "999px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Restart
                  </button>
                )}
              </div>

            </div>
          </div>

          <div
            ref={containerRef}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(11,15,25,0.6), rgba(11,15,25,0.35))",
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(11,15,25,0.45)",
                overflow: "auto",
                maxHeight: "calc(100vh - 320px)",
              }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 1200 ${svgHeight}`}
                width="100%"
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient id="agentGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="rgba(30,58,138,0.92)" />
                    <stop offset="1" stopColor="rgba(15,118,110,0.75)" />
                  </linearGradient>
                  <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feColorMatrix
                      in="b"
                      type="matrix"
                      values="
                        0 0 0 0 0.18
                        0 0 0 0 0.83
                        0 0 0 0 0.66
                        0 0 0 0.55 0"
                    />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L9,3 L0,6 Z" fill="rgba(45,212,168,0.85)" />
                  </marker>
                </defs>

                <g transform={viewTransform}>
                  <rect x="0" y="0" width="1200" height={svgHeight} fill="rgba(0,0,0,0)" />
                  <g className="flow-ambient" opacity="0.55">
                    {Array.from({ length: 28 }, (_, i) => (
                      <circle
                        key={i}
                        cx={80 + (i * 37) % 1040}
                        cy={90 + ((i * 71) % (svgHeight - 200))}
                        r={1 + (i % 3)}
                        fill="rgba(45,212,168,0.14)"
                      />
                    ))}
                  </g>

                  <g>
                    {visibleEdges.map((e) => {
                      const from = nodeById.get(e.from)!;
                      const to = nodeById.get(e.to)!;
                      const d = pathBetween(from, to);
                      return (
                        <path
                          key={e.id}
                          data-edge={e.id}
                          d={d}
                          fill="none"
                          stroke={e.dashed ? "rgba(180,83,9,0.55)" : "rgba(45,212,168,0.85)"}
                          strokeWidth={e.dashed ? 2 : 2.4}
                          strokeDasharray={e.dashed ? "8 10" : undefined}
                          markerEnd="url(#arrowHead)"
                          opacity={1}
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </g>

                  <g>
                    {visibleNodes.map((n) => {
                    const st = nodeStyle(n.kind, n.branchKind);
                    const isDecision = n.kind === "decision";
                    const isAgent = n.kind === "agent";
                    const baseOpacity = started ? 1 : 0;
                    const label = n.label;
                    const sub = n.sublabel;

                    if (isDecision) {
                      const cx = n.x + n.w / 2;
                      const cy = n.y + n.h / 2;
                      const w = 120;
                      const h = 120;
                      const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
                      return (
                        <g key={n.id} data-node={n.id} opacity={baseOpacity} style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
                          <polygon
                            points={points}
                            fill={st.fill}
                            stroke={st.stroke}
                            strokeWidth="2.4"
                            vectorEffect="non-scaling-stroke"
                          />
                          <text x={cx} y={cy - 10} textAnchor="middle" fill="#F0F2F5" fontSize="12" fontWeight="800">
                            {`Step ${n.stepNo}`}
                          </text>
                          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(212,168,67,0.95)" fontSize="18" fontWeight="900">
                            ?
                          </text>
                          <text x={cx} y={cy + 34} textAnchor="middle" fill="rgba(240,242,245,0.75)" fontSize="10" fontWeight="700">
                            DECISION
                          </text>
                          <text x={cx} y={cy + 60} textAnchor="middle" fill="rgba(139,149,168,0.85)" fontSize="10" fontWeight="650">
                            {clipText(n.label.replace(/^Step \d+:\s*/, ""), 18)}
                          </text>
                        </g>
                      );
                    }

                    const rx = n.kind === "start" || n.kind === "end" ? 999 : 16;
                    return (
                      <g key={n.id} data-node={n.id} opacity={baseOpacity} style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
                        <rect
                          x={n.x}
                          y={n.y}
                          width={n.w}
                          height={n.h}
                          rx={rx}
                          fill={st.fill}
                          stroke={st.stroke}
                          strokeWidth="1.8"
                          filter={isAgent ? "url(#glowCyan)" : undefined}
                          vectorEffect="non-scaling-stroke"
                        />

                        {isAgent && (
                          <g transform={`translate(${n.x + 14}, ${n.y + 18})`} opacity="0.95">
                            <path
                              d="M8 2h6l1 3 3 1v6l-3 1-1 3H8l-1-3-3-1V6l3-1 1-3Z"
                              fill="rgba(255,255,255,0.10)"
                              stroke="rgba(240,242,245,0.55)"
                              strokeWidth="1.2"
                            />
                            <circle cx="11" cy="9" r="2.6" fill="rgba(45,212,168,0.85)" />
                          </g>
                        )}

                        <text
                          x={n.x + (isAgent ? 44 : 16)}
                          y={n.y + 26}
                          fill={st.text}
                          fontSize="12"
                          fontWeight="900"
                        >
                          {label}
                        </text>
                        {sub && (
                          <text x={n.x + (isAgent ? 44 : 16)} y={n.y + 46} fill="rgba(139,149,168,0.92)" fontSize="11" fontWeight="650">
                            {clipText(sub, 42)}
                          </text>
                        )}

                        {n.kind === "branch" && (
                          <text x={n.x + 16} y={n.y + 36} fill="rgba(240,242,245,0.72)" fontSize="11" fontWeight="700">
                            {clipText(n.label, 44)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
                </g>
              </svg>
            </div>

            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  background: "rgba(11,15,25,0.65)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "12px 14px",
                }}
              >
                {!started ? (
                  <div style={{ color: "#8B95A8", fontWeight: 650, fontSize: "13px", lineHeight: 1.6 }}>
                    Click Start to begin. Each step will appear in sequence with animated connectors and a synchronized typewriter explanation.
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#D4A843",
                        fontWeight: 800,
                      }}
                    >
                      {currentStep ? `${currentStep.phase}` : "Flow Complete"}
                    </div>
                    <div style={{ marginTop: "8px", color: "#F0F2F5", fontWeight: 900, fontSize: "14px" }}>
                      {currentStep ? `Step ${currentStep.stepNo}: ${currentStep.title}` : "End"}
                    </div>
                    {currentStep?.agentName && (
                      <div style={{ marginTop: "6px", color: "#2DD4A8", fontWeight: 800, fontSize: "12px" }}>
                        Agent: {currentStep.agentName}
                      </div>
                    )}

                    <div style={{ marginTop: "10px" }}>
                      {currentStep ? (
                        <TypewriterChars
                          text={currentStep.details}
                          start={!typedDone}
                          charDelayMs={40}
                          className="text-sm"
                          onDone={() => setTypedDone(true)}
                        />
                      ) : (
                        <div style={{ color: "#8B95A8", fontWeight: 650, fontSize: "13px", lineHeight: 1.6 }}>
                          All steps are visible. Restart anytime to replay the sequence.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
