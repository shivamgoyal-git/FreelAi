"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  Bell,
  Search,
  Zap,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Palette,
  LogOut,
  ChevronDown,
  Calendar,
  Eye,
  Sparkles,
  Target,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── CONFIGS ──────────────────────────────────────────────────
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
  design: "#6366f1",
  development: "#06b6d4",
  illustration: "#8b5cf6",
  video: "#ec4899",
  writing: "#f59e0b",
  marketing: "#10b981",
  consulting: "#e8a838",
  other: "var(--text-muted)",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  design: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  development: "linear-gradient(135deg, #06b6d4, #6366f1)",
  illustration: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  video: "linear-gradient(135deg, #ec4899, #f43f5e)",
  writing: "linear-gradient(135deg, #f59e0b, #e8a838)",
  marketing: "linear-gradient(135deg, #10b981, #06b6d4)",
  consulting: "linear-gradient(135deg, #e8a838, #f59e0b)",
  other: "linear-gradient(135deg, var(--border-default), var(--border-strong))",
};

const STATUS_CFG: Record<string, { label: string; badge: string; color: string }> = {
  draft: { label: "Draft", badge: "badge-info", color: "var(--info)" },
  active: { label: "Active", badge: "badge-success", color: "var(--success)" },
  in_review: { label: "In Review", badge: "badge-warning", color: "var(--warning)" },
  completed: { label: "Completed", badge: "badge-success", color: "var(--success)" },
  on_hold: { label: "On Hold", badge: "badge-warning", color: "var(--warning)" },
  cancelled: { label: "Cancelled", badge: "badge-error", color: "var(--error)" },
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview", badge: null, href: null },
  { icon: Briefcase, label: "Projects", id: "projects", badge: null, href: "/dashboard/projects" },
  { icon: MessageSquare, label: "Messages", id: "messages", badge: "3", href: null },
  { icon: DollarSign, label: "Payments", id: "payments", badge: null, href: null },
  { icon: Palette, label: "Portfolio", id: "portfolio", badge: null, href: null },
  { icon: Users, label: "Clients", id: "clients", badge: null, href: "/dashboard/clients" },
  { icon: Settings, label: "Settings", id: "settings", badge: null, href: null },
];

