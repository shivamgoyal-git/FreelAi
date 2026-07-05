"use client";

import { toast } from "sonner";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  X,
  CreditCard,
  Printer,
  Trash2,
  XCircle,
  Clock,
  CheckCircle,
  Building,
  Activity as ActivityIcon,
  Zap,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import type { IActivity } from "@/models/Activity";
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

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Actions States
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [recording, setRecording] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Invoice Details
  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load invoice details.");
      }
      const data = await res.json();
      setInvoice(data.invoice);
      setActivities(data.activities ?? []);
      if (data.invoice) {
        setPaymentAmount(Number(data.invoice.remainingAmount.toFixed(2)));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Record Payment Submit
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || paymentAmount <= 0) return;

    setRecording(true);
    try {
      const res = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: paymentAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentOpen(false);
        fetchDetails(); // reload data
      } else {
        toast.error(data.error || "Failed to record payment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to communicate with payment API.");
    } finally {
      setRecording(false);
    }
  };

  // Cancel Invoice Submit
  const handleCancelInvoice = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setCancelOpen(false);
        fetchDetails(); // reload data
      } else {
        toast.error("Failed to cancel invoice.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  // Delete Invoice Submit
  const handleDeleteInvoice = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/invoices");
      } else {
        toast.error("Failed to delete invoice.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1.2s linear infinite", color: "var(--color-brand)" }} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "24px" }}>
        <AlertTriangle size={48} color="var(--error)" />
        <h2 className="font-heading" style={{ fontSize: "20px" }}>Invoice Not Found</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{error || "The requested invoice could not be found or you do not have permission to view it."}</p>
        <Link href="/dashboard/invoices">
          <Button variant="secondary">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const client = invoice.clientId as unknown as Client;
  const project = invoice.projectId as unknown as Project;
  const cfg = STATUS_CFG[invoice.status];

  // Parse payment transactions from activities
  const paymentLogs = activities.filter((act) =>
    ["invoice_partially_paid", "invoice_paid"].includes(act.type)
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      
      {/* Top Nav (Hidden in print) */}
      <header className="no-print" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/dashboard/invoices"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px", transition: "color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14} /> Invoices
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
        <h1 className="font-heading" style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
          Invoice Details
        </h1>
        <div style={{ flex: 1 }} />
        
        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => window.print()} variant="secondary" size="sm" leftIcon={<Printer size={13} />}>
            Print / PDF
          </Button>

          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <Button onClick={() => { setPaymentOpen(true); }} variant="primary" size="sm" leftIcon={<CreditCard size={13} />}>
              Record Payment
            </Button>
          )}

          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <Button onClick={() => setCancelOpen(true)} variant="secondary" size="sm" style={{ color: "var(--text-muted)" }}>
              Cancel
            </Button>
          )}

          <Button onClick={() => setDeleteOpen(true)} variant="ghost" size="sm" style={{ color: "var(--color-danger)" }}>
            <Trash2 size={13} />
          </Button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main style={{ flex: 1, padding: "28px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
        
        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "28px", alignItems: "flex-start" }}>
          
          {/* Left Column (Timeline & Payment History) - Hidden in print */}
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Status Summary Widget */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={15} color="var(--color-brand)" /> Billing Summary
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Due</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                    {formatCurrency(invoice.total, invoice.currency)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Amount Paid</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-success)", marginTop: "2px" }}>
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Remaining Balance</p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: invoice.remainingAmount > 0 ? "var(--color-brand)" : "var(--text-primary)", marginTop: "1px" }}>
                    {formatCurrency(invoice.remainingAmount, invoice.currency)}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(invoice.status)}>
                  {cfg.label}
                </Badge>
              </div>
            </div>

            {/* Payment history log ledger */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginBottom: "14px" }}>
                Payment History
              </h3>

              {paymentLogs.length === 0 ? (
                <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", textAlign: "center", padding: "20px 0" }}>
                  No payments recorded for this invoice yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {paymentLogs.map((log) => (
                    <div key={String(log._id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--border)" }}>
                      <div>
                        <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>Payment Received</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{log.description}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--color-success)" }}>
                          + {fmtDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Timeline */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ActivityIcon size={15} /> Invoice Timeline
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0px", paddingLeft: "8px" }}>
                {activities.map((act, idx) => {
                  let icon = <Clock size={11} />;
                  let color = "var(--text-muted)";
                  if (act.type === "invoice_paid") {
                    icon = <CheckCircle size={11} />;
                    color = "var(--color-success)";
                  } else if (act.type === "invoice_cancelled" || act.type === "invoice_overdue") {
                    icon = <XCircle size={11} />;
                    color = "var(--error)";
                  }

                  return (
                    <div key={String(act._id)} style={{ display: "flex", gap: "16px", position: "relative" }}>
                      {/* Vertical line indicator */}
                      {idx < activities.length - 1 && (
                        <div style={{ position: "absolute", left: "9px", top: "20px", bottom: "-10px", width: "1.5px", background: "var(--border)" }} />
                      )}

                      {/* Timeline dot */}
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--bg-elevated)", border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", color: color, zIndex: 2, flexShrink: 0, marginTop: "2px" }}>
                        {icon}
                      </div>

                      {/* Content */}
                      <div style={{ paddingBottom: idx < activities.length - 1 ? "24px" : "4px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                          {act.title}
                        </p>
                        <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "3px" }}>{act.description}</p>
                        <span style={{ fontSize: "10.5px", color: "var(--text-subtle)", display: "block", marginTop: "4px" }}>
                          {fmtDate(act.createdAt)} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Invoice PDF sheet */}
          <div className="print-container" style={{ display: "flex", justifyContent: "center" }}>
            
            {/* Invoice card */}
            <div className="print-shadow" style={{ width: "100%", maxWidth: "720px", minHeight: "860px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "50px", display: "flex", flexDirection: "column", gap: "32px", position: "relative" }}>
              
              {/* PAID Watermark Stamp */}
              {invoice.status === "paid" && (
                <div style={{ position: "absolute", top: "45px", right: "200px", border: "4px double #10b981", borderRadius: "8px", color: "#10b981", fontSize: "20px", fontWeight: 900, textTransform: "uppercase", padding: "6px 16px", transform: "rotate(-12deg) scale(1.1)", opacity: 0.75, letterSpacing: "0.1em", pointerEvents: "none", zIndex: 10 }}>
                  PAID
                </div>
              )}
              {invoice.status === "overdue" && (
                <div style={{ position: "absolute", top: "45px", right: "200px", border: "4px double var(--error)", borderRadius: "8px", color: "var(--error)", fontSize: "20px", fontWeight: 900, textTransform: "uppercase", padding: "6px 16px", transform: "rotate(-12deg) scale(1.1)", opacity: 0.75, letterSpacing: "0.1em", pointerEvents: "none", zIndex: 10 }}>
                  OVERDUE
                </div>
              )}
              {invoice.status === "cancelled" && (
                <div style={{ position: "absolute", top: "45px", right: "200px", border: "4px double var(--text-muted)", borderRadius: "8px", color: "var(--text-muted)", fontSize: "20px", fontWeight: 900, textTransform: "uppercase", padding: "6px 16px", transform: "rotate(-12deg) scale(1.1)", opacity: 0.75, letterSpacing: "0.1em", pointerEvents: "none", zIndex: 10 }}>
                  CANCELLED
                </div>
              )}

              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Zap size={15} color="var(--color-on-brand)" fill="var(--color-on-brand)" />
                    </div>
                    <span className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      Freel<span style={{ color: "var(--color-brand)" }}>Ai</span>
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Sender: {session?.user?.name || "Freelancer"}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Email: {session?.user?.email || "billing@freelai.co"}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <h2 className="font-heading" style={{ fontSize: "22px", color: "var(--text-primary)", letterSpacing: "-0.015em" }}>INVOICE</h2>
                  <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "4px" }}>{invoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Recipient details & dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "20px" }}>
                <div>
                  <p style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "8px" }}>Billed To</p>
                  {client ? (
                    <div>
                      <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</p>
                      {client.company && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}><Building size={11} style={{ display: "inline", marginRight: "4px" }} />{client.company}</p>
                      )}
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>{client.email}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: "12px", color: "var(--text-subtle)", fontStyle: "italic" }}>—</p>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "8px" }}>Details</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "12.5px" }}>
                    <p style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Date:</span> {fmtDate(invoice.issueDate)}</p>
                    <p style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Due:</span> {fmtDate(invoice.dueDate)}</p>
                    {project && (
                      <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}><span style={{ color: "var(--text-muted)" }}>Project:</span> {project.title}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ borderTop: "1.5px solid var(--border-subtle)", paddingTop: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                      <th style={{ textAlign: "left", paddingBottom: "10px" }}>Item Description</th>
                      <th style={{ textAlign: "center", paddingBottom: "10px", width: "60px" }}>Qty</th>
                      <th style={{ textAlign: "right", paddingBottom: "10px", width: "100px" }}>Rate</th>
                      <th style={{ textAlign: "right", paddingBottom: "10px", width: "110px" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 0", color: "var(--text-primary)", fontWeight: 500 }}>{item.description}</td>
                        <td style={{ padding: "12px 0", textAlign: "center", color: "var(--text-secondary)" }}>{item.quantity}</td>
                        <td style={{ padding: "12px 0", textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(item.rate, invoice.currency)}</td>
                        <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary math calculations */}
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "20px", marginTop: "8px" }}>
                <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Discount</span>
                      <span style={{ color: "var(--error)", fontWeight: 600 }}>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                    </div>
                  )}
                  {invoice.taxRate > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Tax ({invoice.taxRate}%)</span>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "10px", marginTop: "4px", fontSize: "14.5px", fontWeight: 800 }}>
                    <span style={{ color: "var(--text-primary)" }}>Total Due</span>
                    <span style={{ color: "var(--color-brand)" }}>{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                  {invoice.amountPaid > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "0.5px dashed var(--border-subtle)", paddingTop: "6px", fontSize: "12.5px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Amount Paid</span>
                      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info */}
              {(invoice.notes || invoice.paymentTerms) && (
                <div style={{ marginTop: "auto", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "20px", fontSize: "11.5px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {invoice.paymentTerms && (
                    <p style={{ color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-muted)" }}>Terms:</strong> {invoice.paymentTerms}</p>
                  )}
                  {invoice.notes && (
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>Notes</p>
                      <p style={{ color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{invoice.notes}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Record Payment Dialog */}
      {paymentOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => setPaymentOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="subpage-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--color-success)" }}>
                    <CreditCard size={15} />
                  </div>
                  <h2 className="font-heading" style={{ fontSize: "16px" }}>Record Payment</h2>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setPaymentOpen(false)}>
                  <X size={14} />
                </button>
              </div>
              <div className="modal-body" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Enter the payment amount received for invoice <strong style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</strong>. Outstanding remaining balance is <strong>{formatCurrency(invoice.remainingAmount, invoice.currency)}</strong>.
                </p>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="pay-amount">Payment Amount ({invoice.currency === "INR" ? "₹" : "$"}) *</label>
                  <input
                    id="pay-amount"
                    type="number"
                    required
                    min={0.01}
                    max={Number(invoice.remainingAmount.toFixed(2))}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="input-redesign"
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button onClick={() => setPaymentOpen(false)} type="button" variant="secondary" size="sm" disabled={recording}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={recording}
                  leftIcon={recording ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
                >
                  {recording ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Invoice Dialog */}
      {cancelOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => setCancelOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="subpage-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
                  <XCircle size={15} />
                </div>
                <h2 className="font-heading" style={{ fontSize: "16px" }}>Cancel Invoice</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCancelOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Are you sure you want to mark invoice <strong style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</strong> as cancelled? This action will freeze any payment operations for this invoice.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
              <Button onClick={() => setCancelOpen(false)} variant="secondary" size="sm" disabled={cancelling}>
                Cancel
              </Button>
              <Button
                onClick={handleCancelInvoice}
                variant="primary"
                size="sm"
                style={{ background: "var(--warning)", color: "white" }}
                disabled={cancelling}
                leftIcon={cancelling ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
              >
                {cancelling ? "Processing..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Invoice Dialog */}
      {deleteOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => setDeleteOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="subpage-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 className="font-heading" style={{ fontSize: "16px" }}>Delete Invoice</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Are you sure you want to delete invoice <strong style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</strong>? This action will reverse any corresponding payment statistics logged under clients or projects.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
              <Button onClick={() => setDeleteOpen(false)} variant="secondary" size="sm" disabled={deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteInvoice}
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
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-grid {
            display: block !important;
          }
          .print-container {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-shadow {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
