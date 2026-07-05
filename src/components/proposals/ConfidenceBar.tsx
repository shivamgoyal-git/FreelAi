"use client";

interface ConfidenceBarProps {
  confidence: number; // 0–1
  label?: string;
  size?: "sm" | "md";
}

export function ConfidenceBar({ confidence, label, size = "sm" }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 85 ? "var(--color-success)" : pct >= 60 ? "var(--color-brand)" : "var(--color-warning)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          flex: 1,
          height: size === "sm" ? "3px" : "5px",
          background: "var(--surface-3)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: "999px",
            transition: "width 0.5s var(--ease-spring)",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {label} {pct}%
        </span>
      )}
    </div>
  );
}
