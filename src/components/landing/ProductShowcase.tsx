"use client";

import React, { useRef } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Sparkles,
  DollarSign,
  Briefcase,
  Clock,
  Send,
  Target,
  ChevronDown,
  Lock,
  ArrowRight,
  X,
  SendHorizontal,
  Shield,
  UserCheck,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import GlowArc from "./GlowArc";

/* ─── Sidebar Navigation Items ─── */
const mainNav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
];

const workspaceNav = [
  { icon: Users, label: "Clients" },
  { icon: FolderKanban, label: "Projects" },
  { icon: FileText, label: "Proposals" },
  { icon: Receipt, label: "Invoices" },
];

const aiToolsNav = [
  { icon: Sparkles, label: "AI Copilot", isBrand: true },
];

/* ─── KPI Cards Data ─── */
const kpiCards = [
  {
    label: "Total Revenue",
    value: "₹2,48,500",
    trend: "↑ 12.5% vs last month",
    trendColor: "var(--color-brand)",
    icon: DollarSign,
    iconColor: "var(--color-brand)",
    iconBg: "rgba(139, 207, 53, 0.12)",
    sparklineColor: "var(--color-brand)",
    sparklinePath: "M 0 22 Q 18 20, 32 14 T 64 16 T 90 4",
  },
  {
    label: "Active Projects",
    value: "12",
    trend: "↑ 2 from last month",
    trendColor: "var(--color-brand)",
    icon: FolderKanban,
    iconColor: "var(--color-brand)",
    iconBg: "rgba(139, 207, 53, 0.12)",
    sparklineColor: "var(--color-brand)",
    sparklinePath: "M 0 20 Q 22 18, 40 12 T 68 14 T 90 6",
  },
  {
    label: "Pending Invoices",
    value: "6",
    trend: "₹1,25,000 pending",
    trendColor: "#f59e0b",
    icon: Clock,
    iconColor: "#f59e0b",
    iconBg: "rgba(245, 158, 11, 0.12)",
    sparklineColor: "#f59e0b",
    sparklinePath: "M 0 12 Q 22 16, 44 8 T 70 20 T 90 14",
  },
  {
    label: "Proposals Sent",
    value: "18",
    trend: "↑ 6 this month",
    trendColor: "#a855f7",
    icon: Send,
    iconColor: "#a855f7",
    iconBg: "rgba(168, 85, 247, 0.12)",
    sparklineColor: "#a855f7",
    sparklinePath: "M 0 22 Q 24 18, 48 10 T 72 14 T 90 4",
  },
  {
    label: "AI Win Rate",
    value: "78%",
    trend: "12 proposals",
    trendColor: "var(--color-brand)",
    icon: Target,
    iconColor: "#a855f7",
    iconBg: "rgba(168, 85, 247, 0.12)",
    isDonut: true,
  },
];

/* ─── Activity List Items ─── */
const activities = [
  {
    icon: Receipt,
    text: "Invoice #INV-024 sent to Acme Corp",
    time: "2h ago",
  },
  {
    icon: FolderKanban,
    text: 'New project "Website Redesign" created',
    time: "5h ago",
  },
  {
    icon: Send,
    text: "Proposal sent to TechNova Pvt. Ltd.",
    time: "1d ago",
  },
  {
    icon: DollarSign,
    text: "Payment received from Design Labs",
    time: "2d ago",
  },
];

