"use client";

import React from "react";

export function LoadingSkeleton({
  height = "20px",
  width = "100%",
  borderRadius = "6px",
  style = {},
}: {
  height?: string;
  width?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="portal-skeleton"
      style={{
        height,
        width,
        borderRadius,
        background: "linear-gradient(90deg, #161718 25%, #23252a 50%, #161718 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <LoadingSkeleton width="240px" height="32px" style={{ marginBottom: "8px" }} />
          <LoadingSkeleton width="360px" height="18px" />
        </div>
      </div>
      <LoadingSkeleton height="80px" borderRadius="12px" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <LoadingSkeleton height="100px" borderRadius="12px" />
        <LoadingSkeleton height="100px" borderRadius="12px" />
        <LoadingSkeleton height="100px" borderRadius="12px" />
        <LoadingSkeleton height="100px" borderRadius="12px" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <LoadingSkeleton height="320px" borderRadius="12px" />
        <LoadingSkeleton height="320px" borderRadius="12px" />
      </div>
    </div>
  );
}
