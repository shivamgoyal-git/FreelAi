"use client";

import * as React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
};

export function Skeleton({ width, height, rounded, className = "", style, ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "16px",
        borderRadius: rounded ? "var(--radius-pills)" : "var(--radius-inputs)",
        ...style,
      }}
      {...props}
    />
  );
}

// ── Composed variants ─────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: "var(--spacing-20) var(--spacing-24)", display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={32} width="60%" />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "var(--spacing-12) var(--spacing-16)", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)" }}>
        <Skeleton height={12} width="80%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: "var(--spacing-16)", borderBottom: "0.5px solid var(--border)", display: "flex", gap: "var(--spacing-16)", alignItems: "center" }}>
          <Skeleton height={12} width="20%" />
          <Skeleton height={12} width="30%" />
          <Skeleton height={12} width="15%" />
          <Skeleton height={12} width="20%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div className="metric-widget" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
      <Skeleton height={12} width="50%" />
      <Skeleton height={28} width="70%" />
      <Skeleton height={10} width="40%" />
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
          <Skeleton height={12} width="25%" />
          <Skeleton height={38} />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-24)" }}>
      <div className="grid-responsive-4" style={{ gap: "var(--spacing-16)" }}>
        {[1, 2, 3, 4].map((n) => <SkeletonMetric key={n} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}

export function ProposalListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="glass-card" style={{ padding: "var(--spacing-16) var(--spacing-20)", display: "flex", gap: "var(--spacing-16)", alignItems: "center" }}>
          <Skeleton height={36} width={36} rounded />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
            <Skeleton height={13} width="50%" />
            <Skeleton height={11} width="30%" />
          </div>
          <Skeleton height={24} width={60} rounded />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
