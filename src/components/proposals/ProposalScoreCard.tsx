"use client";

import { ConfidenceBar } from "./ConfidenceBar";
import type { IScoredField } from "@/lib/proposal-intelligence";

interface ProposalScoreCardProps {
  label: string;
  field: IScoredField;
  showConfidence?: boolean;
  compact?: boolean;
}

const LABEL_MAP: Record<string, string> = {
  professionalism: "Professionalism",
  personalization: "Personalization",
  readability: "Readability",
  confidence: "Confidence",
  structure: "Structure",
  grammar: "Grammar",
  callToAction: "Call to Action",
  valueProp: "Value Proposition",
  clientFocus: "Client Focus",
  pricingClarity: "Pricing Clarity",
  communicationStyle: "Comm. Style",
  completeness: "Completeness",
};

export function ProposalScoreCard({
  label,
  field,
  showConfidence = true,
  compact = false,
}: ProposalScoreCardProps) {
  const { score, reason, confidence } = field;
  const displayLabel = LABEL_MAP[label] ?? label;

  const scoreColor =
    score >= 85 ? "var(--color-success)" : score >= 70 ? "var(--color-brand)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";

  const scoreBg =
    score >= 85
      ? "var(--color-success-bg)"
      : score >= 70
      ? "var(--color-brand-subtle)"
      : score >= 50
      ? "var(--color-warning-bg)"
      : "var(--color-danger-bg)";

  if (compact) {
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "var(--surface-1)",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            minWidth: "40px",
            height: "40px",
            borderRadius: "var(--radius-sm)",
            background: scoreBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span className="font-heading" style={{ fontSize: "14px", color: scoreColor, lineHeight: 1 }}>
            {score}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            {displayLabel}
          </p>
          {showConfidence && <ConfidenceBar confidence={confidence} label="AI conf." />}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {displayLabel}
        </span>
        <span
          className="font-heading"
          style={{
            fontSize: "20px",
            color: scoreColor,
            padding: "2px 10px",
            borderRadius: "var(--radius-pill)",
            background: scoreBg,
          }}
        >
          {score}
        </span>
      </div>

      {/* Score bar */}
      <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: scoreColor,
            borderRadius: "999px",
            transition: "width 0.6s var(--ease-spring)",
          }}
        />
      </div>

      {/* Reason */}
      <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
        {reason}
      </p>

      {/* AI Confidence */}
      {showConfidence && (
        <ConfidenceBar confidence={confidence} label="AI confidence" />
      )}
    </div>
  );
}
