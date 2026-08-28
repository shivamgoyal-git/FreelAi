"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Invoice } from "@/types/invoice";

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onPaymentSuccess: () => void;
  previewClientId?: string | null;
}

export function InvoicePaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
  previewClientId,
}: InvoicePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "bank">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [upiId, setUpiId] = useState("client@oksbi");

  if (!isOpen || !invoice) return null;

  const dueAmount = invoice.remainingAmount ?? (invoice.total - (invoice.amountPaid || 0));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setError("");

      const transactionRef = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const res = await fetch(`/api/portal/invoices/${invoice._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          transactionRef,
          previewClientId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 1800);
      } else {
        setError(data.error || "Payment processing failed");
      }
    } catch (err: any) {
      setError(err.message || "Payment processing error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "14px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
          animation: "scaleUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-graphite, #23252a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-obsidian, #161718)",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-pulse-green, #27a644)", textTransform: "uppercase" }}>
              Secure Checkout
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-paper, #ffffff)", margin: "2px 0 0" }}>
              Pay Invoice #{invoice.invoiceNumber}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={processing}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-fog, #8a8f98)",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(39, 166, 68, 0.15)",
                border: "2px solid var(--color-pulse-green, #27a644)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--color-pulse-green, #27a644)",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-paper)", marginBottom: "6px" }}>
              Payment Successful!
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--color-fog)", maxWidth: "300px", margin: "0 auto" }}>
              {invoice.currency || "INR"} {dueAmount.toLocaleString()} has been paid. Your invoice is now marked as Paid.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} style={{ padding: "24px" }}>
            {/* Amount Summary */}
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                background: "var(--color-obsidian, #161718)",
                border: "1px solid var(--color-graphite, #23252a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "var(--color-fog)" }}>Total to pay</span>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-paper)" }}>
                  {invoice.currency || "INR"} {dueAmount.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "var(--color-pulse-green, #27a644)",
                }}
              >
                <ShieldCheck size={14} />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: "12.5px",
                  marginBottom: "16px",
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12.5px", color: "var(--color-bone)", marginBottom: "8px", fontWeight: 500 }}>
                Select Payment Method
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "upi", label: "UPI", icon: QrCode },
                  { id: "bank", label: "Bank Transfer", icon: Building2 },
                ].map((m) => {
                  const active = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "8px",
                        background: active ? "rgba(39, 166, 68, 0.12)" : "var(--color-obsidian, #161718)",
                        border: active ? "1px solid var(--color-pulse-green, #27a644)" : "1px solid var(--color-graphite, #23252a)",
                        color: active ? "var(--color-pulse-green, #27a644)" : "var(--color-fog, #8a8f98)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: active ? 600 : 500,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={16} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--color-fog)", marginBottom: "4px" }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--color-obsidian)",
                      border: "1px solid var(--color-graphite)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "var(--color-paper)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--color-fog)", marginBottom: "4px" }}>
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--color-obsidian)",
                        border: "1px solid var(--color-graphite)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "var(--color-paper)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--color-fog)", marginBottom: "4px" }}>
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--color-obsidian)",
                        border: "1px solid var(--color-graphite)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "var(--color-paper)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--color-fog)", marginBottom: "4px" }}>
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  style={{
                    width: "100%",
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-graphite)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "var(--color-paper)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {paymentMethod === "bank" && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "var(--color-obsidian)",
                  border: "1px solid var(--color-graphite)",
                  fontSize: "12.5px",
                  color: "var(--color-bone)",
                  marginBottom: "20px",
                  lineHeight: 1.5,
                }}
              >
                Instant NetBanking authorization through your registered bank account will process upon confirmation.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={processing}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={processing}
                style={{ minWidth: "160px" }}
              >
                {processing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ${invoice.currency || "INR"} ${dueAmount.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
