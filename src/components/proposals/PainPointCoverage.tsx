"use client";

import { Check, X } from "lucide-react";
import type { PainPointResult } from "@/lib/proposal-local-analyzer";

interface PainPointCoverageProps {
  painPoints: PainPointResult[];
}

export function PainPointCoverage({ painPoints }: PainPointCoverageProps) {
  const covered = painPoints.filter((p) => p.covered).length;
  const pct = painPoints.length > 0 ? Math.round((covered / painPoints.length) * 100) : 0;

  const coverageColor =
    pct >= 80 ? "var(--color-success)" : pct >= 50 ? "var(--color-brand)" : "var(--color-danger)";

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
          padding: "10px 16px",
          background: "var(--surface-2)",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
          Pain Point Coverage
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 800,
            color: coverageColor,
            background: pct >= 80 ? "var(--color-success-bg)" : pct >= 50 ? "var(--color-brand-subtle)" : "var(--color-danger-bg)",
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "var(--surface-3)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: coverageColor,
            transition: "width 0.5s var(--ease-spring)",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {painPoints.length === 0 ? (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
            No pain points extracted.
          </p>
        ) : (
          painPoints.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "7px 8px",
                borderRadius: "var(--radius-sm)",
                background: item.covered ? "rgba(34,134,58,0.04)" : "rgba(217,48,37,0.04)",
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0, marginTop: "1px" }}>
                {item.covered ? (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-success-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color="var(--color-success)" />
                  </div>
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={11} color="var(--color-danger)" />
                  </div>
                )}
              </div>

              {/* Pain point text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "11.5px",
                    color: item.covered ? "var(--text-primary)" : "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {item.painPoint}
                </p>
                {item.covered && item.foundPhrase && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--color-success)",
                      fontWeight: 600,
                    }}
                  >
                    ✓ via &ldquo;{item.foundPhrase}&rdquo;
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
