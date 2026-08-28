"use client";

import React from "react";
import Link from "next/link";

interface TimelineProject {
  id: string;
  title: string;
  clientName: string;
  progress: number;
  status: string;
  startDate: string;
  dueDate: string;
  priority: string;
  category: string;
}

interface ProjectTimelineCardProps {
  projects: TimelineProject[];
}

export const ProjectTimelineCard: React.FC<ProjectTimelineCardProps> = ({ projects }) => {
  const displayProjects = projects && projects.length > 0 ? projects.slice(0, 3) : [
    {
      id: "demo1",
      title: "Mobile App Redesign",
      clientName: "Acme Corp",
      progress: 65,
      status: "active",
      startDate: "2025-05-01",
      dueDate: "May 18",
      priority: "high",
      category: "Design",
    },
    {
      id: "demo2",
      title: "API Integration",
      clientName: "TechNova",
      progress: 40,
      status: "active",
      startDate: "2025-05-10",
      dueDate: "May 25",
      priority: "high",
      category: "Dev",
    },
    {
      id: "demo3",
      title: "QA + Launch",
      clientName: "Studio Pro",
      progress: 15,
      status: "active",
      startDate: "2025-05-18",
      dueDate: "May 30",
      priority: "medium",
      category: "Growth",
    },
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Timeline
        </span>

        <Link
          href="/dashboard/projects"
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>

      {/* Projects List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "space-around" }}>
        {displayProjects.map((p, idx) => (
          <div key={p.id ? `tl-${p.id}` : `tl-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                {p.title}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                {p.dueDate}
              </span>
            </div>

            {/* Clean Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: "var(--surface-3)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${p.progress}%`,
                    height: "100%",
                    background: "var(--color-brand)",
                    borderRadius: "2px",
                  }}
                />
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: "24px", textAlign: "right" }}>
                {p.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
