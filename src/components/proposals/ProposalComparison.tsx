"use client";

import type { ComparisonMatrix } from "@/lib/proposal-intelligence";
import { Trophy } from "lucide-react";

interface ProposalComparisonProps {
  matrix: ComparisonMatrix;
  intelligences: Array<{
    id: string;
    label: string;
    overallScore: number;
    sectionScores: Record<string, number>;
    successProbability: number;
  }>;
  onSelect?: (id: string) => void;
}

const DIM_LABELS: Record<string, string> = {
  professionalism: "Professionalism",
  personalization: "Personalization",
  readability: "Readability",
  confidence: "Confidence",
  structure: "Structure",
  grammar: "Grammar",
  callToAction: "Call to Action",
  valueProp: "Value Prop",
  clientFocus: "Client Focus",
  pricingClarity: "Pricing Clarity",
  communicationStyle: "Comm. Style",
  completeness: "Completeness",
};

export function ProposalComparison({ matrix, intelligences, onSelect }: ProposalComparisonProps) {
  const dimensions = Object.keys(DIM_LABELS);

  function scoreCell(proposalId: string, dim: string, score: number) {
    const isWinner = matrix.winners[dim] === proposalId;
    return (
      <td
        key={dim + proposalId}
        style={{
          padding: "8px 12px",
          textAlign: "center",
          borderBottom: "0.5px solid var(--border)",
          background: isWinner ? "rgba(34,134,58,0.06)" : "transparent",
          fontSize: "13px",
          fontWeight: isWinner ? 800 : 500,
          color: isWinner ? "var(--color-success)" : score >= 70 ? "var(--text-primary)" : "var(--color-danger)",
          position: "relative",
        }}
      >
        {isWinner && (
          <span style={{ position: "absolute", top: "4px", right: "4px" }}>
            <Trophy size={10} color="var(--color-brand)" />
          </span>
        )}
        {score}
      </td>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Recommendation banner */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-brand-subtle)",
          borderBottom: "0.5px solid rgba(99,102,241,0.2)",
          fontSize: "12.5px",
          color: "var(--text-primary)",
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--color-brand)" }}>AI Recommendation: </span>
        {matrix.recommendation}
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              <th
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  borderBottom: "0.5px solid var(--border)",
                  whiteSpace: "nowrap",
                }}
              >
                Dimension
              </th>
              {intelligences.map((p) => (
                <th
                  key={p.id}
                  style={{
                    padding: "10px 14px",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    borderBottom: "0.5px solid var(--border)",
                    cursor: onSelect ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => onSelect?.(p.id)}
                >
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Overall */}
            <tr style={{ background: "var(--surface-2)" }}>
              <td
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  borderBottom: "0.5px solid var(--border)",
                }}
              >
                Overall Score
              </td>
              {intelligences.map((p) => (
                <td
                  key={p.id}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    borderBottom: "0.5px solid var(--border)",
                    fontSize: "14px",
                    fontWeight: 800,
                    color:
                      p.overallScore === Math.max(...intelligences.map((x) => x.overallScore))
                        ? "var(--color-success)"
                        : "var(--text-primary)",
                  }}
                >
                  {p.overallScore}
                </td>
              ))}
            </tr>

            {/* Dimensions */}
            {dimensions.map((dim) => (
              <tr key={dim}>
                <td
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    borderBottom: "0.5px solid var(--border)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {DIM_LABELS[dim]}
                </td>
                {intelligences.map((p) =>
                  scoreCell(p.id, dim, p.sectionScores[dim] ?? 0)
                )}
              </tr>
            ))}

            {/* Success probability */}
            <tr style={{ background: "var(--surface-2)" }}>
              <td
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Win Probability
              </td>
              {intelligences.map((p) => (
                <td
                  key={p.id}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    color:
                      p.successProbability >= 80
                        ? "var(--color-success)"
                        : p.successProbability >= 60
                        ? "var(--color-brand)"
                        : "var(--color-danger)",
                  }}
                >
                  {p.successProbability}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Select buttons */}
      {onSelect && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 16px",
            borderTop: "0.5px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          {intelligences.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "var(--radius)",
                border: "0.5px solid var(--border-strong)",
                background: "var(--surface-1)",
                color: "var(--text-primary)",
                cursor: "pointer",
                transition: "background var(--dur-fast)",
              }}
            >
              Use {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
