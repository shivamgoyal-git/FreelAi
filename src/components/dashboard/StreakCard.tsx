"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StreakCardProps {
  days: number;
  activeDays?: boolean[];
}

export const StreakCard: React.FC<StreakCardProps> = ({
  days = 12,
  activeDays = [true, true, true, true, true, false, false],
}) => {
  const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Flame size={13} style={{ color: "var(--color-brand)" }} />
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
            {days} Day Streak
          </span>
        </div>
        <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>This week</span>
      </div>

      {/* Weekday indicator dots */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {WEEKDAYS.map((day, idx) => {
          const isActive = activeDays[idx] ?? false;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: isActive ? "var(--color-brand)" : "var(--surface-3)",
                  color: isActive ? "var(--color-on-brand)" : "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9.5px",
                  fontWeight: 600,
                }}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
