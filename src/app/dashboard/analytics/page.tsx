"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
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
        // Refresh all analytics
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
    
    // Overview KPIs
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

    // Top Clients
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

  return (
    <div className="analytics-page-container" style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
      {/* CSS stylesheet for print overrides */}
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
                onClick={handleExportCSV}
                leftIcon={<Download size={13} />}
                disabled={loading}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintPDF}
                leftIcon={<Printer size={13} />}
                disabled={loading}
              >
                Print PDF
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
            {seeding ? "Generating..." : isWorkspaceEmpty ? "Generate Demo Workspace" : "Reset Demo Data"}
          </Button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="print-full" style={{ flex: 1, padding: "28px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
        {/* Page Title & Subtitle */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "24px", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              Earnings Analytics
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Detailed financial metrics, proposal win rates, and project performance breakdowns.
            </p>
          </div>
        </div>

        {/* Date Filters Component */}
        <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", padding: "12px 16px", border: "1px solid var(--border)", background: "var(--surface-1)", borderRadius: "var(--radius)", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
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
                onMouseEnter={(e) => {
                  if (range !== f.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (range !== f.id) e.currentTarget.style.background = "transparent";
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {range === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
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
          /* Empty Slate Component */
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px" }}>
            <EmptyState
              icon={<BarChart3 />}
              heading="No Analytics Data Available"
              description="Your FreelAI workspace currently contains no client records, projects, invoices, or proposals to aggregate. Kickstart your dashboard by generating a professional demo workspace."
              actionLabel={seeding ? "Generating..." : "Generate Demo Workspace"}
              onActionClick={handleGenerateDemo}
            />
          </div>
        ) : (
          /* Render Full Dashboard */
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* KPI Cards Grid */}
            {overview && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {[
                  {
                    label: "Total Revenue",
                    value: formatVal(overview.kpis.totalRevenue.value, "currency"),
                    growth: overview.kpis.totalRevenue.growth,
                    icon: <DollarSign size={16} />,
                    desc: "Revenue collected inside the period",
                  },
                  {
                    label: "Outstanding Revenue",
                    value: formatVal(overview.kpis.outstandingRevenue.value, "currency"),
                    growth: null,
                    icon: <Clock size={16} />,
                    desc: "Total unpaid invoice balances",
                  },
                  {
                    label: "Active Clients",
                    value: formatVal(overview.kpis.activeClients.value, "number"),
                    growth: overview.kpis.activeClients.growth,
                    icon: <Users size={16} />,
                    desc: "Clients with active contract status",
                  },
                  {
                    label: "Completed Projects",
                    value: formatVal(overview.kpis.completedProjects.value, "number"),
                    growth: overview.kpis.completedProjects.growth,
                    icon: <CheckCircle size={16} />,
                    desc: "Deliverables fully completed",
                  },
                  {
                    label: "Average Project Value",
                    value: formatVal(overview.kpis.avgProjectValue.value, "currency"),
                    growth: overview.kpis.avgProjectValue.growth,
                    icon: <Briefcase size={16} />,
                    desc: "Average budget of period projects",
                  },
                  {
                    label: "Proposal Win Rate",
                    value: formatVal(overview.kpis.winRate.value, "percent"),
                    growth: overview.kpis.winRate.growth,
                    icon: <Percent size={16} />,
                    desc: "Proposals won / total submitted",
                    isDiff: true,
                  },
                  {
                    label: "Collection Rate",
                    value: formatVal(overview.kpis.collectionRate.value, "percent"),
                    growth: overview.kpis.collectionRate.growth,
                    icon: <TrendingUp size={16} />,
                    desc: "Payments collected / total billed",
                    isDiff: true,
                  },
                  {
                    label: "Average Invoice Value",
                    value: formatVal(overview.kpis.avgInvoiceValue.value, "currency"),
                    growth: overview.kpis.avgInvoiceValue.growth,
                    icon: <FileText size={16} />,
                    desc: "Mean amount per billed invoice",
                  },
                  {
                    label: "Average Payment Time",
                    value: formatVal(overview.kpis.avgPaymentTimeDays.value, "days"),
                    growth: null,
                    icon: <Hourglass size={16} />,
                    desc: "Days from invoice issue to payment",
                  },
                ].map((k) => (
                  <div
                    key={k.label}
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "10px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {k.label}
                      </span>
                      <div style={{ color: "var(--text-muted)" }}>{k.icon}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                          {k.value}
                        </span>
                        {k.growth !== null && k.growth !== undefined && (
                          <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: 600, color: k.growth >= 0 ? "#10b981" : "#ef4444" }}>
                            {k.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            <span>{Math.abs(k.growth).toFixed(1)}{k.isDiff ? "pp" : "%"}</span>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{k.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Business Insights Panel */}
            {overview && overview.insights && overview.insights.length > 0 && (
              <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Sparkles size={16} color="var(--color-brand)" />
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)" }}>Smart Business Insights</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {overview.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(99, 102, 241, 0.05)",
                        borderLeft: "2px solid var(--color-brand)",
                        fontSize: "12.5px",
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
            {/* Time Series Area Chart */}
            {revenue && revenue.chartData && mounted && (
              <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)" }}>Billed vs. Collected Revenue</h3>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Financial progress comparison throughout the period.</p>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", background: "var(--color-signal-teal)", borderRadius: "2px" }} />
                      <span style={{ color: "var(--text-secondary)", fontWeight: 510 }}>Collected</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", background: "var(--color-iris-violet)", borderRadius: "2px" }} />
                      <span style={{ color: "var(--text-secondary)", fontWeight: 510 }}>Billed</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: "100%", height: "280px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} tickLine={chartTheme.xAxis.tickLine} axisLine={chartTheme.xAxis.axisLine} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={chartTheme.yAxis.tickLine} axisLine={chartTheme.yAxis.axisLine} />
                      <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                      <Area type="monotone" dataKey="revenue" name="Collected" stroke="var(--color-signal-teal)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCollected)" />
                      <Area type="monotone" dataKey="billed" name="Billed" stroke="var(--color-iris-violet)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBilled)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Two Column Layout: Top Clients & Invoice Distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
              
              {/* Top Clients Bar Chart */}
              {topClients && topClients.topClients && mounted && (
                <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Top Clients</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "20px" }}>Clients sorted by total payments collected.</p>
                  
                  {topClients.topClients.length === 0 ? (
                    <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No client revenue data in the range.
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topClients.topClients} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid stroke={chartTheme.grid.stroke} strokeDasharray={chartTheme.grid.strokeDasharray} horizontal={false} />
                          <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={chartTheme.xAxis.tickLine} axisLine={chartTheme.xAxis.axisLine} />
                          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={9} tickLine={chartTheme.yAxis.tickLine} axisLine={chartTheme.yAxis.axisLine} width={80} />
                          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                          <Bar dataKey="revenue" name="Collected Revenue" fill="var(--color-brand)" radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Invoices Status Distribution Pie Chart */}
              {invoices && invoices.statusDistribution && mounted && (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Invoice Status Distribution</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Billed values segmented by status.</p>
                  
                  {invoices.statusDistribution.length === 0 ? (
                    <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No invoice records in range.
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: "200px" }}>
                      <div style={{ width: "160px", height: "160px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={invoices.statusDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="totalValue"
                              nameKey="_id"
                            >
                              {invoices.statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: string | number | boolean | null | readonly (string | number)[] | undefined) => {
                                const numVal = typeof value === "number" ? value : Number(value);
                                return isNaN(numVal) ? "" : `$${numVal.toLocaleString()}`;
                              }}
                              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "11px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Custom Legend */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                        {invoices.statusDistribution.map((entry, index) => (
                          <div key={entry._id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", background: COLORS[index % COLORS.length], borderRadius: "50%" }} />
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500, textTransform: "capitalize" }}>
                              {entry._id.replace("_", " ")}:
                            </span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                              ${entry.totalValue.toLocaleString()} ({entry.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Two Column Layout: Project Status & Proposal Conversion Funnel */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
              
              {/* Project Status Breakdown */}
              {projects && projects.statusBreakdown && (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Project Status Breakdown</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Active projects and budget volumes per status.</p>
                  
                  {projects.statusBreakdown.length === 0 ? (
                    <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No project records in range.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {projects.statusBreakdown.map((item) => {
                        const maxVal = Math.max(...projects.statusBreakdown.map(i => i.count), 1);
                        const pct = (item.count / maxVal) * 100;
                        return (
                          <div key={item._id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                              <span style={{ color: "var(--text-primary)", textTransform: "capitalize", fontWeight: 600 }}>{item._id.replace("_", " ")}</span>
                              <span style={{ color: "var(--text-secondary)" }}>{item.count} projects (${item.totalBudget.toLocaleString()})</span>
                            </div>
                            <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#a855f7", borderRadius: "3px" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Proposal Funnel */}
              {proposals && proposals.funnel && (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Proposal Conversion Funnel</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Conversion flow from generation to conversion.</p>
                  
                  {proposals.funnel.generated === 0 ? (
                    <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No proposals in range.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { label: "Drafted / Generated", count: proposals.funnel.generated, percent: 100, color: "var(--text-muted)" },
                        { label: "Submitted / Sent", count: proposals.funnel.sent, percent: proposals.funnel.sendRate, color: "var(--color-accent)" },
                        { label: "Closed / Won", count: proposals.funnel.won, percent: proposals.funnel.winRate, color: "#10b981", suffix: " (Win Rate)" },
                      ].map((step, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{step.label}</span>
                              <span style={{ color: "var(--text-secondary)" }}>{step.count} ({step.percent.toFixed(0)}%{step.suffix || ""})</span>
                            </div>
                            <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${step.percent}%`, height: "100%", background: step.color, borderRadius: "4px" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Two Column Layout: Recent Activities & Upcoming Payments */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", pageBreakBefore: "always" }}>
              
              {/* Recent Financial Activity */}
              {invoices && invoices.recentActivity && (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Recent Financial Activity</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Latest invoice actions and payments logged.</p>
                  
                  {invoices.recentActivity.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No recent activities recorded.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table" style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Invoice</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Client</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Status</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)", textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.recentActivity.map((act) => (
                            <tr key={act._id} style={{ borderBottom: "0.5px solid var(--border)" }}>
                              <td style={{ padding: "10px 4px", fontWeight: "bold", color: "var(--text-primary)" }}>{act.invoiceNumber}</td>
                              <td style={{ padding: "10px 4px", color: "var(--text-secondary)" }}>{act.clientName}</td>
                              <td style={{ padding: "10px 4px" }}>
                                <span
                                  style={{
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "9.5px",
                                    fontWeight: "bold",
                                    background: act.status === "paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                    color: act.status === "paid" ? "#10b981" : "#3b82f6",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {act.status}
                                </span>
                              </td>
                              <td style={{ padding: "10px 4px", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                                {formatVal(act.total, "currency", act.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Payments */}
              {invoices && invoices.upcomingPayments && (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>Upcoming Payments</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Expected collections due in the next 30 days.</p>
                  
                  {invoices.upcomingPayments.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                      No upcoming pending payments.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table" style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Invoice</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Client</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)" }}>Due Date</th>
                            <th style={{ padding: "8px 4px", color: "var(--text-muted)", textAlign: "right" }}>Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.upcomingPayments.map((pay) => (
                            <tr key={pay._id} style={{ borderBottom: "0.5px solid var(--border)" }}>
                              <td style={{ padding: "10px 4px", fontWeight: "bold", color: "var(--text-primary)" }}>{pay.invoiceNumber}</td>
                              <td style={{ padding: "10px 4px", color: "var(--text-secondary)" }}>{pay.clientName}</td>
                              <td style={{ padding: "10px 4px", color: "var(--text-muted)" }}>
                                {new Date(pay.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td style={{ padding: "10px 4px", textAlign: "right", fontWeight: 600, color: "var(--color-brand)" }}>
                                {formatVal(pay.remainingAmount, "currency", pay.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
