"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Terminal,
  Code2,
  Check,
  Play,
  RotateCcw,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

// ── SPRING PHYSICS TOKENS (Emil Kowalski Standards) ───────────
const SPRING_TACTILE = { type: "spring" as const, stiffness: 450, damping: 25 };
const SPRING_CARD = { type: "spring" as const, stiffness: 380, damping: 26 };
const EASE_STANDARD: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── AUDIENCE DATA ──────────────────────────────────────────────
const audienceData: Record<string, { badge: string; title: string; desc: string; metrics: string[]; highlight: string }> = {
  developers: {
    badge: "Engineers & Solopreneurs",
    title: "Spend 90% more time building, zero hours on billing paperwork.",
    desc: "Auto-generate technical scope specs, milestone timelines, and sprint invoices directly from client briefs. No manual spreadsheet tracking.",
    metrics: ["15 hours saved per proposal", "Automated retainer invoices", "100% accurate time & scope tracking"],
    highlight: "I used to spend half my Sunday writing proposal docs. Now I generate tech scopes in 2 minutes and close $10k+ contracts on Monday.",
  },
  designers: {
    badge: "Designers & Creative Directors",
    title: "Present high-converting proposals that mirror your design standards.",
    desc: "Map visual portfolio projects directly to client RFPs. Create crisp, structured pitches with clear revision limits and upfront deposit terms.",
    metrics: ["40% higher proposal win rate", "Clean client sign-off terms", "Zero unpaid revision rounds"],
    highlight: "Clients respect clear scope boundaries. FreelAI gives my design agency the polish of a $100k firm.",
  },
  editors: {
    badge: "Video Editors & Animators",
    title: "Lock in deposits and revision limits before rendering frames.",
    desc: "Eliminate endless client revision requests. Link payment milestones directly to draft reviews and export client-ready contract terms.",
    metrics: ["100% upfront deposits secured", "Defined revision milestones", "Automated overdue reminders"],
    highlight: "No more sending final renders while waiting for payment. Every project milestone is backed by Stripe deposits.",
  },
  writers: {
    badge: "Copywriters & Content Strategists",
    title: "Convert raw client briefs into high-ticket content strategy proposals.",
    desc: "Format deliverables, research schedules, and content calendars into structured 3-tier options clients can choose from immediately.",
    metrics: ["Draft proposals in under 3 minutes", "94% client response rate", "Automated retainer renewals"],
    highlight: "Telling clients 'Basic vs Premium' tripled my average deal size. The 3-tier proposal generator paid for itself on day one.",
  },
  consultants: {
    badge: "Advisors & Strategic Consultants",
    title: "Structure advisory retainers and collect recurring fees on time.",
    desc: "Track hourly advisory allocations, send monthly retainer billing summaries, and maintain transparent client relationship metrics.",
    metrics: ["Automated monthly retainers", "Full pipeline visibility", "Professional client reporting"],
    highlight: "My advisory clients receive professional, itemized retainer summaries automatically every month.",
  },
  agencies: {
    badge: "Boutique Agencies & Studios",
    title: "Scale client operations without adding administrative headcount.",
    desc: "Manage multi-client project feeds, centralize team invoicing, and track overall settled revenue in a single high-precision cockpit.",
    metrics: ["Centralized client CRM", "Multi-seat team workspace", "$1M+ annual invoicing capacity"],
    highlight: "FreelAI is the central nervous system for our boutique agency. It handles proposals, CRM, and billing flawlessly.",
  },
};

