"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Download,
  Printer,
  Loader2,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Hourglass,
  RefreshCw,
  Briefcase,
  FileText,
  Share2,
  Calendar,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { chartTheme } from "@/lib/chart-theme";

interface KPIItem {
  value: number;
  growth: number | null;
}

interface OverviewData {
  range: string;
  startDate: string;
  endDate: string;
  kpis: {
    totalRevenue: KPIItem;
    outstandingRevenue: KPIItem;
    activeClients: KPIItem;
    completedProjects: KPIItem;
    avgProjectValue: KPIItem;
    winRate: KPIItem;
    collectionRate: KPIItem;
    avgInvoiceValue: KPIItem;
    avgPaymentTimeDays: KPIItem;
  };
  insights: string[];
}

interface RevenueChartItem {
  label: string;
  revenue: number;
  billed: number;
  outstanding: number;
}

interface TopClientItem {
  name: string;
  company: string;
  revenue: number;
  outstanding: number;
  billed: number;
}

interface InvoiceStatusItem {
  _id: string;
  count: number;
  totalValue: number;
}

interface RecentActivityItem {
  _id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  amountPaid: number;
  currency: string;
  date: string;
  clientName: string;
}

interface UpcomingPaymentItem {
  _id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  remainingAmount: number;
  currency: string;
  dueDate: string;
  clientName: string;
}

interface InvoicesData {
  statusDistribution: InvoiceStatusItem[];
  recentActivity: RecentActivityItem[];
  upcomingPayments: UpcomingPaymentItem[];
}

interface ProjectStatusItem {
  _id: string;
  count: number;
  totalBudget: number;
}

interface ProjectCategoryItem {
  _id: string;
  count: number;
  totalBudget: number;
}

interface ProjectsData {
  statusBreakdown: ProjectStatusItem[];
  categoryBreakdown: ProjectCategoryItem[];
}

interface ProposalBreakdownItem {
  status: string;
  label: string;
  count: number;
  value: number;
}

interface ProposalsData {
  breakdown: ProposalBreakdownItem[];
  funnel: {
    generated: number;
    sent: number;
    won: number;
    lost: number;
    winRate: number;
    sendRate: number;
  };
}

const COLORS = [
  "var(--color-iris-violet)",
  "var(--color-signal-teal)",
  "var(--color-pulse-green)",
  "var(--color-lavender)",
  "var(--color-coral-red)",
  "var(--color-mist)",
];

