"use client";

import type { IProposalIntelligence } from "@/lib/proposal-intelligence";
import { ProposalScoreRing } from "./ProposalScoreRing";

interface SuccessPredictionCardProps {
  successPrediction: IProposalIntelligence["successPrediction"];
}

const FACTOR_LABELS: Record<string, string> = {
  personalization: "Personalization",
  callToAction: "Call to Action",
  pricingClarity: "Pricing Clarity",
  clientFocus: "Client Focus",
  completeness: "Completeness",
  toneMatch: "Tone Match",
  keywordCoverage: "Keyword Coverage",
  winChecklistScore: "Win Checklist",
};

export function SuccessPredictionCard({ successPrediction }: SuccessPredictionCardProps) {
  const { probability, explanation, factors } = successPrediction;

  const color =
    probability >= 80
      ? "var(--color-success)"
      : probability >= 60
      ? "var(--color-brand)"
      : "var(--color-danger)";

  const label =
    probability >= 85 ? "High probability" : probability >= 65 ? "Good chance" : probability >= 45 ? "Moderate" : "Needs work";

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
          Success Prediction
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color,
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            background: probability >= 80 ? "var(--color-success-bg)" : probability >= 60 ? "var(--color-brand-subtle)" : "var(--color-danger-bg)",
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Score ring */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <ProposalScoreRing score={probability} size={100} label="Win Probability" />
        </div>

        {/* Explanation */}
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            margin: "0 0 14px",
          }}
        >
          {explanation}
        </p>

        {/* Factor bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(factors).map(([key, value]) => {
            const label = FACTOR_LABELS[key] ?? key;
            const barColor =
              value >= 80 ? "var(--color-success)" : value >= 60 ? "var(--color-brand)" : "var(--color-danger)";

            return (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: "11px", color: barColor, fontWeight: 700 }}>
                    {value}%
                  </span>
                </div>
                <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${value}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: "999px",
                      transition: "width 0.5s var(--ease-spring)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
