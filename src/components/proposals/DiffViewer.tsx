"use client";

import type { IDiffChunk } from "@/lib/proposal-intelligence";

interface DiffViewerProps {
  diff: IDiffChunk[];
  mode?: "inline" | "side-by-side";
  maxHeight?: number;
}

export function DiffViewer({ diff, mode = "inline", maxHeight = 400 }: DiffViewerProps) {
  if (!diff || diff.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
          background: "var(--surface-2)",
          borderRadius: "var(--radius)",
        }}
      >
        No changes to display.
      </div>
    );
  }

  if (mode === "side-by-side") {
    return <SideBySideDiff diff={diff} maxHeight={maxHeight} />;
  }

  return <InlineDiff diff={diff} maxHeight={maxHeight} />;
}

function InlineDiff({ diff, maxHeight }: { diff: IDiffChunk[]; maxHeight: number }) {
  return (
    <div
      style={{
        maxHeight,
        overflowY: "auto",
        padding: "14px 16px",
        background: "var(--surface-2)",
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--border)",
        fontSize: "13px",
        lineHeight: 1.65,
        fontFamily: "var(--font-sans)",
      }}
    >
      {diff.map((chunk, i) => {
        if (chunk.type === "equal") {
          return (
            <span key={i} style={{ color: "var(--text-secondary)" }}>
              {chunk.value}
            </span>
          );
        }
        if (chunk.type === "insert") {
          return (
            <span
              key={i}
              style={{
                color: "var(--color-success)",
                background: "rgba(34,134,58,0.12)",
                borderRadius: "2px",
                padding: "0 2px",
                textDecoration: "underline",
                textDecorationColor: "rgba(34,134,58,0.4)",
              }}
            >
              {chunk.value}
            </span>
          );
        }
        // delete
        return (
          <span
            key={i}
            style={{
              color: "var(--color-danger)",
              background: "rgba(217,48,37,0.1)",
              borderRadius: "2px",
              padding: "0 2px",
              textDecoration: "line-through",
              textDecorationColor: "rgba(217,48,37,0.5)",
            }}
          >
            {chunk.value}
          </span>
        );
      })}
    </div>
  );
}

function SideBySideDiff({ diff, maxHeight }: { diff: IDiffChunk[]; maxHeight: number }) {
  // Build original and revised strings
  const original = diff
    .filter((c) => c.type !== "insert")
    .map((c) => c.value)
    .join("");

  const revised = diff
    .filter((c) => c.type !== "delete")
    .map((c) => c.value)
    .join("");

  const panelStyle: React.CSSProperties = {
    flex: 1,
    maxHeight,
    overflowY: "auto",
    padding: "12px 14px",
    background: "var(--surface-2)",
    borderRadius: "var(--radius)",
    border: "0.5px solid var(--border)",
    fontSize: "12.5px",
    lineHeight: 1.6,
    fontFamily: "var(--font-sans)",
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-danger)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          — Original
        </div>
        <div style={panelStyle}>{original}</div>
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-success)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          + Optimized
        </div>
        <div style={{ ...panelStyle, color: "var(--text-primary)" }}>{revised}</div>
      </div>
    </div>
  );
}
