"use client";

import React from "react";
import Link from "next/link";

export const DashboardFooter: React.FC = () => {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        paddingTop: "20px",
        paddingBottom: "10px",
        borderTop: "1px solid var(--border)",
        marginTop: "12px",
      }}
    >
      {/* Left: Brand & Copyright */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <img
            src="/logo.png"
            alt="FreeLAI Logo"
            style={{
              width: "22px",
              height: "22px",
              objectFit: "contain",
            }}
          />
          <img
            src="/wordmark.png"
            alt="FreeLAI"
            style={{
              height: "14px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Link>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} FreeLAI. All rights reserved.
        </span>
      </div>

      {/* Right: Live System Status Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: "11px",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
          <span>Database</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
          <span>AI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
          <span>Sync</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
          <span>All systems operational</span>
        </div>
      </div>
    </footer>
  );
};
