"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

interface ProfileCompletionCardProps {
  progress: number;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ progress }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || progress >= 100) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "240px" }}>
        <span style={{ fontSize: "12px", fontWeight: 550, color: "var(--text-primary)" }}>
          Profile Setup
        </span>
        <div style={{ flex: 1, maxWidth: "160px", height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--color-brand)" }} />
        </div>
        <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
          {progress}%
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          href="/dashboard/profile"
          style={{
            fontSize: "11.5px",
            fontWeight: 500,
            color: "var(--color-brand)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>Complete profile</span>
          <ArrowRight size={11} />
        </Link>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
