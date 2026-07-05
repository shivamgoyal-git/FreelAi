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
        borderRadius: rounded ? "9999px" : "var(--radius)",
        ...style,
      }}
      {...props}
    />
  );
}

// ── Composed variants ─────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={32} width="60%" />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-0)" }}>
        <Skeleton height={12} width="80%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: "16px", alignItems: "center" }}>
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
    <div className="metric-widget" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Skeleton height={12} width="50%" />
      <Skeleton height={28} width="70%" />
      <Skeleton height={10} width="40%" />
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton height={12} width="25%" />
          <Skeleton height={38} />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="grid-responsive-4" style={{ gap: "16px" }}>
        {[1, 2, 3, 4].map((n) => <SkeletonMetric key={n} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}

export function ProposalListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "16px", alignItems: "center" }}>
          <Skeleton height={36} width={36} rounded />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <Skeleton height={13} width="50%" />
            <Skeleton height={11} width="30%" />
          </div>
          <Skeleton height={24} width={60} rounded />
        </div>
      ))}
    </div>
  );
}
