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
  Sun,
  Moon,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/components/ThemeProvider";

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
  design: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  development: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  illustration: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  video: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  writing: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  marketing: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  consulting: "linear-gradient(135deg, #e8a838 0%, #d4880a 100%)",
  other: "linear-gradient(135deg, var(--text-muted) 0%, var(--border-strong) 100%)",
};

const STATUS_CFG: Record<string, { label: string; badge: string; color: string }> = {
  draft:     { label: "Draft",     badge: "badge-info",    color: "var(--info)" },
  active:    { label: "Active",    badge: "badge-success", color: "var(--success)" },
  in_review: { label: "In Review", badge: "badge-warning", color: "var(--warning)" },
  completed: { label: "Completed", badge: "badge-success", color: "var(--success)" },
  on_hold:   { label: "On Hold",   badge: "badge-warning", color: "var(--warning)" },
  cancelled: { label: "Cancelled", badge: "badge-error",   color: "var(--error)" },
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



// ── TOP BAR ──────────────────────────────────────────────────
function TopBar({ userName, userInitial, userImage }: { userName: string; userInitial: string; userImage?: string | null }) {
  return (
    <header
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "0.5px solid var(--border)",
        background: "var(--surface-1)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: "16px",
      }}
    >
      {/* Search */}
      <div className="search-input-wrapper" style={{ flex: 1, maxWidth: "360px" }}>
        <span className="search-input-icon">
          <Search size={14} />
        </span>
        <input
          id="dashboard-search"
          type="text"
          className="search-input"
          placeholder="Search projects, clients..."
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          id="new-project-btn"
          href="/dashboard/projects"
          className="btn-redesign btn-redesign-primary btn-redesign-sm"
        >
          <Plus size={13} />
          New Project
        </Link>

        {/* Avatar */}
        <div
          id="user-avatar-btn"
          className="avatar"
          style={{
            width: "34px",
            height: "34px",
            background: "var(--color-brand)",
            fontSize: "13px",
            cursor: "pointer",
            border: "0.5px solid var(--border-strong)",
            overflow: "hidden",
            padding: 0,
            flexShrink: 0,
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
  const { theme, toggle } = useTheme();
  const [activeNav, setActiveNav] = useState("overview");
  const [projectFilter, setProjectFilter] = useState("All");
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(null);
  const [showPromoCard, setShowPromoCard] = useState<boolean>(true);

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

  const COLOR_MAP: Record<string, string> = {
    design: "#378ADD",
    development: "#1D9E75",
    illustration: "#7F77DD",
    Design: "#378ADD",
    Development: "#1D9E75",
    Illustration: "#7F77DD",
  };

  const slicedBreakdownData = finalBreakdownData.slice(0, 3).map((item) => {
    const color = COLOR_MAP[item.name] || item.color;
    return { ...item, color };
  });

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
        background: "var(--surface-0)",
      }}
    >
      <Sidebar active={activeNav} setActive={setActiveNav} userName={userName} userInitial={userInitial} userImage={userImage} />
      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "252px", display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        <TopBar userName={userName} userInitial={userInitial} userImage={userImage} />

        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {activeNav === "settings" ? (
            <SettingsView theme={theme} toggle={toggle} />
          ) : activeNav !== "overview" ? (
            <MockView tabName={activeNav} setActiveNav={setActiveNav} />
          ) : (
            <>
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
                  <Link href="/dashboard/projects">
                    <Button variant="secondary" size="sm" leftIcon={<Briefcase size={14} />}>
                      Manage Projects
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<LogOut size={14} />}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    Logout
                  </Button>
                </div>
              </div>
              
              {/* ── PROFILE PROMO CARD ── */}
              {profileCompleteness !== null && profileCompleteness < 100 && showPromoCard && (
                <div style={{
                  background: "var(--surface-1)",
                  border: "0.5px solid var(--border-strong)",
                  borderRadius: "var(--radius)",
                  padding: "20px",
                  marginBottom: "24px",
                  position: "relative",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <button
                    onClick={() => setShowPromoCard(false)}
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer"
                    }}
                  >
                    <X size={14} />
                  </button>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <h4 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Sparkles size={14} color="var(--color-brand)" /> Complete your Freelancer Profile
                      </h4>
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "560px" }}>
                        Configure your professional skills and services to unlock AI-powered proposal generation, automatic reply assistants, and smart pricing tools.
                      </p>
                      <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
                        <span>Unlock:</span>
                        <span>✓ AI Proposal Generator</span>
                        <span>✓ AI Client Reply Assistant</span>
                        <span>✓ AI Pricing Assistant</span>
                      </div>
                    </div>
                    
                    {/* Progress meter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Onboarding Progress</span>
                        <span style={{ color: "var(--color-brand)" }}>{profileCompleteness}%</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${profileCompleteness}%`, height: "100%", background: "var(--color-brand)", borderRadius: "3px", transition: "width 0.4s ease" }} />
                      </div>
                      <Link href="/dashboard/profile/setup" style={{ textDecoration: "none", marginTop: "4px" }}>
                        <Button variant="primary" size="sm" style={{ width: "100%", height: "28px", fontSize: "11px" }}>
                          Complete Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
                    <div className="skeleton" style={{ height: "280px", borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: "280px", borderRadius: "var(--radius-lg)" }} />
                  </div>
                  <div className="skeleton" style={{ height: "360px", borderRadius: "var(--radius-lg)" }} />
                </div>
              ) : (
                <>
              {/* ── STAT CARDS ── */}
              <div
                className="grid-responsive-4"
                style={{ marginBottom: "24px" }}
              >
                {statCards.map((stat) => (
                  <StatCard
                    key={stat.id}
                    label={stat.label}
                    value={stat.value}
                    icon={<stat.icon />}
                    accentColor={stat.iconColor}
                    change={stat.change}
                  />
                ))}
              </div>

              {/* ── CHARTS ROW ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 300px",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                {/* Earnings Chart */}
                <div
                  id="earnings-chart"
                  className="glass-card"
                  style={{ padding: "24px", display: "flex", flexDirection: "column" }}
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
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Monthly revenue
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minHeight: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
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
                          tickFormatter={(v) => v === 0 ? "$0" : `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface-2)",
                            border: "0.5px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          itemStyle={{ color: "var(--text-primary)" }}
                          labelStyle={{ color: "var(--text-muted)", fontWeight: 600 }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => ["$" + Number(value || 0).toLocaleString(), "Revenue"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#378ADD"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Column (Pie Chart & AI Widget) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Pie Chart */}
                  <div id="project-breakdown" className="glass-card" style={{ padding: "24px" }}>
                    <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "16px" }}>
                      Project Mix
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                      <PieChart width={120} height={120}>
                        <Pie
                          data={slicedBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius="65%"
                          outerRadius="90%"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {slicedBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {slicedBreakdownData.map((entry) => (
                          <div
                            key={entry.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{entry.name}</span>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{entry.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive AI Assistant Widget */}
                  <div
                    id="ai-assistant-widget"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                      borderLeft: "2.5px solid var(--color-brand)",
                      borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} color="var(--primary)" />
                      <h3 className="font-heading" style={{ fontSize: "15px" }}>Antigravity AI Assistant</h3>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        borderBottom: "1px solid var(--border)",
                        marginBottom: "4px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => { setAiAction("prompt"); setAnimatedResponse(""); }}
                        style={{
                          padding: "6px 0",
                          background: "transparent",
                          border: "none",
                          borderBottom: aiAction === "prompt" ? "2px solid var(--color-brand)" : "2px solid transparent",
                          color: aiAction === "prompt" ? "var(--text-primary)" : "var(--text-muted)",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        Run Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAiAction("proposal"); setAnimatedResponse(""); }}
                        style={{
                          padding: "6px 0",
                          background: "transparent",
                          border: "none",
                          borderBottom: aiAction === "proposal" ? "2px solid var(--color-brand)" : "2px solid transparent",
                          color: aiAction === "proposal" ? "var(--text-primary)" : "var(--text-muted)",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
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
                          border: "0.5px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          fontFamily: "inherit",
                          outline: "none",
                          resize: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                      <Button
                        type="submit"
                        disabled={aiLoading}
                        variant="primary"
                        size="sm"
                        style={{ width: "100%", justifyContent: "center" }}
                        leftIcon={aiLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={13} />}
                      >
                        {aiLoading ? "Consulting AI..." : (aiAction === "prompt" ? "Ask Antigravity" : "Generate Proposal")}
                      </Button>
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

                  <div className="filter-tabs">
                    {["All", "In Progress", "Review", "Completed"].map((f) => (
                      <button
                        key={f}
                        id={`filter-${f.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setProjectFilter(f)}
                        className={`filter-tab${projectFilter === f ? " active" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--text-muted)", fontSize: "13px" }}>
                      No projects match this filter.
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          {["Project", "Category", "Progress", "Budget", "Due Date", "Status", ""].map((col) => (
                            <th key={col}>{col}</th>
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
                            <tr key={project._id}>
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
                                <Badge variant={getBadgeVariant(project.status)}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {project.status === "active" && <Clock size={11} />}
                                    {project.status === "completed" && <CheckCircle size={11} />}
                                    <span>{sCfg.label}</span>
                                  </span>
                                </Badge>
                              </td>
                              {/* Actions */}
                              <td style={{ padding: "14px" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <Link href={`/dashboard/projects/${project._id}`}>
                                    <Button variant="ghost" size="sm">
                                      <Eye size={14} />
                                    </Button>
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
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "0.5px solid var(--border)",
                  }}
                >
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Showing {filteredProjects.length} of {dbProjects.length} projects
                  </p>
                  <Link href="/dashboard/projects">
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
                      View All
                    </Button>
                  </Link>
                </div>
              </div>

              {/* ── ACTIVITY FEED ── */}
              <div id="activity-feed" className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "17px" }}>Recent Activity</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {activities.length === 0 ? (
                    <EmptyState
                      icon={<Bell />}
                      heading="No activity yet"
                      description="Recent updates and actions will show up here as you work."
                    />
                  ) : (
                    activities.map((item, i) => {
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
                            borderBottom: i < activities.length - 1 ? "0.5px solid var(--border)" : "none",
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
                    })
                  )}
                </div>
              </div>
            </>
          )}
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

function SettingsView({ theme, toggle }: { theme: "light" | "dark"; toggle: () => void }) {
  const setTheme = (mode: "light" | "dark") => {
    if (theme !== mode) {
      toggle();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.25s ease-out" }}>
      {/* Settings Header */}
      <div>
        <h1 className="font-heading" style={{ fontSize: "26px", marginBottom: "6px", letterSpacing: "-0.015em" }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Manage your account preferences, configurations, and workspace appearance.
        </p>
      </div>

      {/* Settings Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Appearance Settings Card */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", marginBottom: "4px", letterSpacing: "-0.015em" }}>
              Appearance
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Customize the look and feel of your FreelAi interface. Choose a style that matches your environment.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Theme Selection</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Switch between Light Mode and Dark Mode.
              </p>
            </div>

            {/* Segmented Theme Picker */}
            <div
              style={{
                display: "flex",
                background: "var(--bg-elevated)",
                padding: "4px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)",
              }}
            >
              <button
                type="button"
                id="theme-light-btn"
                onClick={() => setTheme("light")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: theme === "light" ? "var(--bg-card)" : "transparent",
                  color: theme === "light" ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: theme === "light" ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: theme === "light" ? "var(--shadow-sm)" : "none",
                }}
              >
                <Sun size={15} style={{ color: theme === "light" ? "var(--color-brand)" : "inherit" }} />
                Light Mode
              </button>
              <button
                type="button"
                id="theme-dark-btn"
                onClick={() => setTheme("dark")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: theme === "dark" ? "var(--bg-card)" : "transparent",
                  color: theme === "dark" ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: theme === "dark" ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: theme === "dark" ? "var(--shadow-sm)" : "none",
                }}
              >
                <Moon size={15} style={{ color: theme === "dark" ? "var(--color-brand)" : "inherit" }} />
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card Mock for completeness */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 className="font-heading" style={{ fontSize: "16px", marginBottom: "4px", letterSpacing: "-0.015em" }}>
              General Account
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Manage your personal details and account status.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)" }}>Account Tier</span>
              <span style={{ fontWeight: 600, color: "var(--color-brand)" }}>Pro Plan</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)" }}>Billing Cycle</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Monthly</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MockView({ tabName, setActiveNav }: { tabName: string; setActiveNav: (id: string) => void }) {
  const title = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.25s ease-out" }}>
      <div>
        <h1 className="font-heading" style={{ fontSize: "26px", marginBottom: "6px", letterSpacing: "-0.015em" }}>
          {title}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Access your {tabName} records, metrics, and communications.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "350px", gap: "16px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          <Sparkles size={28} />
        </div>
        <div>
          <h3 className="font-heading" style={{ fontSize: "18px", marginBottom: "6px", letterSpacing: "-0.015em" }}>
            {title} is coming soon
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto" }}>
            Our engineering team is polishing the {tabName} modules. Check back soon for AI-powered updates!
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setActiveNav("overview")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
