"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  MoreHorizontal,
  Eye,
  Trash2,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Helper for status badge styling
const getBadgeVariant = (status: InvoiceStatus): "active" | "pending" | "inactive" => {
  switch (status) {
    case "paid":
      return "active";
    case "partially_paid":
    case "sent":
    case "draft":
      return "pending";
    case "overdue":
    case "cancelled":
    default:
      return "inactive";
  }
};

const STATUS_CFG: Record<
  InvoiceStatus,
  { label: string; badge: string; color: string }
> = {
  draft:          { label: "Draft",          badge: "bg-slate-500/10 text-slate-500",      color: "var(--text-muted)" },
  sent:           { label: "Sent",           badge: "bg-blue-500/10 text-blue-500",        color: "var(--info)" },
  partially_paid: { label: "Partially Paid", badge: "bg-amber-500/10 text-amber-500",    color: "var(--warning)" },
  paid:           { label: "Paid",           badge: "bg-emerald-500/10 text-emerald-500",  color: "var(--success)" },
  overdue:        { label: "Overdue",        badge: "bg-rose-500/10 text-rose-500",        color: "var(--error)" },
  cancelled:      { label: "Cancelled",      badge: "bg-slate-500/15 text-slate-400 line-through", color: "var(--text-subtle)" },
};

