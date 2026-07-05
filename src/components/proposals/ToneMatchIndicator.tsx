"use client";

import type { IProposalIntelligence } from "@/lib/proposal-intelligence";

interface ToneMatchIndicatorProps {
  toneMatch: IProposalIntelligence["toneMatch"];
}

export function ToneMatchIndicator({ toneMatch }: ToneMatchIndicatorProps) {
  const { clientTone, proposalTone, score, suggestion } = toneMatch;

  const scoreColor =
    score >= 75 ? "var(--color-success)" : score >= 50 ? "var(--color-brand)" : "var(--color-danger)";

  const label =
    score >= 80 ? "Excellent match" : score >= 60 ? "Good match" : score >= 40 ? "Partial match" : "Mismatch";

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
          Tone Match
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 800,
            color: scoreColor,
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            background:
              score >= 75
                ? "var(--color-success-bg)"
                : score >= 50
                ? "var(--color-brand-subtle)"
                : "var(--color-danger-bg)",
          }}
        >
          {score}% — {label}
        </span>
      </div>

      {/* Two-bar comparison */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Client tone */}
        <ToneBar label="Client Tone" value={clientTone} color="var(--color-accent)" pct={65} />
        {/* Proposal tone */}
        <ToneBar label="Your Tone" value={proposalTone} color="var(--color-brand)" pct={score} />
      </div>

      {/* Overall match bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Overlap
          </span>
          <span style={{ fontSize: "10px", color: scoreColor, fontWeight: 700 }}>{score}%</span>
        </div>
        <div style={{ height: "5px", background: "var(--surface-3)", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: scoreColor,
              borderRadius: "999px",
              transition: "width 0.5s var(--ease-spring)",
            }}
          />
        </div>
      </div>

      {/* Suggestion */}
      {suggestion && (
        <div
          style={{
            padding: "8px 10px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            borderLeft: "2px solid var(--color-brand)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--color-brand)" }}>Tip: </span>
          {suggestion}
        </div>
      )}
    </div>
  );
}

function ToneBar({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontSize: "11px", color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: "999px",
            opacity: 0.7,
            transition: "width 0.5s var(--ease-spring)",
          }}
        />
      </div>
    </div>
  );
}
