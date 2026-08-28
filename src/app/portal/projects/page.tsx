"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderGit2,
  Search,
  Calendar,
  ArrowRight,
  Clock,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/portal/EmptyState";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";

function ClientProjectsContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const url = `/api/portal/projects?status=${filter}&q=${encodeURIComponent(search)}${
        previewClientId ? `&previewClientId=${previewClientId}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, search, previewClientId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-paper, #ffffff)",
            letterSpacing: "-0.5px",
            margin: "0 0 4px 0",
          }}
        >
          Projects
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          Manage and track the progress of all your active and completed projects.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "all", label: "All Projects" },
            { id: "active", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: filter === tab.id ? 600 : 500,
                background:
                  filter === tab.id
                    ? "var(--color-obsidian, #161718)"
                    : "transparent",
                border:
                  filter === tab.id
                    ? "1px solid var(--color-graphite, #23252a)"
                    : "1px solid transparent",
                color:
                  filter === tab.id
                    ? "var(--color-pulse-green, #27a644)"
                    : "var(--color-fog, #8a8f98)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--color-obsidian, #161718)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "8px",
            padding: "7px 12px",
            minWidth: "240px",
          }}
        >
          <Search size={14} style={{ color: "var(--color-fog, #8a8f98)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-paper, #ffffff)",
              fontSize: "13px",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          <LoadingSkeleton height="240px" borderRadius="12px" />
          <LoadingSkeleton height="240px" borderRadius="12px" />
          <LoadingSkeleton height="240px" borderRadius="12px" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No projects found"
          description="There are no projects matching your filter or search query."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((p) => (
            <div
              key={p._id}
              style={{
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--color-paper, #ffffff)",
                      margin: 0,
                    }}
                  >
                    {p.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background:
                        p.status === "completed"
                          ? "rgba(39, 166, 68, 0.15)"
                          : p.status === "active"
                          ? "rgba(39, 166, 68, 0.15)"
                          : "var(--color-obsidian, #161718)",
                      color:
                        p.status === "completed" || p.status === "active"
                          ? "var(--color-pulse-green, #27a644)"
                          : "var(--color-fog, #8a8f98)",
                    }}
                  >
                    {p.status}
                  </span>
                </div>

                {p.description && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--color-fog, #8a8f98)",
                      lineHeight: 1.4,
                      marginBottom: "14px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                )}

                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--color-fog, #8a8f98)",
                    marginBottom: "14px",
                  }}
                >
                  Current Milestone:{" "}
                  <span style={{ color: "var(--color-bone)", fontWeight: 500 }}>
                    {p.currentMilestone}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "var(--color-fog)",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Overall Progress</span>
                    <span style={{ color: "var(--color-bone)", fontWeight: 600 }}>
                      {p.progress || 0}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      borderRadius: "999px",
                      background: "var(--color-obsidian, #161718)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${p.progress || 0}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background: "var(--color-pulse-green, #27a644)",
                        boxShadow: "0 0 8px rgba(39, 166, 68, 0.5)",
                      }}
                    />
                  </div>
                </div>

                {/* Badges / alerts */}
                {p.pendingDeliverablesCount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      background: "rgba(234, 179, 8, 0.1)",
                      border: "1px solid rgba(234, 179, 8, 0.25)",
                      color: "#fbbf24",
                      fontSize: "12px",
                      fontWeight: 500,
                      marginBottom: "10px",
                    }}
                  >
                    <FileCheck size={13} />
                    <span>{p.pendingDeliverablesCount} deliverable awaiting review</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--color-graphite, #23252a)",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-ash)", display: "block" }}>
                    Budget
                  </span>
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)" }}>
                    {p.currency || "INR"} {p.budget?.toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/portal/projects/${p._id}${previewClientId ? `?previewClientId=${previewClientId}` : ""}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="secondary" size="sm">
                    <span>View Project</span>
                    <ArrowRight size={13} style={{ marginLeft: "4px" }} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientProjectsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="240px" borderRadius="12px" />}>
      <ClientProjectsContent />
    </Suspense>
  );
}