// ── PROMPT PRESETS FOR LIVE HERO SIMULATOR ─────────────────────
const PROMPT_PRESETS = [
  {
    id: "saas",
    label: "Next.js SaaS Brief",
    title: "Proposal for Aether Capital",
    scope: "Full-Stack Next.js 15 App Architecture & Stripe Integration",
    deliverables: [
      "Deliverable 1: Design System & Component Audit",
      "Deliverable 2: Stripe Billing Webhooks & Auth Flow",
      "Deliverable 3: 8-Week Milestone Execution & QA",
    ],
    investment: "$12,000 USD (Fixed Fee)",
    score: "96%",
  },
  {
    id: "mobile",
    label: "Mobile App Audit",
    title: "Proposal for Horizon Health",
    scope: "iOS / Android React Native UX & Performance Audit",
    deliverables: [
      "Deliverable 1: Native Gesture & Frame Rate Optimization",
      "Deliverable 2: Offline Data Sync & Storage Architecture",
      "Deliverable 3: App Store Deployment & QA Checklist",
    ],
    investment: "$8,500 USD (Fixed Fee)",
    score: "94%",
  },
  {
    id: "retainer",
    label: "Advisory Retainer",
    title: "Proposal for Zenith Studio",
    scope: "Senior Fractional CTO & Technical Advisory Retainer",
    deliverables: [
      "Deliverable 1: Weekly Architecture & Code Reviews",
      "Deliverable 2: Emergency Production Outage Escort",
      "Deliverable 3: Monthly Developer Hiring Assessments",
    ],
    investment: "$5,000 USD / month (Retainer)",
    score: "98%",
  },
];

