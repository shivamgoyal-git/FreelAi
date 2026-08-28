"use client";

import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  MessageSquare,
  Eye,
  Check,
  FileCode,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeliverableReviewModal } from "./DeliverableReviewModal";
import type { Deliverable } from "@/types/portal";

interface DeliverableCardProps {
  deliverable: Deliverable;
  onApprove: (id: string) => Promise<void>;
  onRequestChanges: (id: string, feedback: string) => Promise<void>;
}

export function DeliverableCard({
  deliverable,
  onApprove,
  onRequestChanges,
}: DeliverableCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const getStatusBadge = () => {
    switch (deliverable.status) {
      case "approved":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(39, 166, 68, 0.15)",
              color: "var(--color-pulse-green, #27a644)",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case "changes_requested":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(234, 179, 8, 0.15)",
              color: "#fbbf24",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={12} />
            Changes Requested
          </span>
        );
      case "pending_review":
      default:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <Clock size={12} />
            Awaiting Approval
          </span>
        );
    }
  };

  const handleApproveClick = async () => {
    try {
      setApproving(true);
      await onApprove(deliverable._id);
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: "var(--color-carbon, #0f1011)",
          border:
            deliverable.status === "pending_review"
              ? "1px solid rgba(39, 166, 68, 0.3)"
              : "1px solid var(--color-graphite, #23252a)",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          transition: "all 0.15s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "var(--color-obsidian, #161718)",
                border: "1px solid var(--color-graphite, #23252a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-pulse-green, #27a644)",
              }}
            >
              <FileCheck size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 600,
                    color: "var(--color-paper, #ffffff)",
                    margin: 0,
                  }}
                >
                  {deliverable.title}
                </h4>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    background: "var(--color-obsidian, #161718)",
                    border: "1px solid var(--color-graphite, #23252a)",
                    color: "var(--color-fog, #8a8f98)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {deliverable.version}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-fog, #8a8f98)",
                }}
              >
                Uploaded {new Date(deliverable.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Description */}
        {deliverable.description && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-bone, #e5e5e6)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {deliverable.description}
          </p>
        )}

        {/* Feedback block if changes were requested */}
        {deliverable.status === "changes_requested" && deliverable.clientFeedback && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(234, 179, 8, 0.08)",
              border: "1px solid rgba(234, 179, 8, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#fbbf24",
              }}
            >
              <MessageSquare size={13} />
              <span>Feedback Submitted</span>
            </div>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--color-bone, #e5e5e6)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              &quot;{deliverable.clientFeedback}&quot;
            </p>
          </div>
        )}

        {/* Approval info if approved */}
        {deliverable.status === "approved" && deliverable.approvedDate && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--color-pulse-green, #27a644)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Check size={14} />
            <span>
              Approved on {new Date(deliverable.approvedDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid var(--color-graphite, #23252a)",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {deliverable.externalUrl ? (
              <a
                href={deliverable.externalUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <ExternalLink size={13} />
                  <span>Preview Link</span>
                </Button>
              </a>
            ) : deliverable.fileUrl ? (
              <a
                href={deliverable.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={13} />
                  <span>Download File</span>
                </Button>
              </a>
            ) : null}
          </div>

          {deliverable.status === "pending_review" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(true)}
                disabled={approving}
              >
                Request Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveClick}
                disabled={approving}
                style={{ minWidth: "120px" }}
              >
                <Check size={14} style={{ marginRight: "4px" }} />
                {approving ? "Approving..." : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeliverableReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        deliverableTitle={deliverable.title}
        deliverableVersion={deliverable.version}
        onSubmit={async (feedback) => {
          await onRequestChanges(deliverable._id, feedback);
        }}
      />
    </>
  );
}
