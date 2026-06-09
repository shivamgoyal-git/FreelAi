"use client";

import { useState } from "react";
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
  Filter,
  Calendar,
  Eye,
  Edit3,
  Sparkles,
  Target,
  Award,
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

// ── DATA ────────────────────────────────────────────────────
const earningsData = [
  { month: "Jan", earnings: 3200, projects: 4 },
  { month: "Feb", earnings: 4100, projects: 5 },
  { month: "Mar", earnings: 3800, projects: 4 },
  { month: "Apr", earnings: 5600, projects: 7 },
  { month: "May", earnings: 6200, projects: 8 },
  { month: "Jun", earnings: 7400, projects: 9 },
  { month: "Jul", earnings: 6800, projects: 8 },
  { month: "Aug", earnings: 8200, projects: 10 },
  { month: "Sep", earnings: 9100, projects: 11 },
  { month: "Oct", earnings: 10400, projects: 12 },
  { month: "Nov", earnings: 11200, projects: 14 },
  { month: "Dec", earnings: 12840, projects: 15 },
];

const projectBreakdownData = [
  { name: "Design", value: 45, color: "#6366f1" },
  { name: "Illustration", value: 30, color: "#8b5cf6" },
  { name: "Video", value: 25, color: "#06b6d4" },
];

const projects = [
  {
    id: "p1",
    name: "Brand Identity — Bloom Studio",
    client: "Bloom Studio",
    category: "Design",
    status: "In Progress",
    statusType: "info",
    budget: "$3,200",
    progress: 65,
    due: "Jun 20",
    avatar: "B",
    avatarBg: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  },
  {
    id: "p2",
    name: "Product Illustration Pack",
    client: "Velo Commerce",
    category: "Illustration",
    status: "Review",
    statusType: "warning",
    budget: "$1,800",
    progress: 90,
    due: "Jun 15",
    avatar: "V",
    avatarBg: "linear-gradient(135deg,#8b5cf6,#ec4899)",
  },
  {
    id: "p3",
    name: "Motion Reel — Q3 Campaign",
    client: "NovaPlex Media",
    category: "Video",
    status: "Completed",
    statusType: "success",
    budget: "$4,500",
    progress: 100,
    due: "Jun 01",
    avatar: "N",
    avatarBg: "linear-gradient(135deg,#06b6d4,#6366f1)",
  },
  {
    id: "p4",
    name: "App Icon Suite",
    client: "Kite Labs",
    category: "Design",
    status: "In Progress",
    statusType: "info",
    budget: "$900",
    progress: 30,
    due: "Jul 05",
    avatar: "K",
    avatarBg: "linear-gradient(135deg,#10b981,#06b6d4)",
  },
  {
    id: "p5",
    name: "Character Design — Storybook",
    client: "Sunpath Publishing",
    category: "Illustration",
    status: "Pending",
    statusType: "error",
    budget: "$2,100",
    progress: 0,
    due: "Jul 20",
    avatar: "S",
    avatarBg: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
];

const activityFeed = [
  {
    id: "a1",
    icon: DollarSign,
    iconBg: "var(--success-bg)",
    iconColor: "var(--success)",
    title: "Payment received",
    desc: "$4,500 from NovaPlex Media",
    time: "2 hours ago",
  },
  {
    id: "a2",
    icon: Sparkles,
    iconBg: "var(--primary-light)",
    iconColor: "var(--primary)",
    title: "AI Match Found",
    desc: "Brand identity project — $5,000 budget",
    time: "4 hours ago",
  },
  {
    id: "a3",
    icon: Star,
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
    title: "New 5-star review",
    desc: "Velo Commerce left a review on your portfolio",
    time: "Yesterday",
  },
  {
    id: "a4",
    icon: MessageSquare,
    iconBg: "rgba(6,182,212,0.1)",
    iconColor: "var(--info)",
    title: "New message",
    desc: "Bloom Studio: \"Can we schedule a review call?\"",
    time: "Yesterday",
  },
  {
    id: "a5",
    icon: CheckCircle,
    iconBg: "var(--success-bg)",
    iconColor: "var(--success)",
    title: "Milestone approved",
    desc: "Brand Identity Phase 1 — Bloom Studio",
    time: "2 days ago",
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview", badge: null, href: null },
  { icon: Briefcase, label: "Projects", id: "projects", badge: null, href: "/dashboard/projects" },
  { icon: MessageSquare, label: "Messages", id: "messages", badge: "3", href: null },
  { icon: DollarSign, label: "Payments", id: "payments", badge: null, href: null },
  { icon: Palette, label: "Portfolio", id: "portfolio", badge: null, href: null },
  { icon: Users, label: "Clients", id: "clients", badge: null, href: "/dashboard/clients" },
  { icon: Settings, label: "Settings", id: "settings", badge: null, href: null },
];

// ── CUSTOM TOOLTIP ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-card"
        style={{ padding: "10px 14px", fontSize: "13px" }}
      >
        <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "var(--primary)" }}>
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
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
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
          <span
            className="font-heading"
            style={{ fontSize: "18px", color: "var(--text-primary)" }}
          >
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
        <div
          style={{
            padding: "16px",
            background: "var(--gradient-primary)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={16} color="white" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>AI Boost Active</p>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginBottom: "12px", lineHeight: "1.5" }}>
            3 new matches found for your profile today
          </p>
          <button
            style={{
              width: "100%",
              padding: "8px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              backdropFilter: "blur(8px)",
            }}
          >
            View Matches →
          </button>
        </div>

        {/* User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
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
            {userImage
              ? <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pro Plan</p>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* New Project */}
        <button
          id="new-project-btn"
          className="btn btn-primary btn-sm"
          style={{ borderRadius: "var(--radius-md)", gap: "6px" }}
        >
          <Plus size={14} />
          New Project
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--error)",
              border: "2px solid var(--bg-surface)",
            }}
          />
        </button>

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
          {userImage
            ? <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : userInitial}
        </div>
      </div>
    </header>
  );
}

