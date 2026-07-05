"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface ProposalFeedbackProps {
  proposalId: string;
  versionIndex?: number;
}

export function ProposalFeedback({ proposalId, versionIndex = 0 }: ProposalFeedbackProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(false);

  const vote = async (direction: "up" | "down") => {
    if (voted || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/proposals/${proposalId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: direction === "up" ? 1 : -1, versionIndex }),
      });
      setVoted(direction);
      toast.success(direction === "up" ? "Thanks for the feedback!" : "Got it — we'll improve this.");
    } catch {
      toast.error("Couldn't save feedback");
    }
    setLoading(false);
  };

  if (voted) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "var(--color-success-bg)", border: "0.5px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", fontSize: "12.5px", color: "var(--color-success)" }}>
        {voted === "up" ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Was this proposal useful?</span>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => vote("up")}
          disabled={loading}
          aria-label="Mark proposal as useful"
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "var(--radius)",
            background: "var(--surface-2)", border: "0.5px solid var(--border-strong)",
            cursor: "pointer", fontSize: "12px", color: "var(--text-secondary)",
            transition: "all var(--dur-fast)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-success-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--color-success)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          <ThumbsUp size={13} />
          <span>Yes</span>
        </button>
        <button
          onClick={() => vote("down")}
          disabled={loading}
          aria-label="Mark proposal as not useful"
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "var(--radius)",
            background: "var(--surface-2)", border: "0.5px solid var(--border-strong)",
            cursor: "pointer", fontSize: "12px", color: "var(--text-secondary)",
            transition: "all var(--dur-fast)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-danger-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--color-danger)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          <ThumbsDown size={13} />
          <span>No</span>
        </button>
      </div>
    </div>
  );
}

export default ProposalFeedback;
