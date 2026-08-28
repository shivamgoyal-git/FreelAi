"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderGit2,
  FileCheck,
  Receipt,
  Clock,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AttentionCard } from "@/components/portal/AttentionCard";
import { DashboardSkeleton } from "@/components/portal/LoadingSkeleton";
import { EmptyState } from "@/components/portal/EmptyState";
import type { ClientPortalOverview } from "@/types/portal";

function ClientPortalDashboardContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [data, setData] = useState<ClientPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const url = previewClientId
          ? `/api/portal/overview?previewClientId=${previewClientId}`
          : `/api/portal/overview`;
        const res = await fetch(url);
        if (res.ok) {
          const overviewData = await res.json();
          setData(overviewData);
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to load dashboard");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [previewClientId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px 0" }}>
        <EmptyState
          icon="alert"
          title="Could not load portal"
          description={error || "Please verify your credentials or contact your freelancer."}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Welcome Header */}
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
          Welcome back, {data.client.name}
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-fog, #8a8f98)",
            margin: 0,
          }}
        >
          Here&apos;s the latest update on your projects with {data.freelancer.name}.
        </p>
      </div>

      {/* Attention / Action Card */}
      <AttentionCard items={data.attentionItems} />

      {/* 4 Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "12px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-fog)", textTransform: "uppercase" }}>
              Active Projects
            </span>
            <FolderGit2 size={16} style={{ color: "var(--color-pulse-green, #27a644)" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-paper)" }}>
            {data.stats.activeProjects}
          </div>
        </div>

        <div
          style={{
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "12px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-fog)", textTransform: "uppercase" }}>
              Pending Approvals
            </span>
            <FileCheck size={16} style={{ color: data.stats.pendingApprovals > 0 ? "#fbbf24" : "var(--color-pulse-green)" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: data.stats.pendingApprovals > 0 ? "#fbbf24" : "var(--color-paper)" }}>
            {data.stats.pendingApprovals}
          </div>
        </div>

        <div
          style={{
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "12px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-fog)", textTransform: "uppercase" }}>
              Outstanding
            </span>
            <Receipt size={16} style={{ color: data.stats.outstandingAmount > 0 ? "#fbbf24" : "var(--color-pulse-green)" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-paper)" }}>
            {data.stats.currency} {data.stats.outstandingAmount.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "12px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-fog)", textTransform: "uppercase" }}>
              Upcoming Deadlines
            </span>
            <Clock size={16} style={{ color: "var(--color-pulse-green, #27a644)" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-paper)" }}>
            {data.stats.upcomingDeadlines}
          </div>
        </div>
      </div>

      {/* Main Layout: Projects & Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Active Projects Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--color-paper, #ffffff)",
                margin: 0,
              }}
            >
              Active Projects
            </h2>
            <Link
              href={`/portal/projects${
                previewClientId ? `?previewClientId=${previewClientId}` : ""
              }`}
              style={{
                fontSize: "13px",
                color: "var(--color-pulse-green, #27a644)",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {data.projects.length === 0 ? (
            <EmptyState
              icon="folder"
              title="No active projects yet"
              description="Your freelancer has not assigned any projects to your portal account yet."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {data.projects.map((p) => (
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
                    transition: "all 0.15s ease",
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
                          fontSize: "15px",
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
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background:
                            p.status === "active"
                              ? "rgba(39, 166, 68, 0.15)"
                              : "var(--color-obsidian, #161718)",
                          color:
                            p.status === "active"
                              ? "var(--color-pulse-green, #27a644)"
                              : "var(--color-fog, #8a8f98)",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-fog, #8a8f98)",
                        marginBottom: "14px",
                      }}
                    >
                      Milestone:{" "}
                      <span style={{ color: "var(--color-bone, #e5e5e6)", fontWeight: 500 }}>
                        {p.currentMilestone}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "var(--color-fog, #8a8f98)",
                          marginBottom: "6px",
                        }}
                      >
                        <span>Progress</span>
                        <span style={{ color: "var(--color-bone)", fontWeight: 600 }}>
                          {p.progress}%
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
                            width: `${p.progress}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background: "var(--color-pulse-green, #27a644)",
                            boxShadow: "0 0 8px rgba(39, 166, 68, 0.5)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-graphite, #23252a)",
                    }}
                  >
                    {p.dueDate ? (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--color-fog, #8a8f98)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Calendar size={13} />
                        <span>Due {new Date(p.dueDate).toLocaleDateString()}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--color-ash)" }}>Ongoing</span>
                    )}

                    <Link
                      href={`/portal/projects/${p._id}${
                        previewClientId ? `?previewClientId=${previewClientId}` : ""
                      }`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="secondary" size="sm" style={{ padding: "4px 12px", fontSize: "12px" }}>
                        <span>View Project</span>
                        <ArrowRight size={12} style={{ marginLeft: "4px" }} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h2
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--color-paper, #ffffff)",
              marginBottom: "16px",
            }}
          >
            Recent Activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "12px",
                color: "var(--color-fog, #8a8f98)",
                fontSize: "13px",
              }}
            >
              No activity logged yet.
            </div>
          ) : (
            <div
              style={{
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {data.recentActivity.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderBottom: "1px solid var(--color-obsidian, #161718)",
                    paddingBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-pulse-green, #27a644)",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "var(--color-paper, #ffffff)",
                        marginBottom: "2px",
                      }}
                    >
                      {act.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "var(--color-fog, #8a8f98)",
                        marginBottom: "4px",
                      }}
                    >
                      {act.description}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--color-ash, #62666d)",
                      }}
                    >
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientPortalDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ClientPortalDashboardContent />
    </Suspense>
  );
}