export default function AnalyticsPage() {
  useSession();

  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Analytics API Data States
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [revenue, setRevenue] = useState<{ chartData: RevenueChartItem[] } | null>(null);
  const [topClients, setTopClients] = useState<{ topClients: TopClientItem[] } | null>(null);
  const [invoices, setInvoices] = useState<InvoicesData | null>(null);
  const [projects, setProjects] = useState<ProjectsData | null>(null);
  const [proposals, setProposals] = useState<ProposalsData | null>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all analytics data concurrently
  const fetchAllAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (range === "custom") {
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
      }

      const queryString = `?${params.toString()}`;

      const [overviewRes, revenueRes, topClientsRes, invoicesRes, projectsRes, proposalsRes] = await Promise.all([
        fetch(`/api/analytics/overview${queryString}`),
        fetch(`/api/analytics/revenue${queryString}`),
        fetch(`/api/analytics/top-clients${queryString}`),
        fetch(`/api/analytics/invoices${queryString}`),
        fetch(`/api/analytics/projects${queryString}`),
        fetch(`/api/analytics/proposals${queryString}`),
      ]);

      const [overviewData, revenueData, topClientsData, invoicesData, projectsData, proposalsData] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        topClientsRes.json(),
        invoicesRes.json(),
        projectsRes.json(),
        proposalsRes.json(),
      ]);

      if (overviewRes.ok) setOverview(overviewData);
      if (revenueRes.ok) setRevenue(revenueData);
      if (topClientsRes.ok) setTopClients(topClientsData);
      if (invoicesRes.ok) setInvoices(invoicesData);
      if (projectsRes.ok) setProjects(projectsData);
      if (proposalsRes.ok) setProposals(proposalsData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [range, startDate, endDate]);

  // Fetch on parameter change
  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  // Generate Demo Workspace handler
  const handleGenerateDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/analytics/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Demo workspace generated successfully!");
        await fetchAllAnalytics();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate demo workspace");
      }
    } catch (err) {
      console.error("Error generating demo workspace:", err);
      toast.error("Error generating demo workspace");
    } finally {
      setSeeding(false);
    }
  };

  // CSV Export logic
  const handleExportCSV = () => {
    if (!overview || !topClients) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Earnings Analytics Overview Report\r\n";
    csvContent += `Report Date Range: ${overview.startDate.split("T")[0]} to ${overview.endDate.split("T")[0]}\r\n\r\n`;
    
    csvContent += "KPI Summary Metrics\r\n";
    csvContent += "Metric,Value,Growth\r\n";
    csvContent += `Total Revenue,$${overview.kpis.totalRevenue.value.toLocaleString()},${overview.kpis.totalRevenue.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Outstanding Revenue,$${overview.kpis.outstandingRevenue.value.toLocaleString()},N/A\r\n`;
    csvContent += `Active Clients,${overview.kpis.activeClients.value},${overview.kpis.activeClients.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Completed Projects,${overview.kpis.completedProjects.value},${overview.kpis.completedProjects.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Average Project Value,$${overview.kpis.avgProjectValue.value.toLocaleString()},${overview.kpis.avgProjectValue.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Proposal Win Rate,${overview.kpis.winRate.value.toFixed(1)}%,${overview.kpis.winRate.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Collection Rate,${overview.kpis.collectionRate.value.toFixed(1)}%,${overview.kpis.collectionRate.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Average Invoice Value,$${overview.kpis.avgInvoiceValue.value.toLocaleString()},${overview.kpis.avgInvoiceValue.growth?.toFixed(1) || 0}%\r\n`;
    csvContent += `Average Payment Time,${overview.kpis.avgPaymentTimeDays.value.toFixed(1)} days,N/A\r\n\r\n`;

    if (topClients.topClients && topClients.topClients.length > 0) {
      csvContent += "Top Clients by Revenue\r\n";
      csvContent += "Client Name,Company,Billed,Revenue,Outstanding\r\n";
      topClients.topClients.forEach((c) => {
        csvContent += `"${c.name}","${c.company}",$${c.billed},$${c.revenue},$${c.outstanding}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FreelAI_Analytics_Export_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export logic
  const handlePrintPDF = () => {
    window.print();
  };

  // Share link logic
  const handleShareReport = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?range=${range}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Report configuration link copied to clipboard!");
  };

  // Helpers for displaying formatting
  const formatVal = (value: number, type: "currency" | "number" | "percent" | "days", currency = "USD") => {
    if (type === "percent") return `${value.toFixed(1)}%`;
    if (type === "days") return `${value.toFixed(1)} days`;
    if (type === "currency") {
      const symbol = currency === "INR" ? "₹" : "$";
      const locales = currency === "INR" ? "en-IN" : "en-US";
      return `${symbol}${value.toLocaleString(locales, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return value.toLocaleString();
  };

  // Determine if database is empty
  const isWorkspaceEmpty =
    !loading &&
    overview &&
    overview.kpis.totalRevenue.value === 0 &&
    overview.kpis.activeClients.value === 0 &&
    overview.kpis.completedProjects.value === 0;

  // Expected projected pipeline based on status breakdown
  const revenueForecast = useMemo(() => {
    if (!projects || !projects.statusBreakdown) return 0;
    const activeBudgets = projects.statusBreakdown
      .filter((item) => ["active", "in_review", "on_hold"].includes(item._id))
      .reduce((sum, item) => sum + item.totalBudget, 0);
    const collectionEfficiency = overview ? overview.kpis.collectionRate.value / 100 : 0.85;
    return activeBudgets * collectionEfficiency;
  }, [projects, overview]);

  return (
    <div className="analytics-page-container" style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .glass-card, .stat-card {
            border: 1px solid #ddd !important;
            background: white !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .analytics-page-container {
            background: white !important;
          }
        }
      `}</style>

      {/* Top Header Nav */}
      <header className="no-print" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px", transition: "color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 size={13} color="var(--color-brand)" />
          </div>
          <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Analytics</h1>
        </div>
        <div style={{ flex: 1 }} />
        
        {/* Header Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          {!isWorkspaceEmpty && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShareReport}
                leftIcon={<Share2 size={13} />}
                disabled={loading}
              >
                Share
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download size={13} />}
                disabled={loading}
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintPDF}
                leftIcon={<Printer size={13} />}
                disabled={loading}
              >
                PDF
              </Button>
            </>
          )}
          <Button
            variant={isWorkspaceEmpty ? "primary" : "secondary"}
            size="sm"
            onClick={handleGenerateDemo}
            disabled={seeding || loading}
            leftIcon={seeding ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={13} />}
          >
            {seeding ? "Generating..." : isWorkspaceEmpty ? "Generate Demo Workspace" : "Reset Data"}
          </Button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="print-full" style={{ flex: 1, padding: "28px", maxWidth: "1200px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Page Title & Subtitle */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "28px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Business Intelligence
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
              Deep-dive metrics tracking revenue, client performance, and conversion trends.
            </p>
          </div>

          {/* Tab Navigation Segmented Selector */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-1)",
              padding: "4px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border)",
            }}
          >
            {[
              { id: "overview", label: "Overview", icon: <Layers size={13} /> },
              { id: "financials", label: "Financials", icon: <DollarSign size={13} /> },
              { id: "projects", label: "Work & Pitches", icon: <Briefcase size={13} /> },
              { id: "clients", label: "Clients", icon: <Users size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: activeTab === tab.id ? "var(--surface-2)" : "transparent",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filters Component */}
        <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", padding: "12px 16px", border: "1px solid var(--border)", background: "var(--surface-1)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "last-month", label: "Last Month" },
              { id: "year", label: "This Year" },
              { id: "custom", label: "Custom Range" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRange(f.id)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: range === f.id ? "var(--surface-2)" : "transparent",
                  color: range === f.id ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {range === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Start</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>End</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && !overview ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Loader2 size={36} style={{ animation: "spin 1.5s linear infinite", color: "var(--color-brand)" }} />
          </div>
        ) : isWorkspaceEmpty ? (
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "40px" }}>
            <EmptyState
              icon={<BarChart3 />}
              heading="No Analytics Data Available"
              description="Your FreelAI workspace currently contains no client records, projects, invoices, or proposals to aggregate. Kickstart your dashboard by generating a professional demo workspace."
              actionLabel={seeding ? "Generating..." : "Generate Demo Workspace"}
              onActionClick={handleGenerateDemo}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && overview && (
              <>
                {/* AI Insights Banner */}
                {overview.insights && overview.insights.length > 0 && (
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.04)",
                      border: "1px solid rgba(99, 102, 241, 0.15)",
                      borderRadius: "var(--radius-lg)",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} color="var(--color-iris-violet)" />
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
                        AI Business Analyst Insights
                      </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {overview.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 14px",
                            background: "var(--bg-surface)",
                            borderLeft: "3px solid var(--color-iris-violet)",
                            borderRadius: "0 var(--radius) var(--radius) 0",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core KPIs Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }} className="grid-responsive-2">
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Revenue</span>
                      <DollarSign size={15} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.totalRevenue.value, "currency")}</span>
                        {overview.kpis.totalRevenue.growth !== null && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.totalRevenue.growth >= 0 ? "#10b981" : "#ef4444", display: "flex", alignItems: "center" }}>
                            {overview.kpis.totalRevenue.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(overview.kpis.totalRevenue.growth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>Payments settled in this period</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proposal Win Rate</span>
                      <Percent size={15} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.winRate.value, "percent")}</span>
                        {overview.kpis.winRate.growth !== null && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.winRate.growth >= 0 ? "#10b981" : "#ef4444", display: "flex", alignItems: "center" }}>
                            {overview.kpis.winRate.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(overview.kpis.winRate.growth).toFixed(1)}pp
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>Won pitches / total proposals</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Outstanding</span>
                      <Clock size={15} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.outstandingRevenue.value, "currency")}</span>
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>Awaiting collection balance</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed Work</span>
                      <CheckCircle size={15} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.completedProjects.value, "number")}</span>
                        {overview.kpis.completedProjects.growth !== null && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.completedProjects.growth >= 0 ? "#10b981" : "#ef4444", display: "flex", alignItems: "center" }}>
                            {overview.kpis.completedProjects.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(overview.kpis.completedProjects.growth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>Completed contract projects</p>
                    </div>
                  </div>
                </div>

                {/* Collected vs Billed Chart */}
                {revenue && revenue.chartData && mounted && (
                  <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div>
                        <h3 className="font-heading" style={{ fontSize: "16px", fontWeight: 700 }}>Collected vs. Billed Trend</h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Financial progress and monthly billing timeline comparison.</p>
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "11px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", background: "var(--color-signal-teal)", borderRadius: "50%" }} />
                          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Collected</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", background: "var(--color-iris-violet)", borderRadius: "50%" }} />
                          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Billed</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: "100%", height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenue.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-signal-teal)" stopOpacity={0.12}/>
                              <stop offset="95%" stopColor="var(--color-signal-teal)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-iris-violet)" stopOpacity={0.12}/>
                              <stop offset="95%" stopColor="var(--color-iris-violet)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "$0" : `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                          <Area type="monotone" dataKey="revenue" name="Collected" stroke="var(--color-signal-teal)" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                          <Area type="monotone" dataKey="billed" name="Billed" stroke="var(--color-iris-violet)" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Forecast & Productivity Split */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="grid-responsive-2">
                  
                  {/* Forecast */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <TrendingUp size={16} color="var(--color-brand)" />
                      <h3 className="font-heading" style={{ fontSize: "14px" }}>Dynamic Cashflow Forecast</h3>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      Based on your active projects pipeline and a current payment collection efficiency rate of <strong>{overview ? overview.kpis.collectionRate.value.toFixed(0) : "85"}%</strong>, your expected incoming collections for the next 30 days is projected to be:
                    </p>
                    <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-brand)" }}>
                        ${Math.round(revenueForecast).toLocaleString()}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Projected collections</span>
                    </div>
                  </div>

                  {/* Productivity Stats */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Hourglass size={16} color="var(--color-iris-violet)" />
                      <h3 className="font-heading" style={{ fontSize: "14px" }}>Productivity & Payment Speed</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Avg Invoice Settlement Duration</span>
                          <span style={{ fontWeight: 700 }}>{overview.kpis.avgPaymentTimeDays.value.toFixed(1)} Days</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min((overview.kpis.avgPaymentTimeDays.value / 30) * 100, 100)}%`, height: "100%", background: "var(--color-iris-violet)", borderRadius: "3px" }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Billing Collection Efficiency</span>
                          <span style={{ fontWeight: 700 }}>{overview.kpis.collectionRate.value.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${overview.kpis.collectionRate.value}%`, height: "100%", background: "#10b981", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ── FINANCIALS TAB ── */}
            {activeTab === "financials" && invoices && overview && (
              <>
                {/* Financial Overview KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-responsive-2">
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Average Invoice Value</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.avgInvoiceValue.value, "currency")}</span>
                      {overview.kpis.avgInvoiceValue.growth !== null && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.avgInvoiceValue.growth >= 0 ? "#10b981" : "#ef4444" }}>
                          {overview.kpis.avgInvoiceValue.growth >= 0 ? "+" : ""}{overview.kpis.avgInvoiceValue.growth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Collection Rate</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.collectionRate.value, "percent")}</span>
                      {overview.kpis.collectionRate.growth !== null && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.collectionRate.growth >= 0 ? "#10b981" : "#ef4444" }}>
                          {overview.kpis.collectionRate.growth >= 0 ? "+" : ""}{overview.kpis.collectionRate.growth.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Unpaid Balances</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--error)" }}>{formatVal(overview.kpis.outstandingRevenue.value, "currency")}</span>
                    </div>
                  </div>
                </div>

                {/* Status Distribution & Upcoming Collections */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="grid-responsive-2">
                  
                  {/* Status distribution */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Invoice Status Distribution</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Aggregated values and count segmented by status.</p>
                    
                    {invoices.statusDistribution.length === 0 ? (
                      <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                        No invoice records in range.
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
                        <div style={{ width: "140px", height: "140px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={invoices.statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={60}
                                paddingAngle={3}
                                dataKey="totalValue"
                                nameKey="_id"
                              >
                                {invoices.statusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => `$${Number(value || 0).toLocaleString()}`}
                                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", fontSize: "11px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                          {invoices.statusDistribution.map((entry, index) => (
                            <div key={entry._id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", background: COLORS[index % COLORS.length], borderRadius: "50%" }} />
                              <span style={{ color: "var(--text-secondary)", textTransform: "capitalize", minWidth: "90px" }}>
                                {entry._id.replace("_", " ")}:
                              </span>
                              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                                ${entry.totalValue.toLocaleString()}
                              </span>
                              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>({entry.count})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upcoming Payments Schedule */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Expected Invoice Schedules</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Collections and due dates scheduled in the next 30 days.</p>
                    
                    {invoices.upcomingPayments.length === 0 ? (
                      <EmptyState
                        icon={<Clock />}
                        heading="No expected payments"
                        description="All current balances are fully collected or settled."
                      />
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Invoice</th>
                              <th>Client</th>
                              <th>Due Date</th>
                              <th style={{ textAlign: "right" }}>Pending</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.upcomingPayments.slice(0, 4).map((pay) => (
                              <tr key={pay._id}>
                                <td style={{ fontWeight: 700 }}>{pay.invoiceNumber}</td>
                                <td style={{ color: "var(--text-secondary)" }}>{pay.clientName}</td>
                                <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                  {new Date(pay.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--color-brand)" }}>
                                  {formatVal(pay.remainingAmount, "currency", pay.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

                {/* Recent Activities */}
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Recent Billing Activity</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Log of recently triggered invoices and settlement changes.</p>
                  
                  {invoices.recentActivity.length === 0 ? (
                    <EmptyState
                      icon={<FileText />}
                      heading="No recent actions"
                      description="Recent updates will appear as soon as clients clear bills."
                    />
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Invoice Number</th>
                            <th>Client Name</th>
                            <th>Status Badge</th>
                            <th>Date Issued</th>
                            <th style={{ textAlign: "right" }}>Billing Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.recentActivity.slice(0, 6).map((act) => (
                            <tr key={act._id}>
                              <td style={{ fontWeight: 700 }}>{act.invoiceNumber}</td>
                              <td style={{ color: "var(--text-secondary)" }}>{act.clientName}</td>
                              <td>
                                <span
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    background: act.status === "paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                    color: act.status === "paid" ? "#10b981" : "#3b82f6",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {act.status}
                                </span>
                              </td>
                              <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                {new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>
                                {formatVal(act.total, "currency", act.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── PROJECTS & PROPOSALS TAB ── */}
            {activeTab === "projects" && projects && proposals && overview && (
              <>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-responsive-2">
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Average Project Value</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.avgProjectValue.value, "currency")}</span>
                      {overview.kpis.avgProjectValue.growth !== null && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.avgProjectValue.growth >= 0 ? "#10b981" : "#ef4444" }}>
                          {overview.kpis.avgProjectValue.growth >= 0 ? "+" : ""}{overview.kpis.avgProjectValue.growth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Pitches Won Rate</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.winRate.value, "percent")}</span>
                      {overview.kpis.winRate.growth !== null && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: overview.kpis.winRate.growth >= 0 ? "#10b981" : "#ef4444" }}>
                          {overview.kpis.winRate.growth >= 0 ? "+" : ""}{overview.kpis.winRate.growth.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Completed Deliverables</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800 }}>{formatVal(overview.kpis.completedProjects.value, "number")}</span>
                    </div>
                  </div>
                </div>

                {/* Project Status Breakdown & Proposal Funnel */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="grid-responsive-2">
                  
                  {/* Status list */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Project Status Volumes</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Active projects count and relative financial budgets.</p>
                    
                    {projects.statusBreakdown.length === 0 ? (
                      <EmptyState
                        icon={<Briefcase />}
                        heading="No active projects"
                        description="Start creating new contract pipelines."
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {projects.statusBreakdown.map((item) => {
                          const maxVal = Math.max(...projects.statusBreakdown.map(i => i.count), 1);
                          const pct = (item.count / maxVal) * 100;
                          return (
                            <div key={item._id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                <span style={{ color: "var(--text-primary)", textTransform: "capitalize", fontWeight: 700 }}>{item._id.replace("_", " ")}</span>
                                <span style={{ color: "var(--text-secondary)" }}>{item.count} projects (${item.totalBudget.toLocaleString()})</span>
                              </div>
                              <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-iris-violet)", borderRadius: "3px" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Funnel flow */}
                  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                    <h3 className="font-heading" style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Proposal Conversion Funnel</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Win rates and submission pipelines.</p>
                    
                    {proposals.funnel.generated === 0 ? (
                      <EmptyState
                        icon={<Percent />}
                        heading="No proposal data"
                        description="Draft a proposal in our AI editor to see metrics."
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {[
                          { label: "AI Drafted / Generated", count: proposals.funnel.generated, percent: 100, color: "var(--text-muted)" },
                          { label: "Submitted / Sent", count: proposals.funnel.sent, percent: proposals.funnel.sendRate, color: "var(--color-iris-violet)" },
                          { label: "Won / Accepted", count: proposals.funnel.won, percent: proposals.funnel.winRate, color: "#10b981", suffix: " (Win Rate)" },
                        ].map((step, index) => (
                          <div key={index}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{step.label}</span>
                              <span style={{ color: "var(--text-secondary)" }}>{step.count} ({step.percent.toFixed(0)}%{step.suffix || ""})</span>
                            </div>
                            <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${step.percent}%`, height: "100%", background: step.color, borderRadius: "4px" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}

            {/* ── CLIENTS TAB ── */}
            {activeTab === "clients" && topClients && topClients.topClients && (
              <>
                {/* Visual Chart collected */}
                <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)", padding: "24px" }}>
                  <h3 className="font-heading" style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Top Performing Clients</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Revenue collected and active bills segmented by client company.</p>
                  
                  {topClients.topClients.length === 0 ? (
                    <EmptyState
                      icon={<Users />}
                      heading="No client records"
                      description="Create new clients and invoices to track metrics."
                    />
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }} className="grid-responsive-2">
                      
                      {/* Bar chart left */}
                      <div style={{ width: "100%", height: "240px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topClients.topClients} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} width={80} />
                            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                            <Bar dataKey="revenue" name="Collected Revenue" fill="var(--color-brand)" radius={[0, 4, 4, 0]} barSize={12} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Client CRM detail table */}
                      <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Client</th>
                              <th>Company</th>
                              <th style={{ textAlign: "right" }}>Billed</th>
                              <th style={{ textAlign: "right" }}>Collected</th>
                              <th style={{ textAlign: "right" }}>Outstanding</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topClients.topClients.slice(0, 5).map((c, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 700 }}>{c.name}</td>
                                <td style={{ color: "var(--text-secondary)" }}>{c.company}</td>
                                <td style={{ textAlign: "right" }}>${c.billed.toLocaleString()}</td>
                                <td style={{ textAlign: "right", color: "#10b981", fontWeight: 700 }}>${c.revenue.toLocaleString()}</td>
                                <td style={{ textAlign: "right", color: c.outstanding > 0 ? "var(--error)" : "var(--text-muted)", fontWeight: 600 }}>
                                  ${c.outstanding.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
