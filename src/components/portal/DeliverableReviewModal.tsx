"use client";

import React, { useState } from "react";
import { X, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeliverableReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverableTitle: string;
  deliverableVersion: string;
  onSubmit: (feedback: string) => Promise<void>;
}

export function DeliverableReviewModal({
  isOpen,
  onClose,
  deliverableTitle,
  deliverableVersion,
  onSubmit,
}: DeliverableReviewModalProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Please explain the changes you'd like to see.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit(feedback.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
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
          maxWidth: "520px",
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "14px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7)",
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(234, 179, 8, 0.12)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={17} style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--color-paper, #ffffff)",
                  margin: 0,
                }}
              >
                Request Changes
              </h3>
              <span style={{ fontSize: "12px", color: "var(--color-fog, #8a8f98)" }}>
                {deliverableTitle} ({deliverableVersion})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-fog, #8a8f98)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
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
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-bone, #e5e5e6)",
              marginBottom: "8px",
            }}
          >
            What revisions would you like your freelancer to make?
          </label>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Please increase the CTA button size and adjust the header contrast..."
            rows={5}
            disabled={loading}
            style={{
              width: "100%",
              background: "var(--color-obsidian, #161718)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13.5px",
              color: "var(--color-paper, #ffffff)",
              outline: "none",
              resize: "vertical",
              marginBottom: "20px",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !feedback.trim()}
              style={{ minWidth: "140px" }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