// ── TIME AGO UTILITY ──────────────────────────────────────────
function timeAgo(dateString: string | Date) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card" style={{ padding: "10px 14px", fontSize: "13px" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "var(--primary)", fontWeight: 800 }}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ── SIDEBAR ──────────────────────────────────────────────────
function Sidebar({ active, setActive, userName, userInitial, userImage }: { active: string; setActive: (id: string) => void; userName: string; userInitial: string; userImage?: string | null }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border-default)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-primary)",
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="white" fill="white" />
          </div>
          <span className="font-heading" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
            Freel<span className="text-gradient">Ai</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navItems.map((item) =>
          item.href ? (
            <Link
              key={item.id}
              id={`sidebar-${item.id}`}
              href={item.href}
              className={`sidebar-item${active === item.id ? " active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
              onClick={() => setActive(item.id)}
            >
              <item.icon size={18} />
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.id}
              id={`sidebar-${item.id}`}
              onClick={() => setActive(item.id)}
              className={`sidebar-item${active === item.id ? " active" : ""}`}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              <item.icon size={18} />
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    background: active === item.id ? "var(--primary)" : "var(--bg-elevated)",
                    color: active === item.id ? "white" : "var(--text-muted)",
                    padding: "2px 7px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        )}
      </nav>

      {/* AI Boost Card */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ padding: "16px", background: "var(--gradient-primary)", borderRadius: "var(--radius-lg)", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={16} color="white" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>AI Boost Active</p>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginBottom: "12px", lineHeight: "1.5" }}>
            Ready to find matching contracts & optimize proposals.
          </p>
          <Link
            href="/dashboard/projects"
            style={{
              display: "block",
              textAlign: "center",
              width: "100%",
              padding: "8px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              backdropFilter: "blur(8px)",
            }}
          >
            Launch Projects
          </Link>
        </div>

        {/* User profile strip */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "var(--radius-md)" }}>
          <div
            className="avatar"
            style={{
              width: "36px",
              height: "36px",
              background: "var(--gradient-primary)",
              fontSize: "14px",
              flexShrink: 0,
              overflow: "hidden",
              padding: 0,
            }}
          >
            {userImage ? (
              <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userInitial
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── TOP BAR ──────────────────────────────────────────────────
function TopBar({ userName, userInitial, userImage }: { userName: string; userInitial: string; userImage?: string | null }) {
  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: "16px",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          id="dashboard-search"
          type="text"
          placeholder="Search projects, clients..."
          style={{
            width: "100%",
            paddingLeft: "36px",
            paddingRight: "14px",
            paddingTop: "9px",
            paddingBottom: "9px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            fontFamily: "inherit",
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link
          id="new-project-btn"
          href="/dashboard/projects"
          className="btn btn-primary btn-sm"
          style={{ borderRadius: "var(--radius-md)", gap: "6px" }}
        >
          <Plus size={14} />
          New Project
        </Link>

        {/* Avatar */}
        <div
          id="user-avatar-btn"
          className="avatar"
          style={{
            width: "38px",
            height: "38px",
            background: "var(--gradient-primary)",
            fontSize: "14px",
            cursor: "pointer",
            border: "2px solid var(--border-default)",
            overflow: "hidden",
            padding: 0,
          }}
        >
          {userImage ? (
            <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            userInitial
          )}
        </div>
      </div>
    </header>
  );
}

// ── ACTIVITY FEED CONFIG MAPPING ──────────────────────────────
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

// ── TYPES ────────────────────────────────────────────────────
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

// ── MAIN DASHBOARD PAGE ───────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("overview");
  const [projectFilter, setProjectFilter] = useState("All");

  // Dynamic States
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
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
  const userInitial = userName.charAt(0).toUpperCase();
  const userImage = session?.user?.image;

  // Fetch Stats & Activities
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setChartData(data.chartData);
        setActivities(data.activities);
        setDbProjects(data.recentProjects);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Submit Simulated AI Action
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
        // Typewriter Effect Animation
        let i = 0;
        const text = data.response;
        setAnimatedResponse("");
        const timer = setInterval(() => {
          if (i < text.length) {
            setAnimatedResponse((prev) => prev + text.charAt(i));
            i += 1;
          } else {
            clearInterval(timer);
          }
        }, 8);

        setAiPrompt("");
        fetchDashboardData(); // Reload stats and activities
      } else {
        setAnimatedResponse(`Error: ${data.error || "Failed to process Action"}`);
      }
    } catch {
      setAnimatedResponse("Network connection error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter dbProjects on Dashboard
  const filteredProjects =
    projectFilter === "All"
      ? dbProjects
      : dbProjects.filter((p) => {
          if (projectFilter === "In Progress") return p.status === "active" || p.status === "in_review" || p.status === "on_hold";
          if (projectFilter === "Review") return p.status === "in_review";
          if (projectFilter === "Completed") return p.status === "completed";
          return true;
        });

  // Calculate project breakdown metrics for the Pie Chart
  const categoryCounts: Record<string, number> = {};
  dbProjects.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const totalProjCount = dbProjects.length;
  const projectBreakdownData = Object.keys(categoryCounts).map((cat) => ({
    name: CATEGORY_LABELS[cat] || cat,
    value: totalProjCount > 0 ? Math.round((categoryCounts[cat] / totalProjCount) * 100) : 0,
    color: CATEGORY_COLORS[cat] || "var(--text-muted)",
  }));

  // Render static fallback breakdown if no project data exists yet
  const finalBreakdownData =
    projectBreakdownData.length > 0
      ? projectBreakdownData
      : [
          { name: "Design", value: 50, color: "#6366f1" },
          { name: "Development", value: 30, color: "#06b6d4" },
          { name: "Illustration", value: 20, color: "#8b5cf6" },
        ];

  // Dynamic Statistics Cards
  const statCards = [
    {
      id: "stat-clients",
      icon: Users,
      label: "Total Clients",
      value: stats.totalClients.toString(),
      change: "Active contacts",
      up: true,
      iconBg: "rgba(245,158,11,0.15)",
      iconColor: "#f59e0b",
    },
    {
      id: "stat-projects",
      icon: Briefcase,
      label: "Active Projects",
      value: stats.activeProjects.toString(),
      change: "In progress & review",
      up: true,
      iconBg: "rgba(6,182,212,0.15)",
      iconColor: "var(--info)",
    },
    {
      id: "stat-revenue",
      icon: DollarSign,
      label: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "Total contract earnings",
      up: true,
      iconBg: "var(--primary-light)",
      iconColor: "var(--primary)",
    },
    {
      id: "stat-pending",
      icon: Clock,
      label: "Pending Invoices",
      value: `$${stats.pendingInvoices.toLocaleString()}`,
      change: "Awaiting payment",
      up: false,
      iconBg: "var(--success-bg)",
      iconColor: "var(--success)",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar active={activeNav} setActive={setActiveNav} userName={userName} userInitial={userInitial} userImage={userImage} />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "256px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <TopBar userName={userName} userInitial={userInitial} userImage={userImage} />

        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          {/* Page Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <h1 className="font-heading" style={{ fontSize: "26px" }}>
                  Welcome back, {userName.split(" ")[0]} ✨
                </h1>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Here&apos;s an overview of your freelance metrics and recent developments.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/projects" className="btn btn-secondary btn-sm" style={{ gap: "6px", borderRadius: "var(--radius-md)" }}>
                <Briefcase size={14} />
                Manage Projects
              </Link>
              <button
                className="btn btn-secondary btn-sm"
                style={{ gap: "6px", borderRadius: "var(--radius-md)" }}
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
              <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} color="var(--primary)" />
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading dashboard statistics...</p>
            </div>
          ) : (
            <>
              {/* ── STAT CARDS ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                {statCards.map((stat) => (
                  <div
                    key={stat.id}
                    id={stat.id}
                    className="stat-card"
                    style={{ padding: "20px 22px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: stat.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <stat.icon size={18} color={stat.iconColor} />
                      </div>
                      {stat.up ? (
                        <ArrowUpRight size={16} color="var(--success)" />
                      ) : (
                        <ArrowDownRight size={16} color="var(--warning)" />
                      )}
                    </div>
                    <p
                      className="font-heading"
                      style={{ fontSize: "26px", color: "var(--text-primary)", marginBottom: "4px" }}
                    >
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
                      {stat.label}
                    </p>
                    <span
                      className={`badge ${stat.up ? "badge-success" : "badge-warning"}`}
                      style={{ fontSize: "11px" }}
                    >
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── CHARTS ROW ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 340px",
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                {/* Earnings Chart */}
                <div
                  id="earnings-chart"
                  className="glass-card"
                  style={{ padding: "24px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "4px" }}>
                        Earnings Overview
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Monthly revenue visualization</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span className="badge badge-primary">
                        <TrendingUp size={11} />
                        Live Metrics
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#earningsGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: "#6366f1", stroke: "var(--bg-surface)", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Right Column (Pie Chart & AI Widget) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Pie Chart */}
                  <div id="project-breakdown" className="glass-card" style={{ padding: "24px" }}>
                    <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "16px" }}>
                      Project Mix
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <PieChart width={100} height={100}>
                        <Pie
                          data={finalBreakdownData}
                          cx={50}
                          cy={50}
                          innerRadius={28}
                          outerRadius={48}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {finalBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div style={{ flex: 1 }}>
                        {finalBreakdownData.map((entry) => (
                          <div
                            key={entry.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color }} />
                              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{entry.name}</span>
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{entry.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive AI Assistant Widget */}
                  <div id="ai-assistant-widget" className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} color="var(--primary)" />
                      <h3 className="font-heading" style={{ fontSize: "15px" }}>Antigravity AI Assistant</h3>
                    </div>

                    <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", padding: "3px", borderRadius: "var(--radius-md)" }}>
                      <button
                        type="button"
                        onClick={() => { setAiAction("prompt"); setAnimatedResponse(""); }}
                        style={{
                          flex: 1,
                          padding: "6px",
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: aiAction === "prompt" ? "var(--bg-card)" : "transparent",
                          color: aiAction === "prompt" ? "var(--primary)" : "var(--text-muted)",
                          fontSize: "12px",
                          fontWeight: aiAction === "prompt" ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        Run Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAiAction("proposal"); setAnimatedResponse(""); }}
                        style={{
                          flex: 1,
                          padding: "6px",
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: aiAction === "proposal" ? "var(--bg-card)" : "transparent",
                          color: aiAction === "proposal" ? "var(--primary)" : "var(--text-muted)",
                          fontSize: "12px",
                          fontWeight: aiAction === "proposal" ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        Generate Proposal
                      </button>
                    </div>

                    <form onSubmit={handleAiSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={aiAction === "prompt" ? "Ask outreach tips, client strategy, formulas..." : "Enter project details (e.g. Website Redesign, $3500)..."}
                        rows={2}
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "var(--bg-elevated)",
                          border: "1.5px solid var(--border-default)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          fontFamily: "inherit",
                          outline: "none",
                          resize: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                      />
                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "center", gap: "6px" }}
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                            Consulting AI...
                          </>
                        ) : (
                          <>
                            <Zap size={13} />
                            {aiAction === "prompt" ? "Ask Antigravity" : "Generate Proposal"}
                          </>
                        )}
                      </button>
                    </form>

                    {animatedResponse && (
                      <div
                        style={{
                          maxHeight: "180px",
                          overflowY: "auto",
                          padding: "10px 12px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "12px",
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
                </div>
              </div>

              {/* ── PROJECTS TABLE ── */}
              <div
                id="projects-table"
                className="glass-card"
                style={{ padding: "24px", marginBottom: "24px" }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "4px" }}>
                      Active Projects
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {dbProjects.length === 0 ? "No active projects" : `${dbProjects.length} recent projects`}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", padding: "4px", borderRadius: "var(--radius-md)" }}>
                      {["All", "In Progress", "Review", "Completed"].map((f) => (
                        <button
                          key={f}
                          id={`filter-${f.toLowerCase().replace(" ", "-")}`}
                          onClick={() => setProjectFilter(f)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-sm)",
                            border: "none",
                            background: projectFilter === f ? "var(--bg-card)" : "transparent",
                            color: projectFilter === f ? "var(--text-primary)" : "var(--text-muted)",
                            fontSize: "12px",
                            fontWeight: projectFilter === f ? 700 : 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            boxShadow: projectFilter === f ? "var(--shadow-sm)" : "none",
                            transition: "all 0.2s",
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)", fontSize: "14px" }}>
                      No projects match the current filter.
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Project", "Category", "Progress", "Budget", "Due Date", "Status", ""].map((col) => (
                            <th
                              key={col}
                              style={{
                                padding: "10px 14px",
                                textAlign: "left",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                borderBottom: "1px solid var(--border-default)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project, i) => {
                          const categoryLabel = CATEGORY_LABELS[project.category] || project.category;
                          const categoryColor = CATEGORY_COLORS[project.category] || "var(--text-muted)";
                          const gradient = CATEGORY_GRADIENTS[project.category] || CATEGORY_GRADIENTS.other;
                          const sCfg = STATUS_CFG[project.status] || { label: project.status, badge: "badge-info", color: "var(--info)" };

                          return (
                            <tr
                              key={project._id}
                              style={{
                                borderBottom: i < filteredProjects.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-elevated)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                            >
                              {/* Project Name */}
                              <td style={{ padding: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div
                                    className="avatar"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      background: gradient,
                                      fontSize: "13px",
                                      flexShrink: 0,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {project.title.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                                      {project.title}
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{project.clientName || "Direct Project"}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td style={{ padding: "14px" }}>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: "11px",
                                    background: `${categoryColor}15`,
                                    color: categoryColor,
                                    border: `1px solid ${categoryColor}30`,
                                  }}
                                >
                                  {categoryLabel}
                                </span>
                              </td>

                              {/* Progress */}
                              <td style={{ padding: "14px", minWidth: "120px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div className="progress-bar" style={{ flex: 1 }}>
                                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                                  </div>
                                  <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "32px" }}>
                                    {project.progress}%
                                  </span>
                                </div>
                              </td>

                              {/* Budget */}
                              <td style={{ padding: "14px" }}>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                                  ${project.budget.toLocaleString()}
                                </span>
                              </td>

                              {/* Due Date */}
                              <td style={{ padding: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Calendar size={13} color="var(--text-muted)" />
                                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td style={{ padding: "14px" }}>
                                <span className={`badge ${sCfg.badge}`}>
                                  {project.status === "active" && <Clock size={11} />}
                                  {project.status === "completed" && <CheckCircle size={11} />}
                                  {sCfg.label}
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: "14px" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <Link
                                    href={`/dashboard/projects/${project._id}`}
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)" }}
                                    aria-label="View project"
                                  >
                                    <Eye size={14} />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Table Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Showing {filteredProjects.length} of {dbProjects.length} recent projects
                  </p>
                  <Link href="/dashboard/projects" className="btn btn-ghost btn-sm" style={{ gap: "6px" }}>
                    View All Projects
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* ── ACTIVITY FEED ── */}
              <div id="activity-feed" className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "17px" }}>Recent Activity</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {activities.map((item, i) => {
                    const cfg = getActivityConfig(item.type);
                    return (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "14px",
                          paddingBottom: i < activities.length - 1 ? "16px" : 0,
                          marginBottom: i < activities.length - 1 ? "16px" : 0,
                          borderBottom: i < activities.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: cfg.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <cfg.icon size={15} color={cfg.iconColor} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                            {item.title}
                          </p>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.description}</p>
                        </div>

                        {/* Time */}
                        <span style={{ fontSize: "12px", color: "var(--text-subtle)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
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
