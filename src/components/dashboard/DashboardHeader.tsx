"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, DollarSign, Plus } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const firstName = userName ? userName.split(" ")[0] : "Shivam";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        paddingBottom: "2px",
      }}
    >
      <div>
        <h1
          className="font-heading"
          style={{
            fontSize: "22px",
            fontWeight: 650,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Welcome back, <span style={{ color: "var(--color-brand)" }}>{firstName}!</span> 👋
        </h1>
        <p
          style={{
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            marginTop: "3px",
            margin: 0,
          }}
        >
          Here&apos;s what&apos;s happening with your freelance business today.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Link href="/dashboard/proposals" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "6px",
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.12s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <Sparkles size={12} style={{ color: "var(--text-muted)" }} />
            Proposal
          </button>
        </Link>

        <Link href="/dashboard/invoices" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "6px",
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.12s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <DollarSign size={12} style={{ color: "var(--text-muted)" }} />
            Invoice
          </button>
        </Link>

        <Link href="/dashboard/projects" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              background: "var(--color-brand)",
              color: "var(--color-on-brand)",
              border: "none",
              cursor: "pointer",
              transition: "filter 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            <Plus size={13} strokeWidth={2.5} />
            New Project
          </button>
        </Link>
      </div>
    </div>
  );
};
