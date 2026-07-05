"use client";

import type { IProposalIntelligence } from "@/lib/proposal-intelligence";
import { ArrowUp } from "lucide-react";

interface ProposalSuggestionsProps {
  improvements: IProposalIntelligence["improvements"];
}

const PRIORITY_CONFIG = {
  high: { color: "var(--color-danger)", bg: "var(--color-danger-bg)", label: "High Priority" },
  medium: { color: "var(--color-brand)", bg: "var(--color-brand-subtle)", label: "Medium" },
  low: { color: "var(--color-success)", bg: "var(--color-success-bg)", label: "Low" },
};

export function ProposalSuggestions({ improvements }: ProposalSuggestionsProps) {
  const sorted = [...improvements].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sorted.map((item, i) => {
        const cfg = PRIORITY_CONFIG[item.priority];
        return (
          <div
            key={i}
            style={{
              padding: "14px 16px",
              background: "var(--surface-1)",
              border: `0.5px solid var(--border)`,
              borderLeft: `3px solid ${cfg.color}`,
              borderRadius: "var(--radius)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Priority badge + suggestion */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", flexShrink: 0 }}>
                <ArrowUp size={14} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-pill)",
                      background: cfg.bg,
                      color: cfg.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600, margin: 0, lineHeight: 1.45 }}>
                  {item.suggestion}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div
              style={{
                padding: "8px 10px",
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text-muted)", marginRight: "4px" }}>WHY:</span>
              {item.reason}
            </div>
          </div>
        );
      })}
    </div>
  );
}
