"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/portal/EmptyState";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";
import { InvoicePaymentModal } from "@/components/portal/InvoicePaymentModal";

function ClientInvoicesContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const url = `/api/portal/invoices?status=${filter}${
        previewClientId ? `&previewClientId=${previewClientId}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filter, previewClientId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-paper, #ffffff)",
            letterSpacing: "-0.5px",
            margin: "0 0 4px 0",
          }}
        >
          Invoices & Payments
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          View, download, and securely pay your project invoices.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { id: "all", label: "All Invoices" },
          { id: "sent", label: "Pending" },
          { id: "paid", label: "Paid" },
          { id: "overdue", label: "Overdue" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: filter === tab.id ? 600 : 500,
              background:
                filter === tab.id
                  ? "var(--color-obsidian, #161718)"
                  : "transparent",
              border:
                filter === tab.id
                  ? "1px solid var(--color-graphite, #23252a)"
                  : "1px solid transparent",
              color:
                filter === tab.id
                  ? "var(--color-pulse-green, #27a644)"
                  : "var(--color-fog, #8a8f98)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <LoadingSkeleton height="80px" borderRadius="12px" />
          <LoadingSkeleton height="80px" borderRadius="12px" />
          <LoadingSkeleton height="80px" borderRadius="12px" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="file"
          title="No invoices found"
          description="There are no invoices matching your selected filter."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {invoices.map((inv) => {
            const isPaid = inv.status === "paid";
            const isPending =
              inv.status === "sent" || inv.status === "partially_paid" || inv.status === "overdue";
            const isOverdue = inv.status === "overdue";

            return (
              <div
                key={inv._id}
                style={{
                  background: "var(--color-carbon, #0f1011)",
                  border: isOverdue
                    ? "1px solid rgba(239, 68, 68, 0.4)"
                    : isPending
                    ? "1px solid rgba(234, 179, 8, 0.3)"
                    : "1px solid var(--color-graphite, #23252a)",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--color-obsidian, #161718)",
                      border: "1px solid var(--color-graphite, #23252a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isPaid
                        ? "var(--color-pulse-green, #27a644)"
                        : isOverdue
                        ? "#ef4444"
                        : "#fbbf24",
                    }}
                  >
                    <Receipt size={18} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--color-paper, #ffffff)",
                          margin: 0,
                        }}
                      >
                        Invoice #{inv.invoiceNumber}
                      </h3>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: isPaid
                            ? "rgba(39, 166, 68, 0.15)"
                            : isOverdue
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(234, 179, 8, 0.15)",
                          color: isPaid
                            ? "var(--color-pulse-green, #27a644)"
                            : isOverdue
                            ? "#ef4444"
                            : "#fbbf24",
                        }}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "12.5px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
                      {inv.projectId?.title || "Direct Invoice"} • Due{" "}
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-ash, #62666d)", display: "block" }}>
                      {isPaid ? "Total Paid" : "Amount Due"}
                    </span>
                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: isPaid
                          ? "var(--color-pulse-green, #27a644)"
                          : "var(--color-paper, #ffffff)",
                      }}
                    >
                      {inv.currency || "INR"}{" "}
                      {(inv.remainingAmount ?? inv.total).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      href={`/portal/invoices/${inv._id}${
                        previewClientId ? `?previewClientId=${previewClientId}` : ""
                      }`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </Link>

                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Sheet */}
      {selectedInvoice && (
        <InvoicePaymentModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          onPaymentSuccess={fetchInvoices}
          previewClientId={previewClientId}
        />
      )}
    </div>
  );
}

export default function ClientInvoicesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="80px" borderRadius="12px" />}>
      <ClientInvoicesContent />
    </Suspense>
  );
}
