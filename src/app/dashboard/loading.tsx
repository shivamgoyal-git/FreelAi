"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", height: "100%" }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Skeleton style={{ width: "240px", height: "32px" }} />
          <Skeleton style={{ width: "400px", height: "16px" }} />
        </div>
        <Skeleton style={{ width: "120px", height: "36px", borderRadius: "var(--radius)" }} />
      </div>

      {/* Grid: 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton style={{ width: "100px", height: "14px" }} />
              <Skeleton style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
            </div>
            <Skeleton style={{ width: "140px", height: "28px" }} />
            <Skeleton style={{ width: "160px", height: "12px" }} />
          </div>
        ))}
      </div>

      {/* Grid: Main Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", alignItems: "start" }}>
        {/* Left Side Skeleton Box */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            minHeight: "340px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton style={{ width: "180px", height: "20px" }} />
            <Skeleton style={{ width: "60px", height: "14px" }} />
          </div>
          <Skeleton style={{ width: "100%", height: "220px" }} />
        </div>

        {/* Right Side Skeleton Box */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            minHeight: "340px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton style={{ width: "180px", height: "20px" }} />
            <Skeleton style={{ width: "60px", height: "14px" }} />
          </div>
          <Skeleton style={{ width: "100%", height: "220px" }} />
        </div>
      </div>
    </div>
  );
}
