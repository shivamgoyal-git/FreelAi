"use client";

import type { AiRequestMetadata } from "@/lib/ai-core";
import { Zap, Clock, Cpu, DollarSign } from "lucide-react";

interface AiMetadataBadgeProps {
  metadata: AiRequestMetadata;
  compact?: boolean;
}

export function AiMetadataBadge({ metadata, compact = false }: AiMetadataBadgeProps) {
  const { model, responseTimeMs, estimatedInputTokens, estimatedOutputTokens, estimatedCostUsd, cacheHit } =
    metadata;

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 8px",
          borderRadius: "var(--radius-pill)",
          background: cacheHit ? "var(--color-success-bg)" : "var(--color-brand-subtle)",
          border: `0.5px solid ${cacheHit ? "rgba(34,134,58,0.2)" : "rgba(99,102,241,0.2)"}`,
          fontSize: "11px",
          color: cacheHit ? "var(--color-success)" : "var(--color-brand)",
          fontWeight: 600,
        }}
      >
        <Zap size={10} />
        {cacheHit ? "Cached" : `${responseTimeMs}ms`}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        padding: "10px 14px",
        background: "var(--surface-2)",
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--border)",
      }}
    >
      {/* Cache / Model */}
      <MetaBadge
        icon={<Zap size={11} />}
        label="Model"
        value={model}
        color={cacheHit ? "var(--color-success)" : "var(--color-brand)"}
        accent={cacheHit}
      />

      {/* Response time */}
      {!cacheHit && (
        <MetaBadge
          icon={<Clock size={11} />}
          label="Response"
          value={`${responseTimeMs}ms`}
        />
      )}

      {cacheHit && (
        <MetaBadge
          icon={<Clock size={11} />}
          label="Source"
          value="Cache hit — 0ms"
          color="var(--color-success)"
        />
      )}

      {/* Tokens */}
      <MetaBadge
        icon={<Cpu size={11} />}
        label="Tokens"
        value={`${(estimatedInputTokens + estimatedOutputTokens).toLocaleString()} est.`}
      />

      {/* Cost */}
      <MetaBadge
        icon={<DollarSign size={11} />}
        label="Est. cost"
        value={cacheHit ? "$0.000000" : `$${estimatedCostUsd.toFixed(6)}`}
      />
    </div>
  );
}

function MetaBadge({
  icon,
  label,
  value,
  color,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "var(--radius-pill)",
        background: accent ? "var(--color-success-bg)" : "var(--surface-3)",
        border: `0.5px solid ${accent ? "rgba(34,134,58,0.2)" : "var(--border)"}`,
        fontSize: "11px",
      }}
    >
      <span style={{ color: color ?? "var(--text-muted)" }}>{icon}</span>
      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}:</span>
      <span style={{ color: color ?? "var(--text-primary)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
