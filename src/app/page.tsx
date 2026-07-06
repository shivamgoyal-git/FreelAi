"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Users,
  Shield,
  Briefcase,
  DollarSign,
  ChevronRight,
  Menu,
  X,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  Plus,
  Trash,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { chartTheme } from "@/lib/chart-theme";

// ── MOCK DATA FOR INTERACTIVE PREVIEWS ─────────────────────────

const mockRevenueData = [
  { month: "Jan", Collected: 3200, Billed: 4000 },
  { month: "Feb", Collected: 4100, Billed: 4800 },
  { month: "Mar", Collected: 5600, Billed: 6000 },
  { month: "Apr", Collected: 7200, Billed: 7500 },
  { month: "May", Collected: 8900, Billed: 9200 },
  { month: "Jun", Collected: 11000, Billed: 11200 },
];

const mockClients = [
  { name: "Acme Corp", industry: "SaaS Tech", status: "Active", health: "Healthy", value: "$12,500" },
  { name: "Design Studio V", industry: "Branding", status: "Pending", health: "Warning", value: "$4,200" },
  { name: "Global Retail Co", industry: "E-Commerce", status: "Active", health: "At Risk", value: "$8,900" },
];

const mockProjects = [
  { name: "Mobile App Design", client: "Acme Corp", progress: 85, status: "In Progress", dueDate: "Jul 15" },
  { name: "Webflow Development", client: "Design Studio V", progress: 40, status: "In Progress", dueDate: "Aug 02" },
  { name: "Brand Guidelines", client: "Global Retail Co", progress: 100, status: "Completed", dueDate: "Jun 28" },
];

const mockProposalOutlines = [
  { section: "Executive Summary", score: 95, feedback: "Highly personalized hook. Excellent client-problem alignment." },
  { section: "Scope & Timeline", score: 88, feedback: "Clear phases. Suggest adding 1 buffer week for QA." },
  { section: "Pricing & Investment", score: 92, feedback: "Transparent pricing structure. Value metrics clearly highlighted." },
];

const mockInvoiceTimeline = [
  { stage: "Draft Created", date: "Jun 20", status: "completed" },
  { stage: "AI Compliance Review", date: "Jun 21", status: "completed" },
  { stage: "Sent to Client", date: "Jun 22", status: "completed" },
  { stage: "Payment Collected", date: "Jun 28", status: "active" },
];

// ── AUDIENCE TARGET DATA ────────────────────────────────────────

const audienceData = {
  developers: {
    badge: "For Engineers & Solopreneurs",
    title: "Scope, code, and deploy your business rules.",
    desc: "AI helps you write detailed technical spec scopes, track complex project milestones, auto-generate billing for sprint reviews, and manage retainer contracts with zero admin stress.",
    metrics: ["15h saved weekly on scope documents", "0 missed retainer payments", "100% compliant contracts"],
    highlight: "Devs using FreelAI report spending 90% more time coding instead of tracking billing sheets."
  },
  designers: {
    badge: "For Creatives & Directors",
    title: "Present stunning portfolios and pitch with power.",
    desc: "Seamlessly map visual assets to client proposals. Leverage AI to draft clean, high-scoring creative pitches and automatically trigger visual review feedback loops.",
    metrics: ["40% increase in pitch win rates", "Instant visual scope templates", "Clean client sign-off panels"],
    highlight: "Designers use the portfolio integration to match their visual cases directly to job pitches."
  },
  editors: {
    badge: "For Video Editors & Animators",
    title: "Track revisions, render deadlines, and collect fees.",
    desc: "Stop chasing clients for feedback on version drafts. Set up clear payment milestones tied directly to review sign-offs and auto-generate deposit invoices.",
    metrics: ["No unpaid revisions", "30% faster milestone approvals", "100% upfront deposits secured"],
    highlight: "Video editors use the escrow invoicing system to lock in fees before releasing final drafts."
  },
  writers: {
    badge: "For Copywriters & Content Strategists",
    title: "Turn copywriting briefs into professional proposals.",
    desc: "Leverage AI to draft custom outlines, set strategic milestone timelines, and monitor client communications with proactive follow-up recommendations.",
    metrics: ["Draft proposals in 10 minutes", "94% outreach response rates", "Structured content schedules"],
    highlight: "Writers use the AI Partner to analyze client feedback and suggest professional email follow-ups."
  },
  consultants: {
    badge: "For Strategic Consultants & Advisors",
    title: "Track consulting hours and advisory retainers.",
    desc: "Manage multiple high-value clients, track hourly advisory allocations, and automatically trigger smart billing reports at the end of the month.",
    metrics: ["100% accurate time logs", "Automated recurring retainers", "Sleek financial summaries"],
    highlight: "Advisors use the earnings dashboard to track overall collections and active advisor retainer allocations."
  },
  agencies: {
    badge: "For Boutique Agencies & Studio Teams",
    title: "Scale operations, manage teams, and invoice clients.",
    desc: "Organize client communication feeds, track contractor work packages, and distribute centralized invoicing summaries to external stakeholders.",
    metrics: ["Centralized multi-client CRM", "Automatic contractor margins tracking", "$1.2M+ invoicing capacity"],
    highlight: "Boutique agencies leverage the full dashboard suite as their primary client operations cockpit."
  }
};

