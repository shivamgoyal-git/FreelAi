"use client";

import { Check, X, Trophy } from "lucide-react";
import type { WinChecklistItem } from "@/lib/proposal-local-analyzer";

interface WinChecklistProps {
  checklist: WinChecklistItem[];
}

export function WinChecklist({ checklist }: WinChecklistProps) {
  const passed = checklist.filter((i) => i.passed).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  const scoreColor =
    pct >= 80 ? "var(--color-success)" : pct >= 60 ? "var(--color-brand)" : "var(--color-danger)";

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
          padding: "10px 14px",
          background: "var(--surface-2)",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Trophy size={13} color="var(--color-brand)" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
            Win Checklist
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {passed}/{total}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: scoreColor,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: pct >= 80 ? "var(--color-success-bg)" : pct >= 60 ? "var(--color-brand-subtle)" : "var(--color-danger-bg)",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: "3px", background: "var(--surface-3)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: scoreColor,
            transition: "width 0.5s var(--ease-spring)",
          }}
        />
      </div>

      {/* Items */}
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column" }}>
        {checklist.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "8px 4px",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            {/* Pass / fail icon */}
            <div style={{ flexShrink: 0, marginTop: "1px" }}>
              {item.passed ? (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--color-success-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={11} color="var(--color-success)" />
                </div>
              ) : (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--color-danger-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={11} color="var(--color-danger)" />
                </div>
              )}
            </div>

            {/* Label + detail */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: item.passed ? "var(--text-primary)" : "var(--text-secondary)",
                  margin: "0 0 1px",
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
