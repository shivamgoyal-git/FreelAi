"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  DollarSign,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Plus,
  Users,
  Calendar,
  Eye,
  Sparkles,
  Target,
  Loader2,
  Bell,
  AlertTriangle,
  ArrowUpRight,
  User,
  Heart,
  ChevronUp,
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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingFlow } from "@/components/features/onboarding/onboarding-flow";

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
  development: "var(--color-signal-teal)",
  illustration: "var(--color-lavender)",
  video: "var(--color-coral-red)",
  writing: "var(--color-mist)",
  marketing: "var(--color-pulse-green)",
  consulting: "var(--color-bone)",
  other: "var(--color-fog)",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  design: "linear-gradient(135deg, var(--color-iris-violet) 0%, rgba(99,102,241,0.5) 100%)",
  development: "linear-gradient(135deg, var(--color-signal-teal) 0%, rgba(2,184,204,0.5) 100%)",
  illustration: "linear-gradient(135deg, var(--color-lavender) 0%, rgba(139,92,246,0.5) 100%)",
  video: "linear-gradient(135deg, var(--color-coral-red) 0%, rgba(235,87,87,0.5) 100%)",
  writing: "linear-gradient(135deg, var(--color-mist) 0%, rgba(208,214,224,0.5) 100%)",
  marketing: "linear-gradient(135deg, var(--color-pulse-green) 0%, rgba(39,166,68,0.5) 100%)",
  consulting: "linear-gradient(135deg, var(--color-bone) 0%, rgba(229,229,230,0.5) 100%)",
  other: "linear-gradient(135deg, var(--color-fog) 0%, rgba(138,143,152,0.5) 100%)",
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--info)" },
  active: { label: "Active", color: "var(--success)" },
  in_review: { label: "In Review", color: "var(--warning)" },
  completed: { label: "Completed", color: "var(--success)" },
  on_hold: { label: "On Hold", color: "var(--warning)" },
  cancelled: { label: "Cancelled", color: "var(--error)" },
};

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
        iconBg: "rgba(245,158,11,0.15)",
        iconColor: "#f59e0b",
        label: "Client Added",
      };
    case "proposal_generated":
      return {
        icon: Target,
        iconBg: "var(--primary-light)",
        iconColor: "var(--primary)",
        label: "Proposal Generated",
      };
    case "invoice_paid":
      return {
        icon: DollarSign,
        iconBg: "var(--success-bg)",
        iconColor: "var(--success)",
        label: "Invoice Paid",
      };
    case "antigravity_prompt":
    default:
      return {
        icon: Sparkles,
        iconBg: "rgba(6,182,212,0.15)",
        iconColor: "var(--info)",
        label: "Antigravity Prompt",
      };
  }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projectFilter, setProjectFilter] = useState("All");
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(null);

  // Stats States
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

  // Copilot States
  const [aiAction, setAiAction] = useState<"prompt" | "proposal">("prompt");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [animatedResponse, setAnimatedResponse] = useState("");

  const userName = session?.user?.name ?? "Freelancer";

  const fetchDashboardData = async () => {
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
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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
    fetchDashboardData();
  }, []);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAnimatedResponse("");

    try {
      const res = await fetch("/api/dashboard/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: aiAction, promptText: aiPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
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
        fetchDashboardData();
      } else {
        setAnimatedResponse(`Error: ${data.error || "Failed to process Action"}`);
      }
    } catch {
      setAnimatedResponse("Network connection error. Please try again.");
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

  // Calculate dynamic welcome subtitle date
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      <OnboardingFlow />

      {/* ── MISSION CONTROL HEADER ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "20px",
        }}
      >
        <div>
          <h1 className="font-heading" style={{ fontSize: "28px", letterSpacing: "-0.02em" }}>
            Mission Control
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
            {formattedToday} • Welcome back, {userName.split(" ")[0]}
          </p>
        </div>

        {/* Header Action Tools */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/dashboard/proposals">
            <Button variant="outline" size="sm" leftIcon={<Sparkles size={14} />}>
              Draft Proposal
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm" leftIcon={<DollarSign size={14} />}>
              Create Invoice
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ height: "70px", borderRadius: "var(--radius)", background: "var(--surface-2)" }} className="skeleton" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />
              <div className="skeleton" style={{ height: "340px", borderRadius: "var(--radius-lg)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="skeleton" style={{ height: "240px", borderRadius: "var(--radius-lg)" }} />
              <div className="skeleton" style={{ height: "280px", borderRadius: "var(--radius-lg)" }} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── PROFILE COMPLETION ONBOARDING CARD ── */}
          {profileCompleteness !== null && profileCompleteness < 100 && (
            <div
              style={{
                background: "linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
                border: "0.5px solid var(--border-strong)",
                borderLeft: "4px solid var(--color-brand)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ flex: 1, minWidth: "280px" }}>
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-primary)",
                  }}
                >
                  <Sparkles size={16} color="var(--color-brand)" /> Complete your Freelancer Profile
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
                  Configure your skills registry and service rates to activate AI-powered proposal auto-matching, dunning scripts, and rate optimizations.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>Onboarding Stage</span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--color-brand)" }}>
                    {profileCompleteness}% Finished
                  </span>
                </div>
                <Link href="/dashboard/profile">
                  <Button variant="primary" size="sm">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ── DAILY AI BRIEFING BANNER ── */}
          <div
            style={{
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={14} color="var(--color-iris-violet)" />
              </div>
              <h3
                className="font-heading"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-iris-violet)",
                }}
              >
                Daily AI Briefing
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                fontSize: "13.5px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: "bold" }}>•</span>
                <p>
                  You have <strong>{stats.activeProjects}</strong> active projects and{" "}
                  <strong>{stats.totalClients}</strong> clients registered in your pipeline.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: "bold" }}>•</span>
                <p>
                  {stats.overdueInvoicesCount > 0 ? (
                    <span style={{ color: "var(--error)" }}>
                      ⚠️ <strong>{stats.overdueInvoicesCount} overdue</strong> invoice(s) outstanding ($
                      {stats.overdueInvoicesSum.toLocaleString()}). Action needed.
                    </span>
                  ) : (
                    "✓ Financial collection status: All active invoices are currently up to date."
                  )}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "var(--color-iris-violet)", fontWeight: "bold" }}>•</span>
                <p>
                  {projectHealth.atRiskCount > 0 ? (
                    <span style={{ color: "var(--warning)" }}>
                      🚨 <strong>{projectHealth.atRiskCount} project(s)</strong> are approaching deadline limits with low completion percentages.
                    </span>
                  ) : (
                    "✓ Project schedule status: Active milestones are on track."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ── REVENUE & FINANCIAL KPIS ── */}
          <div className="grid-responsive-4">
            <StatCard
              label="Total Earnings"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign />}
              accentColor="var(--success)"
              change="Aggregated contract earnings"
            />
            <StatCard
              label="Awaiting Payment"
              value={`$${stats.pendingInvoices.toLocaleString()}`}
              icon={<Clock />}
              accentColor="var(--warning)"
              change="Unbilled & sent balances"
            />
            <StatCard
              label="Overdue Invoices"
              value={`$${stats.overdueInvoicesSum.toLocaleString()}`}
              icon={<AlertTriangle />}
              accentColor={stats.overdueInvoicesCount > 0 ? "var(--error)" : "var(--text-muted)"}
              change={`${stats.overdueInvoicesCount} invoices overdue`}
            />
            <StatCard
              label="AI Proposals Score"
              value={proposalsStats.total > 0 ? `${proposalsStats.averageAiScore}%` : "—"}
              icon={<Target />}
              accentColor="var(--color-iris-violet)"
              change={`${proposalsStats.total} total proposals generated`}
            />
          </div>

          {/* ── MISSION GRID ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
              alignItems: "flex-start",
            }}
            className="grid-responsive-2"
          >
            {/* LEFT SIDEBAR: CONTENT & CHARTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
              
              {/* Business Health Overview (Line Chart) */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "16px", fontWeight: 700 }}>
                      Earnings Overview
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Monthly revenue trend chart for the current year
                    </p>
                  </div>
                  <Badge variant="active">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <TrendingUp size={11} />
                      Active Year
                    </span>
                  </Badge>
                </div>

                <div style={{ width: "100%", height: "240px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (v === 0 ? "$0" : `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface-2)",
                          border: "0.5px solid var(--border-strong)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "var(--text-primary)" }}
                        labelStyle={{ color: "var(--text-muted)", fontWeight: 700 }}
                        formatter={(value) => ["$" + Number(value || 0).toLocaleString(), "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="var(--color-brand)"
                        strokeWidth={2}
                        dot={{ stroke: "var(--color-brand)", strokeWidth: 1, r: 3, fill: "var(--bg-surface)" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Proposals Performance & Conversion rates */}
              <div
                className="glass-card"
                style={{
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <div>
                  <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700 }}>
                    Proposal Funnel
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Performance metrics matching won proposals
                  </p>

                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Win Rate</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--success)" }}>
                        {proposalsStats.conversionRate}%
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "var(--surface-2)", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${proposalsStats.conversionRate}%`,
                          height: "100%",
                          background: "var(--success)",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Proposals Sent</span>
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{proposalsStats.sent}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Proposals Won</span>
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{proposalsStats.won}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderLeft: "1px solid var(--border)",
                    paddingLeft: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h4 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                    Proposal LTV Value
                  </h4>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                    ${(proposalsStats.won * 2500).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Est. pipeline contract values won
                  </p>
                </div>
              </div>

              {/* Active Projects Feed */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "16px", fontWeight: 700 }}>
                      Active Projects
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Workspaces tracking active contracts
                    </p>
                  </div>

                  <div className="filter-tabs">
                    {["All", "In Progress", "Completed"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setProjectFilter(f)}
                        className={`filter-tab${projectFilter === f ? " active" : ""}`}
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
                      heading="No projects matched"
                      description="Create new active projects or adjust filter parameters."
                    />
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Category</th>
                          <th>Progress</th>
                          <th>Budget</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => {
                          const categoryLabel = CATEGORY_LABELS[project.category] || project.category;
                          const categoryColor = CATEGORY_COLORS[project.category] || "var(--text-muted)";
                          const gradient = CATEGORY_GRADIENTS[project.category] || CATEGORY_GRADIENTS.other;
                          const sCfg = STATUS_CFG[project.status] || { label: project.status, color: "var(--info)" };

                          return (
                            <tr key={project._id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div
                                    className="avatar"
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      background: gradient,
                                      fontSize: "11px",
                                      fontWeight: 800,
                                    }}
                                  >
                                    {project.title.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                                      {project.title}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                      {project.clientName || "Direct Project"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: "10.5px",
                                    background: `${categoryColor}15`,
                                    color: categoryColor,
                                    border: `1px solid ${categoryColor}25`,
                                  }}
                                >
                                  {categoryLabel}
                                </span>
                              </td>
                              <td style={{ minWidth: "100px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div className="progress-bar" style={{ flex: 1, height: "4px" }}>
                                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                                  </div>
                                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)", width: "28px", textAlign: "right" }}>
                                    {project.progress}%
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                                  ${project.budget.toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                  {project.dueDate
                                    ? new Date(project.dueDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "—"}
                                </span>
                              </td>
                              <td>
                                <Badge variant={getBadgeVariant(project.status)}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {project.status === "active" && <Clock size={10} />}
                                    {project.status === "completed" && <CheckCircle size={10} />}
                                    <span>{sCfg.label}</span>
                                  </span>
                                </Badge>
                              </td>
                              <td>
                                <Link href={`/dashboard/projects/${project._id}`}>
                                  <Button variant="ghost" size="icon" style={{ width: "26px", height: "26px" }}>
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
              </div>
            </div>

            {/* RIGHT SIDEBAR: COPILOT & CRM */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* AI Copilot Panel */}
              <div
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderTop: "3px solid var(--color-iris-violet)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} color="var(--color-iris-violet)" />
                  <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700 }}>
                    AI Copilot Workspace
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAiAction("prompt");
                      setAnimatedResponse("");
                    }}
                    style={{
                      padding: "6px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: aiAction === "prompt" ? "2px solid var(--color-iris-violet)" : "2px solid transparent",
                      color: aiAction === "prompt" ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "13px",
                      fontWeight: 600,
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
                      padding: "6px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: aiAction === "proposal" ? "2px solid var(--color-iris-violet)" : "2px solid transparent",
                      color: aiAction === "proposal" ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Pitch Draft
                  </button>
                </div>

                <form onSubmit={handleAiSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                      padding: "10px",
                      background: "var(--bg-base)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "12.5px",
                      color: "var(--text-primary)",
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "none",
                    }}
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

                {animatedResponse && (
                  <div
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                      padding: "10px 12px",
                      background: "var(--bg-base)",
                      border: "0.5px solid var(--border-strong)",
                      borderRadius: "var(--radius)",
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    {animatedResponse}
                  </div>
                )}
              </div>

              {/* CRM Client Intelligence */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>
                  Top Clients
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {topClients.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No clients registered yet.</p>
                  ) : (
                    topClients.map((client) => {
                      const healthColor =
                        client.relationshipHealth === "Good"
                          ? "var(--success)"
                          : client.relationshipHealth === "Fair"
                          ? "var(--warning)"
                          : "var(--error)";
                      return (
                        <div
                          key={client.clientId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingBottom: "10px",
                            borderBottom: "0.5px solid var(--border)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                background: "var(--surface-2)",
                                color: "var(--text-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 800,
                              }}
                            >
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{client.name}</p>
                              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{client.company}</p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "12.5px", fontWeight: 700 }}>
                              ${client.revenue.toLocaleString()}
                            </p>
                            <span
                              style={{
                                fontSize: "10px",
                                color: healthColor,
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <span
                                style={{
                                  width: "5px",
                                  height: "5px",
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
              </div>

              {/* Upcoming Deadlines (within 14 days) */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>
                  Upcoming Deadlines
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {upcomingDeadlines.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", padding: "10px 0" }}>
                      <CheckCircle size={14} color="var(--success)" />
                      <span style={{ fontSize: "12px" }}>No deadlines next 14 days</span>
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
                            padding: "8px 10px",
                            background: "var(--surface-2)",
                            borderRadius: "var(--radius)",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                maxWidth: "160px",
                              }}
                            >
                              {deadline.title}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                              {deadline.clientName}
                            </span>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: isUrgent ? "var(--error)" : "var(--text-secondary)",
                              }}
                            >
                              {deadline.daysLeft === 0
                                ? "Due today"
                                : deadline.daysLeft === 1
                                ? "Due tomorrow"
                                : `In ${deadline.daysLeft} days`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Growth Opportunities */}
              <div
                className="glass-card"
                style={{
                  padding: "20px",
                  borderLeft: "2.5px solid var(--color-iris-violet)",
                  background: "var(--surface-1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <TrendingUp size={14} color="var(--color-iris-violet)" />
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Growth Opportunity
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Based on your won proposals average of {proposalsStats.averageAiScore || 85}%, consider increasing your standard project rates by <strong>15%</strong> for upcoming pitches.
                </p>
              </div>

              {/* Recent Activity timeline */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>
                  Recent Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {activities.slice(0, 4).map((activity) => {
                    const cfg = getActivityConfig(activity.type);
                    return (
                      <div key={activity._id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: cfg.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <cfg.icon size={11} color={cfg.iconColor} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {activity.title}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
