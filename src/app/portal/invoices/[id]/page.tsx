"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Receipt,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InvoicePaymentModal } from "@/components/portal/InvoicePaymentModal";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";
import { EmptyState } from "@/components/portal/EmptyState";

function ClientInvoiceDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const url = `/api/portal/invoices/${id}${
        previewClientId ? `?previewClientId=${previewClientId}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const errResult = await res.json();
        setError(errResult.error || "Invoice not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id, previewClientId]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <LoadingSkeleton height="500px" borderRadius="12px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px 0" }}>
        <EmptyState
          icon="alert"
          title="Invoice Unavailable"
          description={error || "You do not have access to view this invoice."}
          actionLabel="Back to Invoices"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const { invoice, client, freelancer } = data;
  const isPaid = invoice.status === "paid";
  const dueAmount = invoice.remainingAmount ?? (invoice.total - (invoice.amountPaid || 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "840px", margin: "0 auto" }}>
      {/* Top Bar Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href={`/portal/invoices${previewClientId ? `?previewClientId=${previewClientId}` : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-fog, #8a8f98)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to Invoices</span>
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </Button>

          {!isPaid && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPaymentModalOpen(true)}
            >
              Pay Now
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div
        id="printable-invoice"
        style={{
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "14px",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Invoice Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid var(--color-graphite, #23252a)",
            paddingBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "var(--color-pulse-green, #27a644)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                F
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }}>
                {freelancer.name}
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--color-fog)", margin: 0 }}>
              {freelancer.email}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--color-paper)",
                margin: "0 0 4px 0",
              }}
            >
              INVOICE
            </h2>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-pulse-green)" }}>
              #{invoice.invoiceNumber}
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: "6px",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                background: isPaid ? "rgba(39, 166, 68, 0.15)" : "rgba(234, 179, 8, 0.15)",
                color: isPaid ? "var(--color-pulse-green)" : "#fbbf24",
              }}
            >
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-fog)", textTransform: "uppercase" }}>
              Billed To
            </span>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-paper)", marginTop: "4px" }}>
              {client.name}
            </div>
            {client.company && (
              <div style={{ fontSize: "13px", color: "var(--color-bone)" }}>{client.company}</div>
            )}
            <div style={{ fontSize: "12.5px", color: "var(--color-fog)" }}>{client.email}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "right" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-fog)" }}>Issue Date</span>
              <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--color-paper)" }}>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-fog)" }}>Due Date</span>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)" }}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-graphite, #23252a)" }}>
                <th style={{ padding: "10px 0", fontSize: "12px", color: "var(--color-fog)", fontWeight: 600 }}>
                  Description
                </th>
                <th style={{ padding: "10px 0", fontSize: "12px", color: "var(--color-fog)", fontWeight: 600, textAlign: "center" }}>
                  Qty
                </th>
                <th style={{ padding: "10px 0", fontSize: "12px", color: "var(--color-fog)", fontWeight: 600, textAlign: "right" }}>
                  Rate
                </th>
                <th style={{ padding: "10px 0", fontSize: "12px", color: "var(--color-fog)", fontWeight: 600, textAlign: "right" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--color-obsidian, #161718)" }}>
                    <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-bone)" }}>
                      {item.description}
                    </td>
                    <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-fog)", textAlign: "center" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-fog)", textAlign: "right" }}>
                      {invoice.currency || "INR"} {item.rate?.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 0", fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", textAlign: "right" }}>
                      {invoice.currency || "INR"} {item.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: "1px solid var(--color-obsidian, #161718)" }}>
                  <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-bone)" }}>
                    Professional Services
                  </td>
                  <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-fog)", textAlign: "center" }}>
                    1
                  </td>
                  <td style={{ padding: "14px 0", fontSize: "13.5px", color: "var(--color-fog)", textAlign: "right" }}>
                    {invoice.currency || "INR"} {invoice.total?.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 0", fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", textAlign: "right" }}>
                    {invoice.currency || "INR"} {invoice.total?.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--color-fog)" }}>
              <span>Subtotal:</span>
              <span style={{ color: "var(--color-bone)" }}>
                {invoice.currency || "INR"} {(invoice.subtotal || invoice.total).toLocaleString()}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--color-fog)" }}>
                <span>Discount:</span>
                <span style={{ color: "#ef4444" }}>
                  -{invoice.currency || "INR"} {invoice.discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--color-fog)" }}>
                <span>Tax ({invoice.taxRate || 0}%):</span>
                <span style={{ color: "var(--color-bone)" }}>
                  +{invoice.currency || "INR"} {invoice.taxAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--color-paper)",
                paddingTop: "8px",
                borderTop: "1px solid var(--color-graphite)",
              }}
            >
              <span>Total:</span>
              <span>
                {invoice.currency || "INR"} {invoice.total?.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                fontWeight: 600,
                color: isPaid ? "var(--color-pulse-green)" : "#fbbf24",
                paddingTop: "4px",
              }}
            >
              <span>{isPaid ? "Paid:" : "Balance Due:"}</span>
              <span>
                {invoice.currency || "INR"} {(isPaid ? invoice.total : dueAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.paymentTerms) && (
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--color-graphite, #23252a)",
              fontSize: "12px",
              color: "var(--color-fog)",
              lineHeight: 1.5,
            }}
          >
            {invoice.paymentTerms && (
              <p style={{ margin: "0 0 6px 0" }}>
                <strong>Payment Terms:</strong> {invoice.paymentTerms}
              </p>
            )}
            {invoice.notes && (
              <p style={{ margin: 0 }}>
                <strong>Notes:</strong> {invoice.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <InvoicePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          invoice={invoice}
          onPaymentSuccess={fetchInvoice}
          previewClientId={previewClientId}
        />
      )}
    </div>
  );
}

export default function ClientInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<LoadingSkeleton height="500px" borderRadius="12px" />}>
      <ClientInvoiceDetailContent id={id} />
    </Suspense>
  );
}