export default function RedesignedLandingPage() {
  const [activeTourTab, setActiveTourTab] = useState<"dashboard" | "clients" | "projects" | "proposals" | "invoices" | "analytics">("dashboard");
  const [activeAudience, setActiveAudience] = useState<"developers" | "designers" | "editors" | "writers" | "consultants" | "agencies">("developers");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated AI actions for the interactive Partner pane
  const [aiActions, setAiActions] = useState([
    {
      id: 1,
      title: "Invoice #INV-2026-08 is ready for Acme Corp",
      desc: "Milestone 'Mobile App Design Draft' was marked completed yesterday. Click below to send the $2,500 invoice.",
      actionLabel: "Send Invoice",
      type: "invoice",
      completed: false
    },
    {
      id: 2,
      title: "Follow-up suggested with Design Studio V",
      desc: "Proposal sent 4 days ago has been viewed 3 times. Recommend checking in with our optimized follow-up script.",
      actionLabel: "View Draft Script",
      type: "follow-up",
      completed: false
    },
    {
      id: 3,
      title: "New high-match project opportunity found",
      desc: "Found an Upwork posting for 'SaaS Branding Redesign' matching your skills with a 92% confidence score.",
      actionLabel: "Generate Proposal Outline",
      type: "match",
      completed: false
    }
  ]);

  const handleRunAiAction = (id: number) => {
    setAiActions((prev) =>
      prev.map((act) => (act.id === id ? { ...act, completed: true } : act))
    );
  };

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          paddingTop: "140px",
          paddingBottom: "80px",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 10%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 10%, black 40%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div className="container-main" style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <div className="animate-fade-in" style={{ marginBottom: "24px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-8)",
                padding: "var(--spacing-4) var(--spacing-12)",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-pills)",
                fontSize: "var(--text-caption)",
                fontWeight: 510,
                color: "var(--text-primary)",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--color-acid-lime)" }} />
              Free to start · No credit card required
            </span>
          </div>

          <h1
            className="font-display animate-fade-in-up"
            style={{
              fontSize: "clamp(34px, 5.5vw, 64px)",
              lineHeight: 1.05,
              fontWeight: 510,
              maxWidth: "820px",
              margin: "0 auto var(--spacing-24) auto",
              color: "var(--text-primary)",
            }}
          >
            Focus on your craft. <br />
            Let AI run your business.
          </h1>

          <p
            className="animate-fade-in-up"
            style={{
              fontSize: "var(--text-body-lg)",
              lineHeight: 1.5,
              color: "var(--text-muted)",
              maxWidth: "600px",
              margin: "0 auto var(--spacing-40) auto",
            }}
          >
            The single workspace that turns proposal writing, project tracking, invoicing, and client follow-ups into automated flow.
          </p>

          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--spacing-16)",
              flexWrap: "wrap",
              marginBottom: "var(--spacing-64)",
            }}
          >
            <Link href="/signup">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
                Start Your Business Free
              </Button>
            </Link>
            <a href="#tour">
              <Button variant="secondary" size="lg">
                View Interactive Tour
              </Button>
            </a>
          </div>

          {/* Credibility Metrics Grid */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--spacing-24)",
              maxWidth: "800px",
              margin: "0 auto",
              borderTop: "0.5px solid var(--border)",
              paddingTop: "var(--spacing-36)",
            }}
          >
            <div>
              <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: 0 }}>
                12 hours
              </h3>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Saved weekly on admin
              </p>
            </div>
            <div>
              <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: 0 }}>
                94%
              </h3>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Proposal win rate
              </p>
            </div>
            <div>
              <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: 0 }}>
                +$2.4K
              </h3>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Avg. monthly revenue growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PRODUCT PREVIEW TOUR ─────────────────────── */}
      <section
        id="tour"
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-40)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              The Cockpit of Your Business
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
              Explore the real application interface. Toggle tabs below to see how FreelAI integrates your entire business operations.
            </p>
          </div>

          {/* Switcher Tab Headers */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "var(--spacing-8)",
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-inputs)",
              padding: "var(--spacing-8)",
              maxWidth: "800px",
              margin: "0 auto var(--spacing-36) auto",
            }}
          >
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "clients", label: "Client CRM" },
              { id: "projects", label: "Projects" },
              { id: "proposals", label: "AI Proposals" },
              { id: "invoices", label: "Smart Invoices" },
              { id: "analytics", label: "Analytics" },
            ].map((tab) => {
              const active = tab.id === activeTourTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTourTab(tab.id as any)}
                  style={{
                    padding: "var(--spacing-8) var(--spacing-16)",
                    background: active ? "var(--surface-2)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius)",
                    fontSize: "var(--text-caption)",
                    fontWeight: 510,
                    cursor: "pointer",
                    transition: "all var(--dur-fast)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tour View Frame */}
          <div
            className="glass-card"
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              minHeight: "440px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Mock OS Frame Header */}
            <div
              style={{
                height: "36px",
                background: "var(--surface-2)",
                borderBottom: "0.5px solid var(--border)",
                display: "flex",
                alignItems: "center",
                padding: "0 var(--spacing-16)",
                gap: "var(--spacing-8)",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#27c93f" }} />
              <span
                className="font-mono-meta"
                style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "var(--spacing-16)" }}
              >
                app.freelai.com/dashboard/{activeTourTab}
              </span>
            </div>

            {/* Mock Screen Content Panel */}
            <div style={{ padding: "var(--spacing-28)", flex: 1, background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
              
              {/* TAB 1: DASHBOARD */}
              {activeTourTab === "dashboard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--spacing-8)" }}>
                    <div>
                      <h4 className="font-heading" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-primary)", margin: 0 }}>
                        Welcome back, Shivam
                      </h4>
                      <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                        Here is your proactive briefing report.
                      </p>
                    </div>
                    <Badge variant="active">Healthy</Badge>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-16)" }} className="grid-responsive-3">
                    <div style={{ padding: "var(--spacing-16)", background: "var(--surface-1)", borderRadius: "var(--radius-cards)", border: "0.5px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Collected Revenue</span>
                      <h3 style={{ fontSize: "20px", color: "var(--text-primary)", margin: "4px 0" }}>$14,280</h3>
                      <span style={{ fontSize: "11px", color: "var(--color-pulse-green)" }}>+18% this month</span>
                    </div>
                    <div style={{ padding: "var(--spacing-16)", background: "var(--surface-1)", borderRadius: "var(--radius-cards)", border: "0.5px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active Projects</span>
                      <h3 style={{ fontSize: "20px", color: "var(--text-primary)", margin: "4px 0" }}>4 Active</h3>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>2 proposals pending</span>
                    </div>
                    <div style={{ padding: "var(--spacing-16)", background: "var(--surface-1)", borderRadius: "var(--radius-cards)", border: "0.5px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Outstanding Invoiced</span>
                      <h3 style={{ fontSize: "20px", color: "var(--text-primary)", margin: "4px 0" }}>$3,500</h3>
                      <span style={{ fontSize: "11px", color: "var(--color-coral-red)" }}>1 invoice overdue</span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "var(--spacing-16)",
                      background: "rgba(99, 102, 241, 0.04)",
                      border: "0.5px solid rgba(99, 102, 241, 0.2)",
                      borderLeft: "3px solid var(--color-iris-violet)",
                      borderRadius: "var(--radius-cards)",
                      display: "flex",
                      gap: "var(--spacing-12)",
                      alignItems: "flex-start",
                    }}
                  >
                    <Sparkles size={16} color="var(--color-iris-violet)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <h4 className="font-heading" style={{ fontSize: "var(--text-caption)", color: "var(--text-primary)", margin: 0 }}>
                        AI Partner Recommendation
                      </h4>
                      <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                        Proposal to Design Studio V has been viewed. Send check-in follow-up. Also, Milestone 3 of App Design project is 85% complete; ready to request feedback.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENTS */}
              {activeTourTab === "clients" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
                  <div className="flex-between">
                    <h4 className="font-heading" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-primary)", margin: 0 }}>
                      Clients Directory
                    </h4>
                    <Button variant="primary" size="sm" leftIcon={<Plus size={13} />}>Add Client</Button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr style={{ background: "var(--surface-1)" }}>
                          <th style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>Client Name</th>
                          <th style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>Industry</th>
                          <th style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>Status</th>
                          <th style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>Health</th>
                          <th style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockClients.map((client, idx) => (
                          <tr key={idx} style={{ borderBottom: "0.5px solid var(--border)" }}>
                            <td style={{ padding: "var(--spacing-12) var(--spacing-16)", fontWeight: 510, color: "var(--text-primary)" }}>{client.name}</td>
                            <td style={{ padding: "var(--spacing-12) var(--spacing-16)", color: "var(--text-secondary)" }}>{client.industry}</td>
                            <td style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>
                              <Badge variant={client.status === "Active" ? "active" : "pending"}>{client.status}</Badge>
                            </td>
                            <td style={{ padding: "var(--spacing-12) var(--spacing-16)" }}>
                              <span
                                style={{
                                  color: client.health === "Healthy" ? "var(--color-pulse-green)" : client.health === "Warning" ? "var(--color-iris-violet)" : "var(--color-coral-red)",
                                  fontWeight: 510,
                                  fontSize: "var(--text-caption)",
                                }}
                              >
                                {client.health}
                              </span>
                            </td>
                            <td style={{ padding: "var(--spacing-12) var(--spacing-16)", fontWeight: 510, color: "var(--text-primary)" }}>{client.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS */}
              {activeTourTab === "projects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
                  <div className="flex-between">
                    <h4 className="font-heading" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-primary)", margin: 0 }}>
                      Active Projects
                    </h4>
                    <Button variant="primary" size="sm" leftIcon={<Plus size={13} />}>Create Project</Button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-16)" }} className="grid-responsive-3">
                    {mockProjects.map((project, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--surface-1)",
                          border: "0.5px solid var(--border)",
                          borderRadius: "var(--radius-cards)",
                          padding: "var(--spacing-16)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--spacing-12)",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{project.client}</span>
                          <h4 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", margin: "2px 0 0 0" }}>
                            {project.name}
                          </h4>
                        </div>
                        <div>
                          <div className="flex-between" style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${project.progress}%`, height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                          </div>
                        </div>
                        <div className="flex-between" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          <span>Due {project.dueDate}</span>
                          <Badge variant={project.status === "Completed" ? "active" : "pending"}>{project.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PROPOSALS */}
              {activeTourTab === "proposals" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "var(--spacing-20)" }} className="grid-responsive-2">
                  {/* Left Column: Draft Output */}
                  <div
                    style={{
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-cards)",
                      padding: "var(--spacing-20)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-12)",
                    }}
                  >
                    <div className="flex-between">
                      <span className="font-mono-meta" style={{ fontSize: "11px", color: "var(--text-muted)" }}>PROPOSAL_OUTLINE.MD</span>
                      <Badge variant="active">92% Win Match</Badge>
                    </div>
                    <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "var(--spacing-12)" }}>
                      <h4 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 var(--spacing-8) 0" }}>
                        Project: Mobile App Redesign
                      </h4>
                      <p style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        <strong>1. Solution Outline:</strong> Restructuring navigation to reduce task friction by 30%. Build high-fidelity prototype flows in Figma, followed by detailed components review sessions...
                      </p>
                    </div>
                  </div>

                  {/* Right Column: AI Scoring */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
                    <div
                      style={{
                        background: "var(--surface-1)",
                        border: "0.5px solid var(--border)",
                        borderRadius: "var(--radius-cards)",
                        padding: "var(--spacing-16)",
                      }}
                    >
                      <h4 className="font-heading" style={{ fontSize: "var(--text-caption)", color: "var(--text-primary)", margin: "0 0 var(--spacing-12) 0" }}>
                        AI Score Analysis
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
                        {mockProposalOutlines.map((item, idx) => (
                          <div key={idx} style={{ fontSize: "11px", borderBottom: "0.5px solid var(--border)", paddingBottom: "var(--spacing-8)" }}>
                            <div className="flex-between">
                              <span style={{ fontWeight: 510, color: "var(--text-secondary)" }}>{item.section}</span>
                              <span style={{ color: "var(--color-pulse-green)" }}>{item.score}%</span>
                            </div>
                            <p style={{ color: "var(--text-muted)", margin: "2px 0 0 0" }}>{item.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INVOICES */}
              {activeTourTab === "invoices" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "var(--spacing-20)" }} className="grid-responsive-2">
                  <div
                    style={{
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-cards)",
                      padding: "var(--spacing-24)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-20)",
                    }}
                  >
                    <div className="flex-between" style={{ borderBottom: "0.5px solid var(--border)", paddingBottom: "var(--spacing-12)" }}>
                      <div>
                        <h4 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>Invoice #INV-2026-08</h4>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Issued Jun 22, 2026</span>
                      </div>
                      <Badge variant="active">Collected</Badge>
                    </div>

                    <div className="flex-between" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div>
                        <strong>Billed To:</strong>
                        <p style={{ margin: "2px 0 0 0" }}>Acme Corp</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong>Amount Due:</strong>
                        <p style={{ margin: "2px 0 0 0", fontSize: "15px", color: "var(--text-primary)", fontWeight: 510 }}>$2,500.00</p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-cards)",
                      padding: "var(--spacing-16)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-12)",
                    }}
                  >
                    <h4 className="font-heading" style={{ fontSize: "var(--text-caption)", color: "var(--text-primary)", margin: 0 }}>
                      Invoice Timeline
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)", position: "relative" }}>
                      {mockInvoiceTimeline.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "var(--spacing-12)", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: item.status === "completed" ? "var(--color-pulse-green)" : "var(--color-brand)",
                                border: "2px solid var(--surface-1)",
                              }}
                            />
                            {idx < mockInvoiceTimeline.length - 1 && (
                              <div style={{ width: "2px", height: "24px", background: "var(--border)" }} />
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: "12px", margin: 0, fontWeight: 510, color: "var(--text-primary)" }}>{item.stage}</p>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ANALYTICS */}
              {activeTourTab === "analytics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)", width: "100%" }}>
                  <div className="flex-between">
                    <h4 className="font-heading" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-primary)", margin: 0 }}>
                      Earnings Analytics
                    </h4>
                    <div style={{ display: "flex", gap: "var(--spacing-12)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                        <span style={{ width: "8px", height: "8px", background: "var(--color-signal-teal)", borderRadius: "2px" }} />
                        <span style={{ color: "var(--text-secondary)" }}>Collected</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                        <span style={{ width: "8px", height: "8px", background: "var(--color-iris-violet)", borderRadius: "2px" }} />
                        <span style={{ color: "var(--text-secondary)" }}>Billed</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-signal-teal)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="var(--color-signal-teal)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-iris-violet)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="var(--color-iris-violet)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={chartTheme.grid.stroke} strokeDasharray={chartTheme.grid.strokeDasharray} vertical={false} />
                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                        <Area type="monotone" dataKey="Collected" stroke="var(--color-signal-teal)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCollected)" />
                        <Area type="monotone" dataKey="Billed" stroke="var(--color-iris-violet)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBilled)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS FREELAI FOR? ─────────────────────────────────── */}
      <section
        id="audience"
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-40)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              Tailored to Your Freelance Workflow
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
              Whether you are coding software, designing interfaces, or running an agency, FreelAI fits your scope.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: "var(--spacing-40)",
              alignItems: "flex-start",
            }}
            className="grid-responsive-2"
          >
            {/* Left Column: Switcher buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
              {[
                { id: "developers", label: "Developers" },
                { id: "designers", label: "Designers" },
                { id: "editors", label: "Video Editors" },
                { id: "writers", label: "Writers" },
                { id: "consultants", label: "Consultants" },
                { id: "agencies", label: "Agencies" },
              ].map((role) => {
                const active = role.id === activeAudience;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveAudience(role.id as any)}
                    className={`sidebar-nav-item${active ? " active" : ""}`}
                    style={{
                      textAlign: "left",
                      padding: "0 var(--spacing-16)",
                      height: "40px",
                      borderRadius: "var(--radius-inputs)",
                      background: active ? "var(--surface-2)" : "transparent",
                      color: active ? "var(--text-primary)" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 510,
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Content card */}
            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-32)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-20)",
                minHeight: "300px",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Badge variant="active" style={{ marginBottom: "var(--spacing-16)" }}>
                  {audienceData[activeAudience].badge}
                </Badge>
                <h3 className="font-heading" style={{ fontSize: "var(--text-body-lg)", color: "var(--text-primary)", margin: "0 0 var(--spacing-12) 0" }}>
                  {audienceData[activeAudience].title}
                </h3>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {audienceData[activeAudience].desc}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "var(--spacing-16)",
                  borderTop: "0.5px solid var(--border)",
                  paddingTop: "var(--spacing-24)",
                  marginTop: "var(--spacing-24)",
                }}
                className="grid-responsive-3"
              >
                {audienceData[activeAudience].metrics.map((metric, i) => (
                  <div key={i}>
                    <CheckCircle size={14} color="var(--color-pulse-green)" style={{ marginBottom: "var(--spacing-4)" }} />
                    <p style={{ fontSize: "var(--text-caption)", color: "var(--text-primary)", fontWeight: 510, margin: 0 }}>
                      {metric}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI BUSINESS PARTNER SECTION ──────────────────────────── */}
      <section
        id="ai-partner"
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="container-main">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "45fr 55fr",
              gap: "60px",
              alignItems: "center",
            }}
            className="grid-responsive-2"
          >
            {/* Left: Info */}
            <div>
              <div style={{ marginBottom: "20px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--spacing-6)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-iris-violet)",
                  }}
                >
                  <Cpu size={12} />
                  Proactive Intelligence
                </span>
              </div>

              <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-16)" }}>
                Meet Your AI Business Partner
              </h2>

              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--spacing-24)" }}>
                FreelAI doesn&apos;t wait for prompts. It actively analyzes your sales pipeline, milestone statuses, and client communications to feed critical recommendations directly to your dashboard.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
                <div style={{ display: "flex", gap: "var(--spacing-12)" }}>
                  <TrendingUp size={16} color="var(--color-pulse-green)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>Predictive Client Health</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Analyzes feedback cycles to warn you of risk elements before payments are delayed.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-12)" }}>
                  <FileText size={16} color="var(--color-signal-teal)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>Automated Milestone Trigger</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Auto-compiles invoices when scopes are completed, reducing collections friction.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive UI Pane */}
            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-24)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-16)",
              }}
            >
              <div className="flex-between" style={{ borderBottom: "0.5px solid var(--border)", paddingBottom: "var(--spacing-12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-8)" }}>
                  <Sparkles size={14} color="var(--color-iris-violet)" />
                  <span style={{ fontSize: "var(--text-caption)", fontWeight: 510, color: "var(--text-primary)" }}>Active Recommendations</span>
                </div>
                <span className="font-mono-meta" style={{ fontSize: "10px", color: "var(--text-muted)" }}>UPDATED JUST NOW</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
                {aiActions.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      padding: "var(--spacing-16)",
                      background: act.completed ? "rgba(39, 166, 68, 0.02)" : "var(--surface-2)",
                      border: act.completed ? "1px dashed var(--color-pulse-green)" : "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-12)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "13px", fontWeight: 510, color: act.completed ? "var(--text-muted)" : "var(--text-primary)", margin: 0 }}>
                        {act.title}
                      </h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                        {act.desc}
                      </p>
                    </div>

                    {!act.completed ? (
                      <Button
                        variant={act.type === "match" ? "primary" : "secondary"}
                        size="sm"
                        style={{ width: "fit-content" }}
                        onClick={() => handleRunAiAction(act.id)}
                      >
                        {act.actionLabel}
                      </Button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--color-pulse-green)", fontWeight: 510, display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle size={12} /> Action Executed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ────────────────────────────────── */}
      <section
        id="journey"
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div className="container-main" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "var(--spacing-16)" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-6)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
              }}
            >
              <Zap size={11} />
              Simple Workflow
            </span>
          </div>

          <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
            Up and running in 3 steps
          </h2>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto var(--spacing-56) auto" }}>
            No complicated sheets or databases. FreelAI builds your operational core in minutes.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--spacing-24)",
              maxWidth: "900px",
              margin: "0 auto",
            }}
            className="grid-responsive-3"
          >
            {[
              {
                step: "01",
                title: "Import Profile",
                desc: "Upload your resume or past proposals. The AI parser instantly builds your portfolio catalog, rate structures, and skills context."
              },
              {
                step: "02",
                title: "Propose & Win",
                desc: "Paste any client brief. AI reviews matching data and drafts high-impact proposals with timeline phases and optimized price brackets."
              },
              {
                step: "03",
                title: "Deliver & Get Paid",
                desc: "Coordinate milestones. AI monitors progress, prompts client approvals, and routes payments instantly through escrow locks."
              }
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: "var(--spacing-24)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-12)",
                }}
              >
                <span style={{ fontSize: "var(--text-caption)", fontWeight: 510, color: "var(--color-brand)" }}>
                  {item.step}
                </span>
                <h4 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSFORMATION MATRIX (WITHOUT VS WITH) ──────────────── */}
      <section
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-56)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              The Transformation Matrix
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
              How running your business on FreelAI compares to traditional, admin-heavy freelance operations.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-24)",
              maxWidth: "800px",
              margin: "0 auto",
            }}
            className="grid-responsive-2"
          >
            {/* Column 1: Without */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "var(--spacing-8)" }}>
                Without FreelAI
              </h3>
              {[
                "Drafting proposals manually from scratch for every client brief.",
                "Scattering client data across spreadsheets, emails, and chat folders.",
                "Chasing clients for payment milestones and draft review sign-offs.",
                "Spending weekend hours reconciling invoices and bank statements."
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    padding: "var(--spacing-16)",
                    background: "var(--surface-1)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "var(--text-caption)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "var(--spacing-12)",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle size={14} color="var(--color-coral-red)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Column 2: With */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--color-pulse-green)", marginBottom: "var(--spacing-8)" }}>
                With FreelAI
              </h3>
              {[
                "AI auto-generates proposals based on your historical win records.",
                "Client CRM compiles communication, documents, and logs into one feed.",
                "AI monitors milestone deliverables and prompts automatic payment transfers.",
                "centralized business intelligence reports collections and tax logs."
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    padding: "var(--spacing-16)",
                    background: "var(--surface-1)",
                    border: "0.5px solid var(--color-pulse-green)33",
                    borderRadius: "var(--radius)",
                    fontSize: "var(--text-caption)",
                    color: "var(--text-primary)",
                    display: "flex",
                    gap: "var(--spacing-12)",
                    alignItems: "flex-start",
                  }}
                >
                  <CheckCircle size={14} color="var(--color-pulse-green)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOME-FOCUSED SOCIAL PROOF ─────────────────────────── */}
      <section
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-56)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              Outcome-Driven Results
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
              Verified freelancers scale their revenues and reclaim design hours.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--spacing-24)",
            }}
            className="grid-responsive-3"
          >
            {[
              {
                metric: "Saved 15 hours/week",
                desc: "“Before FreelAI, I spent Sundays building spreadsheets and drafting pitch scopes. Now the AI business partner drafts retainer contracts and syncs client milestones.”",
                author: "Sarah K.",
                role: "Product Designer"
              },
              {
                metric: "+40% Win Rate",
                desc: "“The proposal generator analyzed my past design contracts and suggested optimal price brackets. I won my last three pitches in record time.”",
                author: "David M.",
                role: "Full-Stack Developer"
              },
              {
                metric: "0 Overdue Invoices",
                desc: "“Payment escrow has been a game-changer. Clients lock in deposit milestones upfront, and automatic reminders chase final collections.”",
                author: "Elena R.",
                role: "3D Motion Animator"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "var(--spacing-28)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "var(--spacing-20)",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "18px", color: "var(--color-brand)", fontWeight: 510, margin: "0 0 var(--spacing-12) 0" }}>
                    {item.metric}
                  </h4>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "var(--spacing-12)", display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--text-caption)", fontWeight: 510, color: "var(--text-primary)" }}>{item.author}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY & PRIVATE AI FOUNDATION ────────────────────── */}
      <section
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="container-main">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "center",
            }}
            className="grid-responsive-2"
          >
            <div>
              <div style={{ marginBottom: "20px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--spacing-6)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-pulse-green)",
                  }}
                >
                  <Lock size={12} />
                  Enterprise Trust
                </span>
              </div>

              <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-16)" }}>
                Your Business. Private by Design.
              </h2>

              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--spacing-24)" }}>
                We believe your client data, proposals, and financials are your competitive advantage. FreelAI enforces absolute data separation.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)", fontSize: "13px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", gap: "var(--spacing-8)", alignItems: "center" }}>
                  <CheckCircle size={14} color="var(--color-pulse-green)" />
                  <span>Your proposal contents are never used to train global models.</span>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-8)", alignItems: "center" }}>
                  <CheckCircle size={14} color="var(--color-pulse-green)" />
                  <span>Secure bank-grade credentials with NextAuth authentication.</span>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-8)", alignItems: "center" }}>
                  <CheckCircle size={14} color="var(--color-pulse-green)" />
                  <span>Ready for syncing Stripe, QuickBooks, and calendars.</span>
                </div>
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-32)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-20)",
              }}
            >
              <h4 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0 }}>
                Integrations Pipeline
              </h4>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: 0 }}>
                FreelAI securely syncs with your business stack (coming soon):
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-12)" }}>
                {["Stripe", "QuickBooks", "Google Calendar", "Slack", "Figma", "Upwork"].map((stack) => (
                  <span
                    key={stack}
                    className="font-mono-meta"
                    style={{
                      padding: "var(--spacing-6) var(--spacing-12)",
                      background: "var(--surface-2)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {stack}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ─────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-48)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              Sleek, Transparent Plans
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto var(--spacing-28) auto" }}>
              Choose the plan that matches your freelance scale. Free to start, upgrade anytime.
            </p>

            {/* Toggle Billing */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-inputs)",
                padding: "3px",
              }}
            >
              <button
                onClick={() => setBillingPeriod("monthly")}
                style={{
                  padding: "var(--spacing-6) var(--spacing-16)",
                  background: billingPeriod === "monthly" ? "var(--surface-3)" : "transparent",
                  color: billingPeriod === "monthly" ? "var(--text-primary)" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "var(--text-caption)",
                  fontWeight: 510,
                  cursor: "pointer",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                style={{
                  padding: "var(--spacing-6) var(--spacing-16)",
                  background: billingPeriod === "annually" ? "var(--surface-3)" : "transparent",
                  color: billingPeriod === "annually" ? "var(--text-primary)" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "var(--text-caption)",
                  fontWeight: 510,
                  cursor: "pointer",
                }}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--spacing-24)",
              maxWidth: "960px",
              margin: "0 auto",
            }}
            className="grid-responsive-3"
          >
            {/* Starter Plan */}
            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-28)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "420px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 510 }}>STARTER</span>
                <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: "4px 0" }}>
                  Free
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-20)" }}>
                  Perfect for starting solopreneurs.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>✓ 3 proposal generation drafts / mo</span>
                  <span>✓ Client CRM (up to 5 clients)</span>
                  <span>✓ Basic invoicing tools</span>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="secondary" style={{ width: "100%", justifyContent: "center", marginTop: "var(--spacing-24)" }}>
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-28)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "420px",
                border: "2px solid var(--color-brand)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "24px",
                  background: "var(--color-brand)",
                  color: "var(--color-on-brand)",
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pills)",
                  textTransform: "uppercase",
                }}
              >
                RECOMMENDED
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--color-brand)", fontWeight: 510 }}>PRO PROFESSIONAL</span>
                <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: "4px 0" }}>
                  {billingPeriod === "annually" ? "$19" : "$24"}
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 400 }}> / month</span>
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-20)" }}>
                  For serious freelancers building pipelines.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>✓ Unlimited AI proposal drafts</span>
                  <span>✓ Unlimited clients & projects</span>
                  <span>✓ Proactive AI recommendation actions</span>
                  <span>✓ central financial analytics</span>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="primary" style={{ width: "100%", justifyContent: "center", marginTop: "var(--spacing-24)" }}>
                  Go Pro Now
                </Button>
              </Link>
            </div>

            {/* Agency Plan */}
            <div
              className="glass-card"
              style={{
                padding: "var(--spacing-28)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "420px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 510 }}>AGENCY</span>
                <h3 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", margin: "4px 0" }}>
                  {billingPeriod === "annually" ? "$49" : "$59"}
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 400 }}> / month</span>
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-20)" }}>
                  For boutique agencies and studios.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>✓ Unlimited proposal & contract sets</span>
                  <span>✓ Multi-contractor margin tracking</span>
                  <span>✓ Custom branding for client feeds</span>
                  <span>✓ Dedicated account managers</span>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="secondary" style={{ width: "100%", justifyContent: "center", marginTop: "var(--spacing-24)" }}>
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ─────────────────────────────────────────── */}
      <section
        style={{
          padding: "var(--spacing-80) 0",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-56)" }}>
            <h2 className="font-heading" style={{ fontSize: "var(--text-heading-sm)", marginBottom: "var(--spacing-12)" }}>
              Frequently Answered
            </h2>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
              Everything you need to know about setting up your freelance cockpit on FreelAI.
            </p>
          </div>

          <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
            {[
              {
                q: "Is FreelAI another freelancer marketplace?",
                a: "No. We do not charge marketplace commissions or control your relationship with clients. FreelAI is a private operations command center designed to organize and scale your existing business."
              },
              {
                q: "How does the AI Proposal Engine draft outlines?",
                a: "By pasting a job brief or project description, the AI analyzes your previous contract scopes, rate preferences, and matches key competencies to draft structured project proposal drafts."
              },
              {
                q: "Is my business data secure?",
                a: "Yes. All client records, proposal contents, and earnings logs are strictly separated and stored in isolated database vaults. We never use your proprietary business documents to train global AI models."
              },
              {
                q: "Can I try FreelAI with demo data?",
                a: "Absolutely. When you sign up, you can generate a demo workspace with one click to explore high-fidelity mock charts, client logs, and invoices before connecting your active projects."
              }
            ].map((faq, i) => {
              const open = activeFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--surface-1)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  <button
                    onClick={() => setActiveFaq(open ? null : i)}
                    style={{
                      width: "100%",
                      padding: "var(--spacing-16) var(--spacing-20)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      fontWeight: 510,
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      size={15}
                      style={{
                        transform: open ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        color: "var(--text-muted)",
                      }}
                    />
                  </button>
                  {open && (
                    <div
                      style={{
                        padding: "0 var(--spacing-20) var(--spacing-16) var(--spacing-20)",
                        fontSize: "var(--text-caption)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        animation: "fadeIn 0.20s ease-out",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL EMOTIONAL CTA ─────────────────────────────────── */}
      <section
        style={{
          padding: "var(--spacing-96) 0",
          borderTop: "0.5px solid var(--border)",
          background: "var(--surface-1)",
          textAlign: "center",
        }}
      >
        <div className="container-main">
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(30px, 5vw, 54px)",
              fontWeight: 510,
              color: "var(--text-primary)",
              marginBottom: "var(--spacing-16)",
              lineHeight: 1.1,
            }}
          >
            Reclaim your time. <br />
            Scale your business.
          </h2>
          <p
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--text-muted)",
              maxWidth: "480px",
              margin: "0 auto var(--spacing-36) auto",
              lineHeight: 1.5,
            }}
          >
            Leave the administrative dread behind. Start your AI business cockpit today and spend more time focusing on your core craft.
          </p>
          <Link href="/signup">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