// ── STAT CARDS ───────────────────────────────────────────────
const stats = [
  {
    id: "stat-earnings",
    icon: DollarSign,
    label: "Monthly Earnings",
    value: "$12,840",
    change: "+23%",
    up: true,
    iconBg: "var(--primary-light)",
    iconColor: "var(--primary)",
  },
  {
    id: "stat-projects",
    icon: Briefcase,
    label: "Active Projects",
    value: "8",
    change: "+2 this week",
    up: true,
    iconBg: "rgba(6,182,212,0.1)",
    iconColor: "var(--info)",
  },
  {
    id: "stat-rating",
    icon: Star,
    label: "Client Rating",
    value: "4.9/5",
    change: "from 48 reviews",
    up: true,
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
  },
  {
    id: "stat-hours",
    icon: Clock,
    label: "Hours Logged",
    value: "142h",
    change: "+18h this week",
    up: true,
    iconBg: "var(--success-bg)",
    iconColor: "var(--success)",
  },
];

// ── MAIN DASHBOARD ───────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("overview");
  const [projectFilter, setProjectFilter] = useState("All");

  const userName = session?.user?.name ?? "Freelancer";
  const userInitial = userName.charAt(0).toUpperCase();
  const userImage = session?.user?.image;

  const filteredProjects =
    projectFilter === "All"
      ? projects
      : projects.filter((p) => p.status === projectFilter);

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
                  Good morning, {userName.split(" ")[0]} ✨
                </h1>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Here&apos;s what&apos;s happening with your freelance business today.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: "6px", borderRadius: "var(--radius-md)" }}>
                <Calendar size={14} />
                Jun 2026
                <ChevronDown size={13} />
              </button>
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

          {/* ── STAT CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            {stats.map((stat) => (
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
                    <ArrowDownRight size={16} color="var(--error)" />
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
                  className="badge badge-success"
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
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>January — December 2026</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="badge badge-primary">
                    <TrendingUp size={11} />
                    +23% YoY
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-md)", padding: "6px 10px" }}>
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={earningsData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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

            {/* Project Breakdown + Activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Pie Chart */}
              <div id="project-breakdown" className="glass-card" style={{ padding: "24px" }}>
                <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "16px" }}>
                  Project Mix
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <PieChart width={100} height={100}>
                    <Pie
                      data={projectBreakdownData}
                      cx={50}
                      cy={50}
                      innerRadius={28}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {projectBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {projectBreakdownData.map((entry) => (
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

              {/* Quick Stats */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", marginBottom: "14px" }}>
                  This Month
                </h3>
                {[
                  { icon: Target, label: "Proposals Sent", value: "12", color: "var(--primary)" },
                  { icon: Award, label: "Won Contracts", value: "7", color: "var(--success)" },
                  { icon: Users, label: "New Clients", value: "4", color: "var(--info)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: `${item.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <item.icon size={14} color={item.color} />
                    </div>
                    <span style={{ flex: 1, fontSize: "13px", color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
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
                  {projects.length} projects total
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Filter Buttons */}
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
                <button className="btn btn-secondary btn-sm" style={{ gap: "6px", borderRadius: "var(--radius-md)" }}>
                  <Filter size={13} />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
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
                  {filteredProjects.map((project, i) => (
                    <tr
                      key={project.id}
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
                              background: project.avatarBg,
                              fontSize: "13px",
                              flexShrink: 0,
                            }}
                          >
                            {project.avatar}
                          </div>
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                              {project.name}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{project.client}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "14px" }}>
                        <span className="badge badge-primary" style={{ fontSize: "11px" }}>
                          {project.category}
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
                          {project.budget}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{project.due}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px" }}>
                        <span
                          className={`badge badge-${project.statusType}`}
                        >
                          {project.status === "In Progress" && <Clock size={11} />}
                          {project.status === "Completed" && <CheckCircle size={11} />}
                          {project.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)" }}
                            aria-label="View project"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)" }}
                            aria-label="Edit project"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)" }}
                            aria-label="More options"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
              <Link href="#" className="btn btn-ghost btn-sm" style={{ gap: "6px" }}>
                View All Projects
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── ACTIVITY FEED ── */}
          <div id="activity-feed" className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className="font-heading" style={{ fontSize: "17px" }}>Recent Activity</h3>
              <button className="btn btn-ghost btn-sm">View All →</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {activityFeed.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    paddingBottom: i < activityFeed.length - 1 ? "16px" : 0,
                    marginBottom: i < activityFeed.length - 1 ? "16px" : 0,
                    borderBottom: i < activityFeed.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <item.icon size={15} color={item.iconColor} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>

                  {/* Time */}
                  <span style={{ fontSize: "12px", color: "var(--text-subtle)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
