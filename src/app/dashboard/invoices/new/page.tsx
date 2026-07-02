"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  Plus,
  Trash2,
  FileText,
  Loader2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Building,
  Zap,
} from "lucide-react";
import type { InvoiceItem, InvoiceFormData, InvoiceStatus } from "@/types/invoice";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import { Button } from "@/components/ui/Button";

function formatCurrency(amount: number, currency: string = "INR") {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? "—"
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Load clients and projects for dropdown selection
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  // Form State
  const [form, setForm] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    clientId: "",
    projectId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "INR",
    discount: 0,
    taxRate: 0,
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    notes: "",
    paymentTerms: "Due on receipt",
    status: "sent",
    amountPaid: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dropdown lists
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
        console.error("Failed to load selectors", err);
      } finally {
        setLoadingRelations(false);
      }
    };
    fetchRelations();
  }, []);

  // Sync Form Handler
  const setField = <K extends keyof InvoiceFormData>(key: K, val: InvoiceFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // Item list handlers
  const handleItemChange = (idx: number, key: keyof Omit<InvoiceItem, "amount">, val: string | number) => {
    setForm((prev) => {
      const items = [...prev.items];
      const quantity = key === "quantity" ? Number(val) : items[idx].quantity;
      const rate = key === "rate" ? Number(val) : items[idx].rate;
      const description = key === "description" ? String(val) : items[idx].description;

      items[idx] = {
        description,
        quantity,
        rate,
        amount: Number((quantity * rate).toFixed(2)),
      };
      return { ...prev, items };
    });
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  };

  const removeItemRow = (idx: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // Math totals calculation (live preview)
  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = form.discount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (form.taxRate / 100);
  const total = taxableAmount + taxAmount;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }
    if (form.items.some((it) => !it.description.trim() || it.rate <= 0)) {
      setError("Please fill in descriptions and rates for all line items.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: "sent" as InvoiceStatus, // defaults to sent when created
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard/invoices");
      } else {
        setError(data.error || "Failed to create invoice.");
      }
    } catch (err) {
      setError("Failed to communicate with invoice API.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selectedClient = clients.find((c) => c._id === form.clientId);
  const selectedProject = projects.find((p) => p._id === form.projectId);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/dashboard/invoices"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px", transition: "color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14} /> Back
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={13} color="var(--color-brand)" />
          </div>
          <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Create Invoice</h1>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/invoices")} disabled={saving} style={{ marginRight: "8px" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="sm"
          disabled={saving || loadingRelations}
          leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
        >
          {saving ? "Saving..." : "Send Invoice"}
        </Button>
      </header>

      {/* Grid container */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        
        {/* Left Side: Form pane */}
        <div style={{ overflowY: "auto", borderRight: "0.5px solid var(--border)", padding: "28px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {error && (
              <div className="error-banner" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)", padding: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--error)", fontSize: "13px" }}>
                <AlertTriangle size={15} /> {error}
              </div>
            )}

            {/* General Info */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 className="font-heading" style={{ fontSize: "14.5px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                General Details
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="invoice-num">Invoice Number *</label>
                  <input
                    id="invoice-num"
                    type="text"
                    required
                    value={form.invoiceNumber}
                    onChange={(e) => setField("invoiceNumber", e.target.value)}
                    className="input-redesign"
                  />
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                    className="input-redesign"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Client & Project selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="client-select">Client *</label>
                  <select
                    id="client-select"
                    required
                    value={form.clientId}
                    onChange={(e) => setField("clientId", e.target.value)}
                    className="input-redesign"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="project-select">Project (Optional)</label>
                  <select
                    id="project-select"
                    value={form.projectId}
                    onChange={(e) => setField("projectId", e.target.value)}
                    className="input-redesign"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="issue-date">Issue Date *</label>
                  <input
                    id="issue-date"
                    type="date"
                    required
                    value={form.issueDate}
                    onChange={(e) => setField("issueDate", e.target.value)}
                    className="input-redesign"
                  />
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="due-date">Due Date *</label>
                  <input
                    id="due-date"
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setField("dueDate", e.target.value)}
                    className="input-redesign"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Editor */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <h3 className="font-heading" style={{ fontSize: "14.5px" }}>Line Items</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addItemRow} leftIcon={<Plus size={12} />}>
                  Add Item
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.25fr 0.5fr", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Item description..."
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="input-redesign"
                      style={{ fontSize: "13px" }}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="input-redesign"
                      style={{ textAlign: "center", fontSize: "13px" }}
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      min={0}
                      required
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      className="input-redesign"
                      style={{ textAlign: "right", fontSize: "13px" }}
                    />
                    <button
                      type="button"
                      disabled={form.items.length <= 1}
                      onClick={() => removeItemRow(idx)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: form.items.length <= 1 ? "not-allowed" : "pointer", color: "var(--color-danger)", opacity: form.items.length <= 1 ? 0.4 : 1 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial breakdown Adjustments */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 className="font-heading" style={{ fontSize: "14.5px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                Taxes &amp; Discounts
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="discount">Flat Discount ({form.currency === "INR" ? "₹" : "$"})</label>
                  <input
                    id="discount"
                    type="number"
                    min={0}
                    value={form.discount}
                    onChange={(e) => setField("discount", Number(e.target.value))}
                    className="input-redesign"
                  />
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="tax-rate">Tax Rate (%)</label>
                  <input
                    id="tax-rate"
                    type="number"
                    min={0}
                    value={form.taxRate}
                    onChange={(e) => setField("taxRate", Number(e.target.value))}
                    className="input-redesign"
                  />
                </div>
              </div>
            </div>

            {/* Notes & payment terms */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 className="font-heading" style={{ fontSize: "14.5px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                Additional Notes
              </h3>

              <div className="form-group-redesign">
                <label className="label-redesign" htmlFor="payment-terms">Payment Terms</label>
                <input
                  id="payment-terms"
                  type="text"
                  value={form.paymentTerms}
                  onChange={(e) => setField("paymentTerms", e.target.value)}
                  className="input-redesign"
                />
              </div>

              <div className="form-group-redesign">
                <label className="label-redesign" htmlFor="notes">Notes to Client</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Notes, instructions, details, bank account info..."
                  rows={4}
                  className="textarea-redesign"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Right Side: Live preview pane */}
        <div style={{ background: "var(--surface-2)", overflowY: "auto", padding: "40px", display: "flex", justifyContent: "center" }}>
          
          {/* Invoice Document Box */}
          <div style={{ width: "100%", maxWidth: "600px", minHeight: "780px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "40px", display: "flex", flexDirection: "column", gap: "28px", boxShadow: "var(--shadow-lg)" }}>
            
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={14} color="var(--color-on-brand)" fill="var(--color-on-brand)" />
                  </div>
                  <span className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                    Freel<span style={{ color: "var(--color-brand)" }}>Ai</span>
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sender: {session?.user?.name || "Freelancer"}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Email: {session?.user?.email || "billing@freelai.co"}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <h2 className="font-heading" style={{ fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.015em" }}>INVOICE</h2>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "4px" }}>{form.invoiceNumber || "—"}</p>
              </div>
            </div>

            {/* Recipient Details & Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "18px" }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>Billed To</p>
                {selectedClient ? (
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{selectedClient.name}</p>
                    {selectedClient.company && (
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}><Building size={11} style={{ display: "inline", marginRight: "4px" }} />{selectedClient.company}</p>
                    )}
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>{selectedClient.email}</p>
                  </div>
                ) : (
                  <p style={{ fontSize: "12px", color: "var(--text-subtle)", fontStyle: "italic" }}>No client selected</p>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
                  <p style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Date:</span> {fmtDate(form.issueDate)}</p>
                  <p style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Due:</span> {fmtDate(form.dueDate)}</p>
                  {selectedProject && (
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}><span style={{ color: "var(--text-muted)" }}>Project:</span> {selectedProject.title}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ borderTop: "1.5px solid var(--border-subtle)", paddingTop: "18px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                    <th style={{ textAlign: "left", paddingBottom: "8px" }}>Item Description</th>
                    <th style={{ textAlign: "center", paddingBottom: "8px", width: "60px" }}>Qty</th>
                    <th style={{ textAlign: "right", paddingBottom: "8px", width: "100px" }}>Rate</th>
                    <th style={{ textAlign: "right", paddingBottom: "8px", width: "100px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 0", color: "var(--text-primary)" }}>{item.description || <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>Empty description</span>}</td>
                      <td style={{ padding: "10px 0", textAlign: "center", color: "var(--text-secondary)" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(item.rate, form.currency)}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(item.quantity * item.rate, form.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary math calculations */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "18px" }}>
              <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{formatCurrency(subtotal, form.currency)}</span>
                </div>
                {form.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Discount</span>
                    <span style={{ color: "var(--error)", fontWeight: 600 }}>-{formatCurrency(discountAmount, form.currency)}</span>
                  </div>
                )}
                {form.taxRate > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Tax ({form.taxRate}%)</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{formatCurrency(taxAmount, form.currency)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "8px", marginTop: "4px", fontSize: "14px", fontWeight: 800 }}>
                  <span style={{ color: "var(--text-primary)" }}>Total Due</span>
                  <span style={{ color: "var(--color-brand)" }}>{formatCurrency(total, form.currency)}</span>
                </div>
              </div>
            </div>

            {/* Footer conditions info */}
            {(form.notes || form.paymentTerms) && (
              <div style={{ marginTop: "auto", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "18px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {form.paymentTerms && (
                  <p style={{ color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-muted)" }}>Terms:</strong> {form.paymentTerms}</p>
                )}
                {form.notes && (
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--text-muted)", marginBottom: "3px" }}>Notes</p>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{form.notes}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