function formatCurrency(amount: number, currency: string = "INR") {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? "—"
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InvoicesPage() {
  useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    partiallyPaidInvoices: 0,
    totalRevenue: 0,
    outstandingRevenue: 0,
  });

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [clientF, setClientF] = useState<string>("all");
  const [projectF, setProjectF] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Relations cache for filter dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Action / UI States
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load invoice stats", err);
    }
  }, []);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("q", search);
      if (statusF !== "all") p.set("status", statusF);
      if (clientF !== "all") p.set("clientId", clientF);
      if (projectF !== "all") p.set("projectId", projectF);
      p.set("sortBy", sortBy);
      p.set("sortOrder", sortOrder);
      p.set("page", page.toString());
      p.set("limit", limit.toString());

      const res = await fetch(`/api/invoices?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusF, clientF, projectF, sortBy, sortOrder, page]);

  // Fetch dropdown lists
  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const [resClients, resProjects] = await Promise.all([
          fetch("/api/clients?limit=100"),
          fetch("/api/projects?limit=100"),
        ]);
        if (resClients.ok) {
          const cData = await resClients.json();
          setClients(cData.clients ?? []);
        }
        if (resProjects.ok) {
          const pData = await resProjects.json();
          setProjects(pData.projects ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown list options", err);
      }
    };
    fetchRelations();
  }, []);

  // Sync data query
  useEffect(() => {
    const t = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(t);
  }, [fetchInvoices]);

  // Sync stats when list modifies
  useEffect(() => {
    fetchStats();
  }, [invoices, fetchStats]);

  // Dropdown Menu handler
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Actions
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== deleteTarget._id));
        setTotal((t) => Math.max(0, t - 1));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Failed to delete invoice", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Main Container */}
      <main style={{ flex: 1, padding: "28px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>

        {/* Page Title + Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "28px", letterSpacing: "-0.02em" }}>Invoices</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>Manage billing, track payments, and monitor outstanding revenue.</p>
          </div>
          <Link href="/dashboard/invoices/new">
            <Button className="btn-redesign btn-redesign-primary btn-redesign-sm" leftIcon={<Plus size={13} />}>
              New Invoice
            </Button>
          </Link>
        </div>
        
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Total Invoices", value: stats.totalInvoices, icon: <FileText size={15} />, color: "var(--color-brand)" },
            { label: "Total Received", value: formatCurrency(stats.totalRevenue), icon: <CheckCircle size={15} />, color: "var(--color-success)" },
            { label: "Outstanding Revenue", value: formatCurrency(stats.outstandingRevenue), icon: <Clock size={15} />, color: "var(--color-brand)" },
            { label: "Overdue Invoices", value: stats.overdueInvoices, icon: <AlertTriangle size={15} />, color: "var(--color-danger)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Options Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: "20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            
            {/* Search query */}
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: "220px", maxWidth: "340px" }}>
              <span className="search-input-icon"><Search size={13} /></span>
              <input
                id="invoice-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by invoice number..."
                className="search-input"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flex: 1 }}>
              {/* Client dropdown */}
              <div style={{ position: "relative" }}>
                <select
                  id="client-filter"
                  value={clientF}
                  onChange={(e) => { setClientF(e.target.value); setPage(1); }}
                  className="input-redesign"
                  style={{ width: "auto", height: "36px", paddingRight: "28px", cursor: "pointer", fontSize: "13px" }}
                >
                  <option value="all">All Clients</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Project dropdown */}
              <div style={{ position: "relative" }}>
                <select
                  id="project-filter"
                  value={projectF}
                  onChange={(e) => { setProjectF(e.target.value); setPage(1); }}
                  className="input-redesign"
                  style={{ width: "auto", height: "36px", paddingRight: "28px", cursor: "pointer", fontSize: "13px" }}
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Sort by:</span>
              <button
                onClick={() => toggleSort("createdAt")}
                className={`filter-tab${sortBy === "createdAt" ? " active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px" }}
              >
                Date {sortBy === "createdAt" && <ArrowUpDown size={11} />}
              </button>
              <button
                onClick={() => toggleSort("dueDate")}
                className={`filter-tab${sortBy === "dueDate" ? " active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px" }}
              >
                Due Date {sortBy === "dueDate" && <ArrowUpDown size={11} />}
              </button>
              <button
                onClick={() => toggleSort("total")}
                className={`filter-tab${sortBy === "total" ? " active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px" }}
              >
                Amount {sortBy === "total" && <ArrowUpDown size={11} />}
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div style={{ borderTop: "1.5px solid var(--border-subtle)", paddingTop: "12px", display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, marginRight: "8px" }}>Status:</span>
            {["all", "draft", "sent", "partially_paid", "paid", "overdue", "cancelled"].map((s) => (
              <button
                key={s}
                id={`status-filter-${s}`}
                onClick={() => { setStatusF(s); setPage(1); }}
                className={`filter-tab${statusF === s ? " active" : ""}`}
                style={{ padding: "6px 12px", fontSize: "12.5px" }}
              >
                {s === "all" ? "All Invoices" : STATUS_CFG[s as InvoiceStatus].label}
              </button>
            ))}
          </div>
        </div>

        {/* Content list block */}
        <div className="glass-card" style={{ padding: "0px", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "20px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="shimmer" style={{ height: "58px", width: "100%", borderRadius: "var(--radius)", marginBottom: "8px" }} />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px", minHeight: "360px", gap: "16px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <FileText size={28} />
              </div>
              <div>
                <h3 className="font-heading" style={{ fontSize: "18px", marginBottom: "6px", letterSpacing: "-0.015em" }}>
                  No invoices found
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto" }}>
                  {search || statusF !== "all" || clientF !== "all" || projectF !== "all"
                    ? "Try adjusting your filters or search query to find your invoices."
                    : "Create professional invoices to request and track payments from clients."}
                </p>
              </div>
              {(!search && statusF === "all" && clientF === "all" && projectF === "all") && (
                <Link href="/dashboard/invoices/new">
                  <Button variant="primary" size="sm" leftIcon={<Plus size={13} />}>
                    Create First Invoice
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                    {["Invoice Number", "Client", "Project", "Amount", "Paid", "Due Date", "Status", ""].map((col) => (
                      <th key={col} style={{ textAlign: "left", padding: "14px 18px", fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const client = inv.clientId as unknown as Client;
                    const project = inv.projectId as unknown as Project;
                    const cfg = STATUS_CFG[inv.status];
                    const isOverdue = inv.status === "overdue";

                    return (
                      <tr
                        key={inv._id}
                        style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s ease", cursor: "pointer" }}
                        onClick={() => window.location.href = `/dashboard/invoices/${inv._id}`}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-elevated)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                      >
                        {/* Inv Number */}
                        <td style={{ padding: "16px 18px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        {/* Client name */}
                        <td style={{ padding: "16px 18px" }}>
                          {client ? (
                            <div>
                              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</p>
                              {client.company && (
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{client.company}</p>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>—</span>
                          )}
                        </td>
                        {/* Project title */}
                        <td style={{ padding: "16px 18px" }}>
                          {project ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Briefcase size={12} color="var(--text-subtle)" />
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                                {project.title}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>—</span>
                          )}
                        </td>
                        {/* Amount */}
                        <td style={{ padding: "16px 18px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {formatCurrency(inv.total, inv.currency)}
                          </span>
                        </td>
                        {/* Paid */}
                        <td style={{ padding: "16px 18px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                            {inv.amountPaid > 0 ? formatCurrency(inv.amountPaid, inv.currency) : "—"}
                          </span>
                        </td>
                        {/* Due Date */}
                        <td style={{ padding: "16px 18px" }}>
                          <span style={{ fontSize: "12.5px", color: isOverdue ? "var(--error)" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={12} color={isOverdue ? "var(--error)" : "var(--text-subtle)"} />
                            {fmtDate(inv.dueDate)}
                          </span>
                        </td>
                        {/* Status badge */}
                        <td style={{ padding: "16px 18px" }}>
                          <Badge variant={getBadgeVariant(inv.status)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color }} />
                              {cfg.label}
                            </span>
                          </Badge>
                        </td>
                        {/* Actions menu */}
                        <td style={{ padding: "16px 18px", position: "relative" }} onClick={(e) => e.stopPropagation()}>
                          <div ref={activeMenu === inv._id ? menuRef : null}>
                            <button
                              id={`inv-menu-${inv._id}`}
                              onClick={() => setActiveMenu((m) => (m === inv._id ? null : inv._id))}
                              style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {activeMenu === inv._id && (
                              <div className="dropdown-menu" style={{ right: "18px", top: "42px", zIndex: 100 }}>
                                <Link href={`/dashboard/invoices/${inv._id}`} className="dropdown-item">
                                  <Eye size={13} /> View Invoice
                                </Link>
                                <button
                                  className="dropdown-item danger"
                                  onClick={() => { setDeleteTarget(inv); setActiveMenu(null); }}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {total > limit && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: "0.5px solid var(--border)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing {Math.min(total, (page - 1) * limit + 1)}–{Math.min(total, page * limit)} of {total} invoices
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft size={13} />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page * limit >= total}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight size={13} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {mounted && deleteTarget && createPortal(
        <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="subpage-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 className="font-heading" style={{ fontSize: "16px" }}>Delete Invoice</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Are you sure you want to delete invoice <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.invoiceNumber}</strong>? This action will reverse any corresponding payment statistics logged under clients or projects.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
              <Button onClick={() => setDeleteTarget(null)} variant="secondary" size="sm" disabled={deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="primary"
                size="sm"
                style={{ background: "var(--error)", color: "white" }}
                disabled={deleting}
                leftIcon={deleting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
              >
                {deleting ? "Deleting..." : "Delete Invoice"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
