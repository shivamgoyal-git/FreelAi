"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  DollarSign,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Users,
  Eye,
  Sparkles,
  Target,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingFlow } from "@/components/features/onboarding/onboarding-flow";
import { CountUp } from "@/components/ui/CountUp";

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
    case "active":
    case "paid":
      return "active";
    case "in_review":
    case "on_hold":
    case "sent":
    case "partially_paid":
      return "pending";
    case "draft":
      return "draft";
    case "overdue":
      return "overdue";
    case "cancelled":
    case "inactive":
    case "archived":
    default:
      return "inactive";
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  design: "Design",
  development: "Development",
  illustration: "Illustration",
  video: "Video",
  writing: "Writing",
  marketing: "Marketing",
  consulting: "Consulting",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  design: "var(--color-iris-violet)",
  development: "var(--color-accent)",
  illustration: "var(--color-lavender)",
  video: "var(--color-coral-red)",
  writing: "var(--text-secondary)",
  marketing: "var(--color-pulse-green)",
  consulting: "var(--text-primary)",
  other: "var(--text-muted)",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  design: "linear-gradient(135deg, var(--color-iris-violet) 0%, rgba(99,102,241,0.3) 100%)",
  development: "linear-gradient(135deg, var(--color-accent) 0%, rgba(2,184,204,0.3) 100%)",
  illustration: "linear-gradient(135deg, var(--color-lavender) 0%, rgba(139,92,246,0.3) 100%)",
  video: "linear-gradient(135deg, var(--color-coral-red) 0%, rgba(235,87,87,0.3) 100%)",
  writing: "linear-gradient(135deg, var(--text-secondary) 0%, rgba(208,214,224,0.3) 100%)",
  marketing: "linear-gradient(135deg, var(--color-pulse-green) 0%, rgba(39,166,68,0.3) 100%)",
  consulting: "linear-gradient(135deg, var(--text-primary) 0%, rgba(229,229,230,0.3) 100%)",
  other: "linear-gradient(135deg, var(--text-muted) 0%, rgba(138,143,152,0.3) 100%)",
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--info)" },
  active: { label: "Active", color: "var(--success)" },
  in_review: { label: "In Review", color: "var(--warning)" },
  completed: { label: "Completed", color: "var(--success)" },
  on_hold: { label: "On Hold", color: "var(--warning)" },
  cancelled: { label: "Cancelled", color: "var(--error)" },
};

interface DashboardChartItem {
  month: string;
  earnings: number;
  projects: number;
}

