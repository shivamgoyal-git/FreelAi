"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProjectItem {
  _id?: string;
  id?: string;
  title: string;
  clientName: string;
  progress: number;
  budget: number;
  paid: number;
  status: string;
  dueDate?: string;
  category?: string;
}

interface ActiveProjectsTableProps {
  projects: ProjectItem[];
  currencySymbol: string;
}

export const ActiveProjectsTable: React.FC<ActiveProjectsTableProps> = ({
  projects,
  currencySymbol = "$",
}) => {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  const displayProjects = projects && projects.length > 0 ? projects : [
    {
      id: "demo1",
      title: "Mobile App Redesign",
      clientName: "Acme Corp",
      progress: 65,
      budget: 85000,
      paid: 55000,
      status: "in_progress",
      dueDate: "May 18",
      category: "Design",
    },
    {
      id: "demo2",
      title: "API Integration",
      clientName: "TechNova",
      progress: 40,
      budget: 42000,
      paid: 20000,
      status: "in_progress",
      dueDate: "May 25",
      category: "Dev",
    },
    {
      id: "demo3",
      title: "Brand Guidelines Deck",
      clientName: "Nexus Labs",
      progress: 100,
      budget: 32000,
      paid: 32000,
      status: "completed",
      dueDate: "May 12",
      category: "Branding",
    },
  ];

  const filteredProjects = displayProjects.filter((p) => {
    if (filter === "in_progress") return p.status === "in_progress" || p.status === "active";
    if (filter === "completed") return p.status === "completed" || p.status === "paid";
    return true;
  });

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Header & Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Active Projects
        </span>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "2px", background: "var(--surface-2)", padding: "2px", borderRadius: "6px" }}>
          {(["all", "in_progress", "completed"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                fontWeight: filter === t ? 550 : 400,
                color: filter === t ? "var(--text-primary)" : "var(--text-muted)",
                background: filter === t ? "var(--surface-3)" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "in_progress" ? "In Progress" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500 }}>Project</th>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500 }}>Client</th>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500 }}>Progress</th>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500 }}>Budget</th>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500 }}>Due</th>
              <th style={{ padding: "6px 8px", color: "var(--text-muted)", fontWeight: 500, textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p, idx) => {
              const key = p._id ? String(p._id) : p.id ? String(p.id) : `project-${idx}`;
              const projectId = p._id ? String(p._id) : p.id ? String(p.id) : "";
              const isCompleted = p.status === "completed" || p.status === "paid";
              const formattedDue = p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "May 18";

              return (
                <tr
                  key={key}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Project Name */}
                  <td style={{ padding: "10px 8px", fontWeight: 500, color: "var(--text-primary)" }}>
                    <Link
                      href={projectId ? `/dashboard/projects/${projectId}` : "/dashboard/projects"}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {p.title}
                    </Link>
                  </td>

                  {/* Client */}
                  <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                    {p.clientName}
                  </td>

                  {/* Progress Bar */}
                  <td style={{ padding: "10px 8px", minWidth: "90px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ flex: 1, height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${p.progress || 0}%`,
                            height: "100%",
                            background: isCompleted ? "#4ade80" : "var(--color-brand)",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {p.progress || 0}%
                      </span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td style={{ padding: "10px 8px", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {currencySymbol}{(p.budget || 0).toLocaleString()}
                  </td>

                  {/* Due Date */}
                  <td style={{ padding: "10px 8px", color: "var(--text-muted)" }}>
                    {formattedDue}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: isCompleted ? "rgba(74, 222, 128, 0.1)" : "var(--surface-2)",
                        color: isCompleted ? "#4ade80" : "var(--text-secondary)",
                      }}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "2px" }}>
        <Link
          href="/dashboard/projects"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <span>All projects</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
};
