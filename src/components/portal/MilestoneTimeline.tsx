"use client";

import React from "react";
import { Check, Circle, Clock } from "lucide-react";
import type { ProjectMilestone } from "@/types/project";

interface MilestoneTimelineProps {
  milestones: ProjectMilestone[];
  currency?: string;
}

export function MilestoneTimeline({ milestones, currency = "INR" }: MilestoneTimelineProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--color-fog, #8a8f98)",
          fontSize: "13px",
        }}
      >
        No milestones defined for this project yet.
      </div>
    );
  }

  // Find first uncompleted milestone as the active/current one
  const activeIndex = milestones.findIndex((m) => !m.completed);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative" }}>
      {milestones.map((milestone, idx) => {
        const isCompleted = milestone.completed;
        const isCurrent = idx === (activeIndex === -1 ? milestones.length - 1 : activeIndex) && !isCompleted;
        const isLast = idx === milestones.length - 1;
        const stepNumber = String(idx + 1).padStart(2, "0");

        return (
          <div
            key={milestone.id || idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              position: "relative",
              paddingBottom: isLast ? "0" : "28px",
            }}
          >
            {/* Connecting Vertical Line */}
            {!isLast && (
              <div
                style={{
                  position: "absolute",
                  left: "17px",
                  top: "34px",
                  bottom: "0",
                  width: "2px",
                  background: isCompleted
                    ? "var(--color-pulse-green, #27a644)"
                    : "var(--color-graphite, #23252a)",
                }}
              />
            )}

            {/* Indicator Circle */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: isCompleted
                  ? "rgba(39, 166, 68, 0.15)"
                  : isCurrent
                  ? "rgba(39, 166, 68, 0.15)"
                  : "var(--color-obsidian, #161718)",
                border: isCompleted
                  ? "2px solid var(--color-pulse-green, #27a644)"
                  : isCurrent
                  ? "2px solid var(--color-pulse-green, #27a644)"
                  : "1px solid var(--color-graphite, #23252a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                zIndex: 2,
                boxShadow: isCurrent ? "0 0 12px rgba(39, 166, 68, 0.4)" : "none",
              }}
            >
              {isCompleted ? (
                <Check size={16} style={{ color: "var(--color-pulse-green, #27a644)" }} />
              ) : isCurrent ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--color-pulse-green, #27a644)",
                  }}
                >
                  {stepNumber}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-fog, #8a8f98)",
                  }}
                >
                  {stepNumber}
                </span>
              )}
            </div>

            {/* Content Card */}
            <div
              style={{
                flex: 1,
                background: isCurrent
                  ? "rgba(39, 166, 68, 0.04)"
                  : "var(--color-carbon, #0f1011)",
                border: isCurrent
                  ? "1px solid rgba(39, 166, 68, 0.3)"
                  : "1px solid var(--color-graphite, #23252a)",
                borderRadius: "10px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isCurrent
                        ? "#ffffff"
                        : "var(--color-bone, #e5e5e6)",
                      margin: 0,
                    }}
                  >
                    {milestone.title}
                  </h4>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--color-pulse-green, #27a644)",
                        background: "rgba(39, 166, 68, 0.15)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      In Progress
                    </span>
                  )}
                </div>
                {milestone.dueDate && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-fog, #8a8f98)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={12} />
                    <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div>
                {isCompleted ? (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-pulse-green, #27a644)",
                    }}
                  >
                    Completed ✓
                  </span>
                ) : isCurrent ? (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-pulse-green, #27a644)",
                    }}
                  >
                    Active Step
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ash, #62666d)",
                    }}
                  >
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