// ── HERO LIVE PROPOSAL SIMULATOR ───────────────────────────────
function HeroLiveProposalSimulator() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedPreset, setSelectedPreset] = useState(PROMPT_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<"md" | "json" | "tiers">("md");
  const [displayedScope, setDisplayedScope] = useState(selectedPreset.scope);
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    if (preset.id === selectedPreset.id) return;
    setSelectedPreset(preset);

    if (shouldReduceMotion) {
      setDisplayedScope(preset.scope);
      return;
    }

    setIsTyping(true);
    setDisplayedScope("");

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < preset.scope.length) {
        setDisplayedScope(preset.scope.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 16);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE_STANDARD, delay: 0.15 }}
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: "var(--radius-cards)",
        padding: "20px",
        boxShadow: "var(--shadow-xl)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Preset Prompt Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-berkeley-mono), monospace", flexShrink: 0 }}>
          Sample RFP:
        </span>
        {PROMPT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            style={{
              padding: "3px 9px",
              fontSize: "11px",
              fontFamily: "var(--font-berkeley-mono), monospace",
              fontWeight: selectedPreset.id === preset.id ? 590 : 400,
              borderRadius: "var(--radius-pills)",
              border: selectedPreset.id === preset.id ? "0.5px solid var(--color-brand)" : "0.5px solid var(--border)",
              background: selectedPreset.id === preset.id ? "var(--surface-2)" : "transparent",
              color: selectedPreset.id === preset.id ? "var(--color-brand)" : "var(--text-muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all var(--dur-fast)",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Terminal Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)", paddingBottom: "10px", gap: "10px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "md", label: "proposal.md", icon: Terminal },
            { id: "json", label: "analysis.json", icon: Code2 },
            { id: "tiers", label: "tiers.md", icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "var(--radius-buttons)",
                border: "none",
                background: activeTab === tab.id ? "var(--surface-2)" : "transparent",
                color: activeTab === tab.id ? "var(--color-brand)" : "var(--text-muted)",
                fontSize: "11px",
                fontFamily: "var(--font-berkeley-mono), monospace",
                fontWeight: 590,
                cursor: "pointer",
                transition: "all var(--dur-fast)",
              }}
            >
              <tab.icon size={11} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <span style={{ fontSize: "10px", fontWeight: 590, padding: "2px 6px", borderRadius: "var(--radius-pills)", background: "rgba(39,166,68,0.12)", color: "var(--color-pulse-green)" }}>
          ✦ {selectedPreset.score} Match Score
        </span>
      </div>

      {/* Terminal Code Screen */}
      <div
        style={{
          fontFamily: "var(--font-berkeley-mono), monospace",
          fontSize: "11.5px",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          background: "var(--bg-base)",
          padding: "14px",
          borderRadius: "var(--radius-inputs)",
          border: "0.5px solid var(--border)",
          minHeight: "190px",
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab === "md" && (
            <motion.div key={selectedPreset.id + "-md"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p style={{ color: "var(--color-brand)", margin: "0 0 6px 0" }}># {selectedPreset.title}</p>
              <p style={{ margin: "0 0 8px 0", color: "var(--text-muted)" }}>
                &gt; Scope: {isTyping ? displayedScope : selectedPreset.scope}
                {isTyping && <span style={{ animation: "pulse 0.8s infinite" }}>|</span>}
              </p>
              <div style={{ borderLeft: "2px solid var(--color-brand)", paddingLeft: "10px", margin: "8px 0" }}>
                {selectedPreset.deliverables.map((d, i) => (
                  <p key={i} style={{ margin: 0, color: "var(--text-primary)" }}>• {d}</p>
                ))}
              </div>
              <p style={{ color: "var(--color-pulse-green)", margin: "8px 0 0 0" }}>
                Est. Contract Investment: {selectedPreset.investment}
              </p>
            </motion.div>
          )}

          {activeTab === "json" && (
            <motion.div key={selectedPreset.id + "-json"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <pre style={{ margin: 0, color: "var(--color-brand)" }}>
{`{\n  "client": "${selectedPreset.title.replace("Proposal for ", "")}",\n  "matchScore": ${Number(selectedPreset.score.replace("%", "")) / 100},\n  "confidenceLevel": "High",\n  "recommendedRate": "${selectedPreset.investment}",\n  "status": "Ready for Client Export"\n}`}
              </pre>
            </motion.div>
          )}

          {activeTab === "tiers" && (
            <motion.div key={selectedPreset.id + "-tiers"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p style={{ margin: "0 0 6px 0", color: "var(--text-muted)" }}>// 3-Tier Pricing Breakdown</p>
              <p style={{ margin: 0, color: "var(--text-primary)" }}>Tier 1 (Basic Scope): Core MVP &amp; Audit</p>
              <p style={{ margin: "4px 0", color: "var(--color-brand)" }}>Tier 2 (Standard Scope): {selectedPreset.investment} [Recommended]</p>
              <p style={{ margin: 0, color: "var(--color-pulse-green)" }}>Tier 3 (Premium Scope): Full Architecture &amp; Priority SLA</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
        <span>✓ Profile Skills Matched</span>
        <span>✓ Past Case Studies Linked</span>
        <span style={{ color: "var(--color-brand)" }}>Ready to Export .md</span>
      </div>
    </motion.div>
  );
}

// ── MOUSE-REACTIVE SPOTLIGHT BENTO CARD ─────────────────────
function SpotlightBentoCard({
  icon: Icon,
  title,
  body,
  badgeText,
  badgeColor,
  iconColor,
  iconBg,
  wide = false,
}: {
  icon: any;
  title: string;
  body: string;
  badgeText: string;
  badgeColor: string;
  iconColor: string;
  iconBg: string;
  wide?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, borderColor: "var(--border-strong)" }}
      transition={SPRING_CARD}
      style={{
        position: "relative",
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-cards)",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "20px",
        overflow: "hidden",
      }}
    >
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(228,242,34,0.06), transparent 80%)`,
          }}
        />
      )}

      <div>
        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-inputs)", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, marginBottom: "16px" }}>
          <Icon size={18} />
        </div>
        <h3 className="font-heading" style={{ fontSize: "20px", fontWeight: 590, color: "var(--text-primary)", margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.6, maxWidth: wide ? "480px" : "100%" }}>
          {body}
        </p>
      </div>

      <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Metric Indicator</span>
        <span style={{ fontSize: "13px", fontWeight: 590, color: badgeColor, fontVariantNumeric: "tabular-nums" }}>{badgeText}</span>
      </div>
    </motion.div>
  );
}

// ── STICKY SCROLL STORYTELLING FEATURE SHOWCASE ───────────────
function StickyScrollFeatureShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Paste Raw Client Brief or RFP",
      desc: "Drop any client email, Upwork description, or project scope brief into FreelAI.",
      code: "> Intake: Client RFP parsed\n> Deliverables identified: 3\n> Target Budget: $12,000 USD",
    },
    {
      num: "02",
      title: "Match GitHub & Portfolio Case Studies",
      desc: "The AI queries your linked portfolio to build proof items and verify tech stack alignment.",
      code: "✦ Matching GitHub Repos:\n  - github.com/user/aether-design-system (98% match)\n  - github.com/user/stripe-webhooks-sdk (94% match)",
    },
    {
      num: "03",
      title: "Export Client-Ready 3-Tier Document",
      desc: "Export Markdown (.md) or print formatted PDFs with integrated Stripe deposit checkout links.",
      code: "# Final Scope Exported\n✓ Tier 1 (Basic Scope): $6,000\n✓ Tier 2 (Standard Scope): $12,000\n✓ Tier 3 (Premium Scope): $18,000\nStatus: 100% Upfront Deposit Enabled",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "36px", alignItems: "start" }} className="grid-responsive-2">
      {/* Left Column: Interactive Story Step Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: 590, color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Interactive Workflow Engine
        </span>
        <h3 className="font-heading" style={{ fontSize: "28px", fontWeight: 590, color: "var(--text-primary)", margin: 0 }}>
          How FreelAI scopes high-value deals in seconds.
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {steps.map((s, idx) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(idx)}
              style={{
                padding: "16px 20px",
                borderRadius: "var(--radius-cards)",
                border: activeStep === idx ? "0.5px solid var(--color-brand)" : "0.5px solid var(--border)",
                background: activeStep === idx ? "var(--surface-2)" : "var(--surface-1)",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
                transition: "all var(--dur-fast)",
              }}
            >
              <span style={{ fontSize: "12px", fontFamily: "var(--font-berkeley-mono), monospace", color: activeStep === idx ? "var(--color-brand)" : "var(--text-muted)", fontWeight: 590 }}>
                {s.num}
              </span>
              <div>
                <h4 style={{ fontSize: "14.5px", fontWeight: 510, color: activeStep === idx ? "var(--text-primary)" : "var(--text-secondary)", margin: 0 }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "4px 0 0 0", lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Sticky Code Display Terminal */}
      <div
        style={{
          position: "sticky",
          top: "90px",
          background: "var(--surface-1)",
          border: "0.5px solid var(--border-strong)",
          borderRadius: "var(--radius-cards)",
          padding: "24px",
          boxShadow: "var(--shadow-xl)",
          minHeight: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={14} color="var(--color-brand)" />
            <span style={{ fontSize: "12px", fontFamily: "var(--font-berkeley-mono), monospace", color: "var(--text-primary)", fontWeight: 590 }}>
              step-{steps[activeStep].num}-preview.log
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--color-brand)", fontFamily: "var(--font-berkeley-mono), monospace" }}>
            Step {activeStep + 1} of 3
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.pre
            key={activeStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              fontFamily: "var(--font-berkeley-mono), monospace",
              fontSize: "12px",
              lineHeight: 1.6,
              color: "var(--color-pulse-green)",
              background: "var(--bg-base)",
              padding: "16px",
              borderRadius: "var(--radius-inputs)",
              border: "0.5px solid var(--border)",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {steps[activeStep].code}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── INTERACTIVE BEFORE VS AFTER COMPARISON TOGGLE ──────────
function InteractiveBeforeAfter() {
  const [mode, setMode] = useState<"after" | "before">("after");

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-cards)",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 590, color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Operational Impact Audit
          </span>
          <h3 className="font-heading" style={{ fontSize: "24px", fontWeight: 590, color: "var(--text-primary)", margin: "4px 0 0 0" }}>
            {mode === "after" ? "With FreelAI Precision Operating System" : "Traditional Freelancing Chaos"}
          </h3>
        </div>

        <div style={{ display: "flex", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-pills)", padding: "3px" }}>
          <button
            onClick={() => setMode("before")}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: mode === "before" ? 590 : 400,
              borderRadius: "var(--radius-pills)",
              border: "none",
              background: mode === "before" ? "rgba(235,87,87,0.15)" : "transparent",
              color: mode === "before" ? "var(--color-coral-red)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            Before FreelAI
          </button>
          <button
            onClick={() => setMode("after")}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: mode === "after" ? 590 : 400,
              borderRadius: "var(--radius-pills)",
              border: "none",
              background: mode === "after" ? "var(--surface-2)" : "transparent",
              color: mode === "after" ? "var(--color-brand)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            With FreelAI ✦
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "after" ? (
          <motion.div
            key="after"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}
          >
            {[
              { title: "3-Tier Scope Architecture", desc: "Clients choose between Basic, Standard, and Premium tiers.", icon: CheckCircle2, color: "var(--color-pulse-green)" },
              { title: "100% Upfront Stripe Deposits", desc: "Automated deposit collection before any work begins.", icon: CheckCircle2, color: "var(--color-pulse-green)" },
              { title: "Zero Overdue Balance Reminders", desc: "Polite automated dunning follows up on invoices.", icon: CheckCircle2, color: "var(--color-pulse-green)" },
              { title: "94.8% Proposal Match Score", desc: "Past portfolio case studies automatically linked into pitches.", icon: CheckCircle2, color: "var(--color-pulse-green)" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "16px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <item.icon size={16} color={item.color} />
                  <span style={{ fontSize: "13px", fontWeight: 590, color: "var(--text-primary)" }}>{item.title}</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="before"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}
          >
            {[
              { title: "Messy Unstructured PDFs", desc: "Vague project descriptions leads to severe scope creep.", icon: XCircle, color: "var(--color-coral-red)" },
              { title: "Unpaid Sprints & Late Payments", desc: "Chasing clients after 45+ days for settled invoices.", icon: XCircle, color: "var(--color-coral-red)" },
              { title: "Manual Sunday Docs Paperwork", desc: "Spending 15+ hours weekly writing custom scopes.", icon: XCircle, color: "var(--color-coral-red)" },
              { title: "Undercharging Senior Expertise", desc: "No market data to price proposals at true value.", icon: XCircle, color: "var(--color-coral-red)" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "16px", background: "var(--bg-base)", border: "0.5px solid rgba(235,87,87,0.2)", borderRadius: "var(--radius-inputs)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <item.icon size={16} color={item.color} />
                  <span style={{ fontSize: "13px", fontWeight: 590, color: "var(--text-primary)" }}>{item.title}</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CONVERSATIONAL CHAT TESTIMONIAL CARDS ───────────────────
function ConversationalTestimonials() {
  const testimonials = [
    {
      author: "Alex Rivera",
      role: "Senior Full-Stack Engineer",
      avatar: "AR",
      quote: "Telling clients 'Basic vs Premium' tripled my average deal size. The proposal generator paid for itself on day one.",
      handle: "@arivera_dev",
    },
    {
      author: "Elena Rostova",
      role: "Design Systems Architect",
      avatar: "ER",
      quote: "Clients respect clear scope boundaries. FreelAI gives my boutique design agency the polish of a $100k studio.",
      handle: "@elena_ui",
    },
    {
      author: "Marcus Chen",
      role: "Fractional CTO & Advisor",
      avatar: "MC",
      quote: "No more sending renders while waiting for payment. Every milestone is backed by automated Stripe deposits.",
      handle: "@mchen_tech",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
      {testimonials.map((t, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -3 }}
          transition={SPRING_TACTILE}
          style={{
            padding: "20px",
            background: "var(--surface-1)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-cards)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 590, color: "var(--color-brand)" }}>
              {t.avatar}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 590, color: "var(--text-primary)" }}>{t.author}</span>
                <ShieldCheck size={13} color="var(--color-brand)" />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.role}</span>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
            "{t.quote}"
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ── LANDING PAGE MAIN COMPONENT ────────────────────────────────
export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeAudience, setActiveAudience] = useState("developers");

  const { scrollYProgress } = useScroll();
  const heroRotateX = useTransform(scrollYProgress, [0, 0.2], [8, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [0.97, 1.0]);

  const activeAudienceContent = audienceData[activeAudience] || audienceData.developers;

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: EASE_STANDARD },
    },
  };

  return (
    <div
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        color: "var(--text-primary)",
        fontFamily: "var(--font-inter-variable), sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Scroll Progress Bar at top of screen */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--color-brand)",
          scaleX: scrollYProgress,
          transformOrigin: "0% 0%",
          zIndex: 100,
        }}
      />

      {/* Subtle Ambient Background Light */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -12, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(circle, rgba(228,242,34,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Navbar />

      {/* ── 1. HERO SECTION WITH 3D PERSPECTIVE SCROLL TILT ── */}
      <section style={{ padding: "80px 24px 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", alignItems: "center" }} className="grid-responsive-2">
          {/* Left Hero Staggered Copy */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <motion.div variants={heroItemVariants} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 590,
                  fontFamily: "var(--font-berkeley-mono), monospace",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pills)",
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--border)",
                  color: "var(--color-brand)",
                }}
              >
                FREELAI 2.0 • 100% FREE FREELANCE SYSTEM
              </span>
            </motion.div>

            <motion.h1
              variants={heroItemVariants}
              className="font-heading"
              style={{
                fontSize: "46px",
                fontWeight: 590,
                lineHeight: 1.06,
                letterSpacing: "-0.022em",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Stop losing client deals <br />
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>to sloppy proposals.</span>
            </motion.h1>

            <motion.p variants={heroItemVariants} style={{ fontSize: "15.5px", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0, maxWidth: "520px" }}>
              Turn raw job posts into structured, client-ready proposals in minutes. Scope deliverables, match portfolio proof, and manage client contracts 100% free.
            </motion.p>

            <motion.div variants={heroItemVariants} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", paddingTop: "8px" }}>
              <Link href="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Explore Live Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Scroll 3D Tilt Terminal Simulator */}
          <motion.div style={{ perspective: 1000, rotateX: shouldReduceMotion ? 0 : heroRotateX, scale: heroScale }}>
            <HeroLiveProposalSimulator />
          </motion.div>
        </div>
      </section>

      {/* ── 2. STICKY SCROLL STORYTELLING SHOWCASE ── */}
      <section style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <StickyScrollFeatureShowcase />
      </section>

      {/* ── 3. BEFORE VS AFTER INTERACTIVE COMPARISON ── */}
      <section style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <InteractiveBeforeAfter />
      </section>

      {/* ── 4. SPOTLIGHT BENTO GRID ── */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
        style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2 className="font-heading" style={{ fontSize: "32px", fontWeight: 590, letterSpacing: "-0.012em", color: "var(--text-primary)", margin: 0 }}>
            Built for how senior freelancers operate.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            No bloated agency software. Just high-precision tools to win deals, protect scopes, and get paid on time.
          </p>
        </div>

        {/* Asymmetric Bento Cards Grid with Mouse-Reactive Spotlight */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "20px", marginBottom: "20px" }} className="grid-responsive-2">
          <SpotlightBentoCard
            icon={Sparkles}
            title="AI Proposal Engine"
            body="Paste any RFP or Upwork brief. FreelAI extracts core requirements, maps your past portfolio proof, and builds a 3-tiered scope breakdown (Basic, Standard, Premium) that wins high-value deals."
            badgeText="94.8% Confidence"
            badgeColor="var(--color-pulse-green)"
            iconColor="var(--color-brand)"
            iconBg="rgba(228,242,34,0.1)"
            wide
          />

          <SpotlightBentoCard
            icon={DollarSign}
            title="Automated Deposit Invoicing"
            body="Connect Stripe to auto-generate milestone invoices with gentle dunning reminders. Never chase overdue payments or start work without secured funds."
            badgeText="0 Overdue Days Average"
            badgeColor="var(--color-pulse-green)"
            iconColor="var(--color-pulse-green)"
            iconBg="rgba(39,166,68,0.1)"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "20px" }} className="grid-responsive-2">
          <SpotlightBentoCard
            icon={Users}
            title="Client CRM Intelligence"
            body="Know exactly which clients pay on time. Track contract LTV, active project milestones, and account health signals in one clean dashboard."
            badgeText="Real-time Account Health Tags"
            badgeColor="var(--color-brand)"
            iconColor="var(--color-accent)"
            iconBg="rgba(2,184,204,0.1)"
          />

          <SpotlightBentoCard
            icon={TrendingUp}
            title="Contract Rate Intelligence"
            body="Price every proposal with confidence. Our engine analyzes scope complexity and client budget indicators, giving you data-backed rate recommendations so you never undercharge for senior expertise."
            badgeText="+28% Contract Lift"
            badgeColor="var(--color-brand)"
            iconColor="var(--color-iris-violet)"
            iconBg="rgba(139,92,246,0.1)"
            wide
          />
        </div>
      </motion.section>

      {/* ── 5. INTERACTIVE AUDIENCE PERSONA SELECTOR ── */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
        style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <h2 className="font-heading" style={{ fontSize: "32px", fontWeight: 590, letterSpacing: "-0.012em", color: "var(--text-primary)", margin: 0 }}>
            Tailored workflows for specialized domain experts.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            Select your discipline to see concrete operational outcomes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {[
            { id: "developers", label: "Developers" },
            { id: "designers", label: "Designers" },
            { id: "editors", label: "Video Editors" },
            { id: "writers", label: "Copywriters" },
            { id: "consultants", label: "Consultants" },
            { id: "agencies", label: "Agencies" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveAudience(item.id)}
              style={{
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 510,
                borderRadius: "var(--radius-inputs)",
                border: activeAudience === item.id ? "0.5px solid var(--color-brand)" : "0.5px solid var(--border)",
                background: activeAudience === item.id ? "var(--surface-2)" : "var(--surface-1)",
                color: activeAudience === item.id ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all var(--dur-fast)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeAudience}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
            transition={{ duration: 0.2, ease: EASE_STANDARD }}
            style={{
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-cards)",
              padding: "32px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "32px",
              alignItems: "center",
            }}
            className="grid-responsive-2"
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: 590, color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {activeAudienceContent.badge}
              </span>
              <h3 className="font-heading" style={{ fontSize: "24px", fontWeight: 590, color: "var(--text-primary)", margin: "8px 0 12px 0", letterSpacing: "-0.015em" }}>
                {activeAudienceContent.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {activeAudienceContent.desc}
              </p>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "16px", fontStyle: "italic", borderLeft: "2px solid var(--color-brand)", paddingLeft: "12px", margin: "16px 0 0 0" }}>
                "{activeAudienceContent.highlight}"
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeAudienceContent.metrics.map((m: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    background: "var(--bg-base)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius-inputs)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    fontWeight: 510,
                  }}
                >
                  <Check size={14} color="var(--color-pulse-green)" />
                  {m}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ── 6. CONVERSATIONAL TESTIMONIALS SECTION ── */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
        style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2 className="font-heading" style={{ fontSize: "32px", fontWeight: 590, letterSpacing: "-0.012em", color: "var(--text-primary)", margin: 0 }}>
            Trusted by senior freelancers worldwide.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            See how top independent professionals use FreelAI to scale contract earnings.
          </p>
        </div>

        <ConversationalTestimonials />
      </motion.section>

      {/* ── 7. FINAL ACTION CALLOUT ── */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
        style={{ padding: "60px 24px 80px", maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            background: "var(--surface-1)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: "var(--radius-cards)",
            padding: "48px 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <h2 className="font-heading" style={{ fontSize: "34px", fontWeight: 590, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>
            Win your next high-ticket contract today.
          </h2>
          <p style={{ fontSize: "15px", color: "var(--text-muted)", maxWidth: "540px", margin: 0 }}>
            Get started free. Generate client-ready proposals, track client pipelines, and collect Stripe deposits in under two minutes.
          </p>
          <Link href="/signup" style={{ marginTop: "8px" }}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