interface DashboardActivityItem {
  _id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface DashboardProjectItem {
  _id: string;
  title: string;
  clientName?: string;
  category: string;
  progress: number;
  budget: number;
  dueDate?: string;
  status: string;
}

const getActivityConfig = (type: string) => {
  switch (type) {
    case "client_added":
      return {
        icon: Users,
        iconBg: "rgba(245,158,11,0.12)",
        iconColor: "#f59e0b",
        label: "Client Added",
      };
    case "proposal_generated":
      return {
        icon: Target,
        iconBg: "rgba(228,242,34,0.12)",
        iconColor: "var(--color-brand)",
        label: "Proposal Generated",
      };
    case "invoice_paid":
      return {
        icon: DollarSign,
        iconBg: "rgba(39,166,68,0.12)",
        iconColor: "var(--color-pulse-green)",
        label: "Invoice Paid",
      };
    case "antigravity_prompt":
    default:
      return {
        icon: Sparkles,
        iconBg: "rgba(99,102,241,0.12)",
        iconColor: "var(--color-iris-violet)",
        label: "AI Recommendation",
      };
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardStaggerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 30 },
  },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projectFilter, setProjectFilter] = useState("All");
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(null);

  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    actualPaidRevenue: 0,
    pendingInvoicesSum: 0,
    overdueInvoicesSum: 0,
    overdueInvoicesCount: 0,
  });

  const [proposalsStats, setProposalsStats] = useState({
    total: 0,
    won: 0,
    lost: 0,
    sent: 0,
    draft: 0,
    averageAiScore: 0,
    conversionRate: 0,
  });

  const [projectHealth, setProjectHealth] = useState({
    totalActive: 0,
    atRiskCount: 0,
    onTrackCount: 0,
  });

  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [chartData, setChartData] = useState<DashboardChartItem[]>([]);
  const [activities, setActivities] = useState<DashboardActivityItem[]>([]);
  const [dbProjects, setDbProjects] = useState<DashboardProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiAction, setAiAction] = useState<"prompt" | "proposal">("prompt");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [animatedResponse, setAnimatedResponse] = useState("");

  const userName = session?.user?.name ?? "Freelancer";

  const fetchDashboardData = async (silent = false) => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setProposalsStats(data.proposalsStats || {
          total: 0,
          won: 0,
          lost: 0,
          sent: 0,
          draft: 0,
          averageAiScore: 0,
          conversionRate: 0,
        });
        setProjectHealth(data.projectHealth || {
          totalActive: 0,
          atRiskCount: 0,
          onTrackCount: 0,
        });
        setUpcomingDeadlines(data.upcomingDeadlines || []);
        setTopClients(data.topClients || []);
        setChartData(data.chartData || []);
        setActivities(data.activities || []);
        setDbProjects(data.recentProjects || []);

        if (!silent) {
          toast.success("Dashboard metrics synchronized");
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to sync dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileCompleteness(data.profile.profileCompleteness);
        } else if (res.status === 404 || res.status === 403) {
          setProfileCompleteness(0);
        }
      } catch (err) {
        console.error("Failed to check profile completeness:", err);
      }
    };
    if (session?.user?.id) {
      loadProfileStatus();
    }
  }, [session]);

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAnimatedResponse("");
    toast.info("Sending prompt to AI Copilot...");

    try {
      const res = await fetch("/api/dashboard/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: aiAction, promptText: aiPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Response generated successfully");
        let i = 0;
        const text = data.response;
        const timer = setInterval(() => {
          if (i < text.length) {
            setAnimatedResponse((prev) => prev + text.charAt(i));
            i += 1;
          } else {
            clearInterval(timer);
          }
        }, 8);

        setAiPrompt("");
        fetchDashboardData(true);
      } else {
        setAnimatedResponse(`Error: ${data.error || "Failed to process Action"}`);
        toast.error("AI Copilot failed to process request");
      }
    } catch {
      setAnimatedResponse("Network connection error. Please try again.");
      toast.error("Network connection error");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredProjects =
    projectFilter === "All"
      ? dbProjects
      : dbProjects.filter((p) => {
          if (projectFilter === "In Progress")
            return p.status === "active" || p.status === "in_review" || p.status === "on_hold";
          if (projectFilter === "Completed") return p.status === "completed";
          return true;
        });

  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "4px 0",
      }}
    >
      <OnboardingFlow />

      {/* ── $100M SAAS MISSION CONTROL HEADER ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "0.5px solid var(--border)",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 className="font-heading" style={{ fontSize: "20px", fontWeight: 510, letterSpacing: "-0.015em", color: "var(--text-primary)", margin: 0 }}>
                Mission Control
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 510,
                  fontFamily: "var(--font-berkeley-mono), ui-monospace, monospace",
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--border)",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-badges)",
                  color: "var(--text-muted)",
                }}
              >
                LIVE
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
              {formattedToday} • Welcome back, {userName.split(" ")[0]}
            </p>
          </div>
        </div>

        {/* Toolbar & Shortcuts */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/dashboard/proposals">
            <Button variant="ghost" size="sm" leftIcon={<Sparkles size={13} />}>
              Proposal
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm" leftIcon={<DollarSign size={13} />}>
              Invoice
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              rightIcon={
                <kbd
                  style={{
                    fontFamily: "var(--font-berkeley-mono), ui-monospace, monospace",
                    fontSize: "9px",
                    opacity: 0.7,
                    marginLeft: "2px",
                  }}
                >
                  ⌘N
                </kbd>
              }
            >
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* ── HIGH DENSITY LOADING SKELETON (SHIMMER) ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ height: "64px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} className="skeleton" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: "96px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="skeleton" style={{ height: "260px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
              <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="skeleton" style={{ height: "220px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
              <div className="skeleton" style={{ height: "240px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* ── PROFILE ONBOARDING BANNER ── */}
          {profileCompleteness !== null && profileCompleteness < 100 && (
            <motion.div
              variants={cardStaggerVariants}
              style={{
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderLeft: "3px solid var(--color-brand)",
                borderRadius: "var(--radius-cards)",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "14px",
                    fontWeight: 510,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  <Sparkles size={14} color="var(--color-brand)" /> Complete your Freelancer Profile
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", margin: 0, maxWidth: "560px", lineHeight: 1.45 }}>
                  Configure your skills registry and service rates to activate AI-powered proposal auto-matching, dunning scripts, and rate optimizations.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", alignItems: "flex-end" }}>
                  <span style={{ fontSize: "10px", fontWeight: 510, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</span>
                  <span style={{ fontSize: "13px", fontWeight: 590, color: "var(--color-brand)", fontVariantNumeric: "tabular-nums" }}>
                    <CountUp value={profileCompleteness} suffix="%" />
                  </span>
                </div>
                <Link href="/dashboard/profile">
                  <Button variant="primary" size="sm">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── DAILY AI BRIEFING BANNER ── */}
          <motion.div
            variants={cardStaggerVariants}
            style={{
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderLeft: "3px solid var(--color-iris-violet)",
              borderRadius: "var(--radius-cards)",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={13} color="var(--color-iris-violet)" />
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "11px",
                    fontWeight: 590,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-iris-violet)",
                    margin: 0,
                  }}
                >
                  Daily Briefing
                </h3>
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-berkeley-mono), monospace" }}>
                AUTO-SYNCED
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "12px",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: 590 }}>•</span>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  Active pipeline: <strong>{stats.activeProjects}</strong> projects, <strong>{stats.totalClients}</strong> registered clients.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: 590 }}>•</span>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  {stats.overdueInvoicesCount > 0 ? (
                    <span style={{ color: "var(--color-coral-red)" }}>
                      ⚠️ <strong>{stats.overdueInvoicesCount} overdue</strong> invoice ($
                      {stats.overdueInvoicesSum.toLocaleString()}).
                    </span>
                  ) : (
                    "✓ Collection status: Invoices are current."
                  )}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: 590 }}>•</span>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  {projectHealth.atRiskCount > 0 ? (
                    <span style={{ color: "var(--warning)" }}>
                      🚨 <strong>{projectHealth.atRiskCount} project</strong> approaching deadline threshold.
                    </span>
                  ) : (
                    "✓ Milestone status: Deliverables on track."
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── FINANCIAL KPIS GRID ── */}
          <motion.div
            variants={containerVariants}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
            }}
            className="grid-responsive-4"
          >
            <motion.div variants={cardStaggerVariants}>
              <StatCard
                label="Total Earnings"
                value={<CountUp value={stats.totalRevenue} prefix="$" />}
                icon={<DollarSign />}
                accentColor="var(--color-pulse-green)"
                change="Lifetime contract total"
              />
            </motion.div>
            <motion.div variants={cardStaggerVariants}>
              <StatCard
                label="Awaiting Payment"
                value={<CountUp value={stats.pendingInvoices} prefix="$" />}
                icon={<Clock />}
                accentColor="var(--warning)"
                change="Pending & sent balances"
              />
            </motion.div>
            <motion.div variants={cardStaggerVariants}>
              <StatCard
                label="Overdue Invoices"
                value={<CountUp value={stats.overdueInvoicesSum} prefix="$" />}
                icon={<AlertTriangle />}
                accentColor={stats.overdueInvoicesCount > 0 ? "var(--color-coral-red)" : "var(--text-muted)"}
                change={`${stats.overdueInvoicesCount} overdue`}
              />
            </motion.div>
            <motion.div variants={cardStaggerVariants}>
              <StatCard
                label="AI Proposal Score"
                value={proposalsStats.total > 0 ? <CountUp value={proposalsStats.averageAiScore} suffix="%" /> : "—"}
                icon={<Target />}
                accentColor="var(--color-iris-violet)"
                change={`${proposalsStats.total} proposals created`}
              />
            </motion.div>
          </motion.div>

          {/* ── HIGH DENSITY WORKSPACE GRID ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "20px",
              alignItems: "flex-start",
            }}
            className="grid-responsive-2"
          >
            {/* LEFT COLUMN: REVENUE CHART & PROJECTS FEED */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
              
              {/* Earnings Overview Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35, ease: "easeOut" }}
                className="glass-card"
                style={{ padding: "20px", borderRadius: "var(--radius-cards)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>
                      Earnings Overview
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                      Monthly financial velocity (YTD)
                    </p>
                  </div>
                  <Badge variant="active">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <TrendingUp size={11} />
                      YTD Active
                    </span>
                  </Badge>
                </div>

                <div style={{ width: "100%", height: "210px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (v === 0 ? "$0" : `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface-2)",
                          border: "0.5px solid var(--border-strong)",
                          borderRadius: "var(--radius-inputs)",
                          fontSize: "11.5px",
                        }}
                        itemStyle={{ color: "var(--text-primary)" }}
                        labelStyle={{ color: "var(--text-muted)", fontWeight: 510 }}
                        formatter={(value) => ["$" + Number(value || 0).toLocaleString(), "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="var(--color-brand)"
                        strokeWidth={2}
                        dot={{ stroke: "var(--color-brand)", strokeWidth: 1, r: 2.5, fill: "var(--bg-surface)" }}
                        activeDot={{ r: 4.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Proposal Funnel Summary */}
              <motion.div
                variants={cardStaggerVariants}
                className="glass-card"
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-cards)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0 }}>
                    Proposal Funnel
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                    Win rate metrics
                  </p>

                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Win Rate</span>
                      <span style={{ fontSize: "13px", fontWeight: 590, color: "var(--color-pulse-green)", fontVariantNumeric: "tabular-nums" }}>
                        <CountUp value={proposalsStats.conversionRate} suffix="%" />
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "var(--surface-2)", borderRadius: "2px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proposalsStats.conversionRate}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        style={{
                          height: "100%",
                          background: "var(--color-pulse-green)",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Sent</span>
                      <span style={{ fontSize: "11.5px", fontWeight: 510, fontVariantNumeric: "tabular-nums" }}>{proposalsStats.sent}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Won</span>
                      <span style={{ fontSize: "11.5px", fontWeight: 510, fontVariantNumeric: "tabular-nums" }}>{proposalsStats.won}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderLeft: "0.5px solid var(--border)",
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h4 style={{ fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 590, letterSpacing: "0.06em", margin: 0 }}>
                    Est. Pipeline LTV
                  </h4>
                  <div style={{ fontSize: "22px", fontWeight: 590, color: "var(--text-primary)", marginTop: "3px", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                    <CountUp value={proposalsStats.won * 2500} prefix="$" />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                    Won contract value sum
                  </p>
                </div>
              </motion.div>

              {/* Active Projects Table */}
              <motion.div variants={cardStaggerVariants} className="glass-card" style={{ padding: "20px", borderRadius: "var(--radius-cards)" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0 }}>
                      Active Projects
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>
                      Active contract deliverables
                    </p>
                  </div>

                  <div className="filter-tabs" style={{ background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-inputs)" }}>
                    {["All", "In Progress", "Completed"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setProjectFilter(f)}
                        className={`filter-tab${projectFilter === f ? " active" : ""}`}
                        style={{ fontSize: "11.5px", padding: "3px 10px", position: "relative" }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  {filteredProjects.length === 0 ? (
                    <EmptyState
                      icon={<Briefcase />}
                      heading="No active projects"
                      description="Create new active projects or adjust filter parameters."
                      actionLabel="Create Project"
                      onActionClick={() => window.location.href = "/dashboard/projects"}
                    />
                  ) : (
                    <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "0.5px solid var(--border)", textAlign: "left" }}>
                          <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project</th>
                          <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                          <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</th>
                          <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget</th>
                          <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                          <th style={{ padding: "8px 10px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => {
                          const categoryLabel = CATEGORY_LABELS[project.category] || project.category;
                          const categoryColor = CATEGORY_COLORS[project.category] || "var(--text-muted)";
                          const gradient = CATEGORY_GRADIENTS[project.category] || CATEGORY_GRADIENTS.other;
                          const sCfg = STATUS_CFG[project.status] || { label: project.status, color: "var(--info)" };

                          return (
                            <tr key={project._id} style={{ borderBottom: "0.5px solid var(--border)" }}>
                              <td style={{ padding: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div
                                    className="avatar"
                                    style={{
                                      width: "26px",
                                      height: "26px",
                                      background: gradient,
                                      fontSize: "10.5px",
                                      fontWeight: 590,
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {project.title.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: "13px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>
                                      {project.title}
                                    </p>
                                    <p style={{ fontSize: "10.5px", color: "var(--text-muted)", margin: 0 }}>
                                      {project.clientName || "Direct Client"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: "10px",
                                    background: `${categoryColor}12`,
                                    color: categoryColor,
                                    border: `0.5px solid ${categoryColor}25`,
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-badges)",
                                  }}
                                >
                                  {categoryLabel}
                                </span>
                              </td>
                              <td style={{ padding: "10px", minWidth: "90px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <div className="progress-bar" style={{ flex: 1, height: "4px", background: "var(--surface-2)", borderRadius: "2px", overflow: "hidden" }}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${project.progress}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      className="progress-fill"
                                      style={{ height: "100%", background: "var(--color-brand)" }}
                                    />
                                  </div>
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "26px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                                    {project.progress}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span style={{ fontSize: "12.5px", fontWeight: 510, fontVariantNumeric: "tabular-nums" }}>
                                  ${project.budget.toLocaleString()}
                                </span>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <Badge variant={getBadgeVariant(project.status)}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                    {project.status === "active" && <Clock size={9} />}
                                    {project.status === "completed" && <CheckCircle size={9} />}
                                    <span>{sCfg.label}</span>
                                  </span>
                                </Badge>
                              </td>
                              <td style={{ padding: "10px", textAlign: "right" }}>
                                <Link href={`/dashboard/projects/${project._id}`}>
                                  <Button variant="ghost" size="icon" style={{ width: "24px", height: "24px" }}>
                                    <Eye size={12} />
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDEBAR: AI COPILOT & CRM INTELLIGENCE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* AI Copilot Panel */}
              <motion.div
                variants={cardStaggerVariants}
                style={{
                  background: "var(--surface-1)",
                  border: "0.5px solid var(--border)",
                  borderTop: "3px solid var(--color-iris-violet)",
                  borderRadius: "var(--radius-cards)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={14} color="var(--color-iris-violet)" />
                  <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0 }}>
                    AI Copilot Workspace
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    borderBottom: "0.5px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAiAction("prompt");
                      setAnimatedResponse("");
                    }}
                    style={{
                      padding: "4px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: aiAction === "prompt" ? "2px solid var(--color-iris-violet)" : "2px solid transparent",
                      color: aiAction === "prompt" ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 510,
                      cursor: "pointer",
                    }}
                  >
                    Quick Ask
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiAction("proposal");
                      setAnimatedResponse("");
                    }}
                    style={{
                      padding: "4px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: aiAction === "proposal" ? "2px solid var(--color-iris-violet)" : "2px solid transparent",
                      color: aiAction === "proposal" ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 510,
                      cursor: "pointer",
                    }}
                  >
                    Pitch Draft
                  </button>
                </div>

                <form onSubmit={handleAiSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={
                      aiAction === "prompt"
                        ? "Ask outreach tips, project scoping details, rates..."
                        : "Enter project details (e.g. Mobile App Redesign, $4,000)..."
                    }
                    rows={3}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-base)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-inputs)",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-iris-violet)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                  <Button
                    type="submit"
                    disabled={aiLoading}
                    variant="primary"
                    size="sm"
                    style={{ width: "100%", justifyContent: "center" }}
                    leftIcon={
                      aiLoading ? (
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Zap size={13} />
                      )
                    }
                  >
                    {aiLoading ? "Thinking..." : aiAction === "prompt" ? "Ask AI" : "Generate Draft"}
                  </Button>
                </form>

                <AnimatePresence>
                  {animatedResponse && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        padding: "10px",
                        background: "var(--bg-base)",
                        border: "0.5px solid var(--border-strong)",
                        borderRadius: "var(--radius-inputs)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                        fontFamily: "var(--font-berkeley-mono), monospace",
                      }}
                    >
                      {animatedResponse}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* CRM Client Intelligence */}
              <motion.div variants={cardStaggerVariants} className="glass-card" style={{ padding: "18px", borderRadius: "var(--radius-cards)" }}>
                <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, marginBottom: "12px", margin: 0 }}>
                  Top Clients
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {topClients.length === 0 ? (
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>No clients registered yet.</p>
                  ) : (
                    topClients.map((client) => {
                      const healthColor =
                        client.relationshipHealth === "Good"
                          ? "var(--color-pulse-green)"
                          : client.relationshipHealth === "Fair"
                          ? "var(--warning)"
                          : "var(--color-coral-red)";
                      return (
                        <div
                          key={client.clientId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingBottom: "8px",
                            borderBottom: "0.5px solid var(--border)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "var(--radius-inputs)",
                                background: "var(--surface-2)",
                                color: "var(--text-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10.5px",
                                fontWeight: 590,
                              }}
                            >
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "12px", fontWeight: 510, margin: 0 }}>{client.name}</p>
                              <p style={{ fontSize: "10.5px", color: "var(--text-muted)", margin: 0 }}>{client.company}</p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", fontWeight: 510, fontVariantNumeric: "tabular-nums" }}>
                              <CountUp value={client.revenue} prefix="$" />
                            </div>
                            <span
                              style={{
                                fontSize: "9.5px",
                                color: healthColor,
                                fontWeight: 510,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <span
                                style={{
                                  width: "4px",
                                  height: "4px",
                                  borderRadius: "50%",
                                  background: healthColor,
                                }}
                              />
                              {client.relationshipHealth}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Upcoming Deadlines */}
              <motion.div variants={cardStaggerVariants} className="glass-card" style={{ padding: "18px", borderRadius: "var(--radius-cards)" }}>
                <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, marginBottom: "12px", margin: 0 }}>
                  Upcoming Deadlines
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                  {upcomingDeadlines.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", padding: "4px 0" }}>
                      <CheckCircle size={13} color="var(--color-pulse-green)" />
                      <span style={{ fontSize: "11.5px" }}>No deadlines next 14 days</span>
                    </div>
                  ) : (
                    upcomingDeadlines.map((deadline) => {
                      const isUrgent = deadline.daysLeft <= 3;
                      return (
                        <div
                          key={deadline.projectId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            background: "var(--surface-2)",
                            borderRadius: "var(--radius-inputs)",
                            border: "0.5px solid var(--border)",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 510,
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                maxWidth: "150px",
                              }}
                            >
                              {deadline.title}
                            </span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                              {deadline.clientName}
                            </span>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 590,
                                color: isUrgent ? "var(--color-coral-red)" : "var(--text-secondary)",
                              }}
                            >
                              {deadline.daysLeft === 0
                                ? "Due today"
                                : deadline.daysLeft === 1
                                ? "Due tomorrow"
                                : `In ${deadline.daysLeft}d`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Recent Activity Timeline */}
              <motion.div variants={cardStaggerVariants} className="glass-card" style={{ padding: "18px", borderRadius: "var(--radius-cards)" }}>
                <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, marginBottom: "12px", margin: 0 }}>
                  Recent Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                  {activities.slice(0, 4).map((activity) => {
                    const cfg = getActivityConfig(activity.type);
                    return (
                      <div key={activity._id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: cfg.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <cfg.icon size={10} color={cfg.iconColor} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "11.5px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>
                            {activity.title}
                          </p>
                          <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1px", margin: 0 }}>
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
