"use client";

import React from "react";

interface DailyBriefingProps {
  items: string[];
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({ items }) => {
  const displayItems = items && items.length > 0 ? items : [
    "2 proposals drafted",
    "3 pending invoices",
    "1 project due this week",
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Today
        </span>
        {displayItems.slice(0, 3).map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--color-brand)", fontSize: "10px" }}>•</span>
            <span style={{ color: "var(--text-secondary)" }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-brand)" }} />
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Synced</span>
      </div>
    </div>
  );
};
