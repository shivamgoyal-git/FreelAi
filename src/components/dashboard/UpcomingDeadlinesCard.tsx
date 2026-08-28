"use client";

import React from "react";
import Link from "next/link";

interface DeadlineItem {
  id: string;
  project: string;
  client: string;
  dueDate: string;
  daysRemaining: number;
  urgency: "urgent" | "soon" | "healthy";
}

interface UpcomingDeadlinesCardProps {
  deadlines: DeadlineItem[];
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({ deadlines }) => {
  const displayDeadlines = deadlines && deadlines.length > 0 ? deadlines.slice(0, 3) : [];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
          Upcoming Deadlines
        </span>

        <Link
          href="/dashboard/projects"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>

      {/* Deadlines List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {displayDeadlines.length === 0 ? (
          <div style={{ padding: "8px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
            No upcoming deadlines.
          </div>
        ) : (
          displayDeadlines.map((item, idx) => (
            <div
              key={item.id ? `dl-${item.id}` : `dl-${idx}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11.5px",
              }}
            >
              <span
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 450,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
              >
                {item.project}
              </span>

              <span
                style={{
                  fontSize: "10.5px",
                  color: item.daysRemaining <= 3 ? "#f97316" : "var(--text-muted)",
                  fontWeight: 450,
                }}
              >
                {item.daysRemaining === 0 ? "Today" : `${item.daysRemaining}d left`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