/* ═══════════════════════════════════════════════════════════════
   PRODUCT SHOWCASE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="product-showcase-section"
      style={{
        position: "relative",
        paddingTop: "80px",
        paddingBottom: "80px",
        overflowX: "clip",
        overflowY: "visible",
        width: "100%",
      }}
    >
      {/* Curved glowing horizon positioned behind the top of mockup */}
      <GlowArc />

      {/* ── BROWSER MOCKUP CONTAINER ── */}
      <div
        style={{
          maxWidth: "1440px",
          width: "92%",
          margin: "0 auto",
          padding: "0 12px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <motion.div
          className="showcase-browser-frame"
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 35, scale: 0.98 }}
          transition={{
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* ── BROWSER TOP BAR (Chrome) ── */}
          <div className="showcase-browser-topbar">
            {/* macOS Window Controls */}
            <div className="showcase-browser-controls">
              <span className="showcase-dot showcase-dot-red" />
              <span className="showcase-dot showcase-dot-yellow" />
              <span className="showcase-dot showcase-dot-green" />
            </div>

            {/* Centered URL Address Pill */}
            <div className="showcase-address-pill">
              <Lock size={10} style={{ color: "var(--color-brand)", opacity: 0.85 }} />
              <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "-0.01em" }}>
                app.freelai.com
              </span>
            </div>

            {/* Spacer for symmetrical center */}
            <div style={{ width: "54px" }} />
          </div>

          {/* ── DASHBOARD APPLICATION CANVAS (With Bottom Fade Mask) ── */}
          <div className="showcase-canvas-fade-wrapper">
            <div className="showcase-dashboard-canvas">
              {/* ── LEFT SIDEBAR ── */}
              <aside className="showcase-app-sidebar">
                {/* FreeLAI Brand Header */}
                <div className="showcase-sidebar-brand">
                  <div style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      src="/logo.png"
                      alt="FreeLAI Logo"
                      style={{ width: "28px", height: "28px", objectFit: "contain" }}
                    />
                  </div>
                  <img
                    src="/wordmark.png"
                    alt="FreeLAI"
                    style={{ height: "17px", width: "auto", objectFit: "contain" }}
                  />
                </div>

                {/* Nav Group 1: MAIN */}
                <div className="showcase-nav-group">
                  <span className="showcase-nav-heading">MAIN</span>
                  <div className="showcase-nav-list">
                    {mainNav.map((item, idx) => (
                      <div
                        key={idx}
                        className={`showcase-nav-item${item.active ? " active" : ""}`}
                      >
                        {item.active && <span className="showcase-active-indicator" />}
                        <item.icon
                          size={15}
                          style={{
                            color: item.active ? "var(--color-brand)" : "var(--text-secondary)",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nav Group 2: WORKSPACE */}
                <div className="showcase-nav-group">
                  <span className="showcase-nav-heading">WORKSPACE</span>
                  <div className="showcase-nav-list">
                    {workspaceNav.map((item, idx) => (
                      <div key={idx} className="showcase-nav-item">
                        <item.icon size={15} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nav Group 3: AI TOOLS */}
                <div className="showcase-nav-group">
                  <span className="showcase-nav-heading">AI TOOLS</span>
                  <div className="showcase-nav-list">
                    {aiToolsNav.map((item, idx) => (
                      <div key={idx} className="showcase-nav-item">
                        <item.icon size={15} style={{ color: "var(--color-brand)", flexShrink: 0 }} />
                        <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* ── MAIN DASHBOARD VIEWPORT ── */}
              <main className="showcase-app-main">
                {/* 1. Header Row */}
                <div className="showcase-main-header">
                  <div>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      Welcome back, <span style={{ color: "var(--color-brand)" }}>Shivam!</span> 👋
                    </h2>
                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-secondary)",
                        margin: "2px 0 0 0",
                      }}
                    >
                      Here&apos;s what&apos;s happening with your freelance business today.
                    </p>
                  </div>

                  {/* Header Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="showcase-btn-secondary">
                      <Sparkles size={12} color="var(--text-muted)" />
                      <span>Proposal</span>
                    </div>
                    <div className="showcase-btn-secondary">
                      <FileText size={12} color="var(--text-muted)" />
                      <span>Invoice</span>
                    </div>
                    <div className="showcase-btn-primary">
                      <span>+ New Project</span>
                    </div>
                  </div>
                </div>

                {/* 2. Complete Profile Banner */}
                <div className="showcase-profile-banner">
                  <div className="showcase-profile-icon">
                    <UserCheck size={16} color="var(--color-brand)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "12.5px", fontWeight: 650, color: "var(--text-primary)", margin: 0 }}>
                      Complete your Freelancer Profile
                    </h4>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0", lineHeight: 1.35 }}>
                      Configure your skills registry and service rates to activate AI-powered proposal auto-matching, dunning scripts, and rate optimizations.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>PROGRESS</span>
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--color-brand)" }}>60%</span>
                      </div>
                      <div style={{ width: "80px", height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: "60%", height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                      </div>
                    </div>
                    <div className="showcase-btn-complete-profile">
                      <span>Complete Profile</span>
                    </div>
                    <X size={14} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
                  </div>
                </div>

                {/* 3. 5-Card KPI Grid */}
                <div className="showcase-kpi-grid">
                  {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="showcase-kpi-box">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <kpi.icon size={13} style={{ color: kpi.iconColor }} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
                            {kpi.label}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "2px" }}>
                        <div>
                          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.025em", fontFamily: "var(--font-heading)" }}>
                            {kpi.value}
                          </div>
                          <div style={{ fontSize: "10px", color: kpi.trendColor, fontWeight: 500, marginTop: "2px", fontFamily: "var(--font-body)" }}>
                            {kpi.trend}
                          </div>
                        </div>

                        {/* Sparkline or Donut Ring */}
                        {kpi.isDonut ? (
                          <div style={{ position: "relative", width: "36px", height: "36px" }}>
                            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="var(--color-brand)"
                                strokeWidth="3.5"
                                strokeDasharray="87.96"
                                strokeDashoffset="19.35"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        ) : (
                          <svg width="68" height="22" viewBox="0 0 90 24" fill="none" style={{ overflow: "visible" }}>
                            <path
                              d={kpi.sparklinePath}
                              fill="none"
                              stroke={kpi.sparklineColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4. Middle Triple Grid (Revenue Overview | Activity | AI Copilot) */}
                <div className="showcase-middle-grid">
                  {/* Card 1: Revenue Overview */}
                  <div className="showcase-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}>
                          Revenue Overview
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                          Monthly financial velocity (YTD)
                        </div>
                      </div>
                      <div className="showcase-time-pill">
                        <span>YTD</span>
                        <ChevronDown size={10} />
                      </div>
                    </div>

                    {/* Rich Spline Area Chart */}
                    <div style={{ width: "100%", height: "140px", position: "relative" }}>
                      <svg viewBox="0 0 360 140" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                        <defs>
                          <linearGradient id="chartGlowFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                            <stop offset="60%" stopColor="var(--color-brand)" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Subtle Grid Lines */}
                        <line x1="30" y1="30" x2="350" y2="30" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                        <line x1="30" y1="65" x2="350" y2="65" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                        <line x1="30" y1="95" x2="350" y2="95" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

                        {/* Y-Axis Labels */}
                        <text x="5" y="34" fill="var(--text-muted)" fontSize="8.5">80K</text>
                        <text x="5" y="69" fill="var(--text-muted)" fontSize="8.5">60K</text>
                        <text x="5" y="99" fill="var(--text-muted)" fontSize="8.5">40K</text>
                        <text x="5" y="109" fill="var(--text-muted)" fontSize="8.5">20K</text>
                        <text x="12" y="125" fill="var(--text-muted)" fontSize="8.5">0</text>

                        {/* Area Gradient Fill */}
                        <path
                          d="M 35 115 C 70 100, 100 82, 130 80 C 165 78, 190 92, 225 90 C 260 88, 290 40, 345 28 L 345 125 L 35 125 Z"
                          fill="url(#chartGlowFill)"
                        />

                        {/* Spline Line */}
                        <path
                          d="M 35 115 C 70 100, 100 82, 130 80 C 165 78, 190 92, 225 90 C 260 88, 290 40, 345 28"
                          fill="none"
                          stroke="var(--color-brand)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />

                        {/* Glowing Nodes */}
                        <circle cx="130" cy="80" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                        <circle cx="225" cy="90" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                        <circle cx="345" cy="28" r="4.5" fill="var(--color-brand)" stroke="var(--surface-1)" strokeWidth="2" />

                        {/* X-Axis Labels */}
                        <text x="35" y="127" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">Jan</text>
                        <text x="130" y="127" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">Feb</text>
                        <text x="225" y="127" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">Mar</text>
                        <text x="290" y="127" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">Apr</text>
                        <text x="345" y="127" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">May</text>
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Activity */}
                  <div className="showcase-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}>Activity</span>
                      <span style={{ fontSize: "11px", color: "var(--color-brand)", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px", fontFamily: "var(--font-body)" }}>
                        View all →
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                      {activities.map((act, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "rgba(139, 207, 53, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <act.icon size={11} color="var(--color-brand)" />
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}>
                              {act.text}
                            </span>
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--font-body)" }}>{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: AI Copilot */}
                  <div className="showcase-card-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Sparkles size={13} color="var(--color-brand)" />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}>AI Copilot</span>
                    </div>

                    {/* Quick Ask / Insights Tabs */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                      <div className="showcase-copilot-tab active">
                        <span>Quick Ask</span>
                      </div>
                      <div className="showcase-copilot-tab">
                        <span>Insights</span>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="showcase-copilot-prompt-box">
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        Ask outreach tips, project scoping details, invoice templates...
                      </span>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                        <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <SendHorizontal size={11} color="var(--text-muted)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
