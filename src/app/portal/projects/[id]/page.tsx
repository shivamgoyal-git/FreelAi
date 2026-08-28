"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  FolderGit2,
  Calendar,
  MessageSquare,
  FileCheck,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeliverableCard } from "@/components/portal/DeliverableCard";
import { MilestoneTimeline } from "@/components/portal/MilestoneTimeline";
import { MessageThread } from "@/components/portal/MessageThread";
import { FileList } from "@/components/portal/FileList";
import { InvoicePaymentModal } from "@/components/portal/InvoicePaymentModal";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";
import { EmptyState } from "@/components/portal/EmptyState";
import type { Deliverable } from "@/types/portal";

function ClientProjectWorkspaceContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const url = `/api/portal/projects/${id}${
        previewClientId ? `?previewClientId=${previewClientId}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjectData(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Project not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, previewClientId]);

  // Handle deliverable actions
  const handleApproveDeliverable = async (deliverableId: string) => {
    const res = await fetch(`/api/portal/deliverables/${deliverableId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", previewClientId }),
    });
    if (res.ok) {
      fetchProject();
    }
  };

  const handleRequestChanges = async (deliverableId: string, feedback: string) => {
    const res = await fetch(`/api/portal/deliverables/${deliverableId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request_changes", feedback, previewClientId }),
    });
    if (res.ok) {
      fetchProject();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <LoadingSkeleton height="140px" borderRadius="12px" />
        <LoadingSkeleton height="400px" borderRadius="12px" />
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div style={{ padding: "40px 0" }}>
        <EmptyState
          icon="alert"
          title="Project not accessible"
          description={error || "You do not have permission to view this project."}
          actionLabel="Back to Projects"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const { project, client, freelancer, deliverables, files, messages, invoices, activities } =
    projectData;

  const tabs = [
    { id: "overview", label: "Overview", count: null },
    { id: "milestones", label: "Milestones", count: project.milestones?.length || null },
    {
      id: "deliverables",
      label: "Deliverables",
      count: deliverables.length || null,
      highlight: deliverables.some((d: any) => d.status === "pending_review"),
    },
    { id: "files", label: "Files", count: files.length || null },
    { id: "messages", label: "Messages", count: null },
    { id: "invoices", label: "Invoices", count: invoices.length || null },
    { id: "activity", label: "Activity", count: activities.length || null },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href={`/portal/projects${previewClientId ? `?previewClientId=${previewClientId}` : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-fog, #8a8f98)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to Projects</span>
        </Link>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveTab("messages")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <MessageSquare size={14} />
          <span>Message Freelancer</span>
        </Button>
      </div>

      {/* Project Header Workspace Box */}
      <div
        style={{
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--color-paper, #ffffff)",
                  margin: 0,
                }}
              >
                {project.title}
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background:
                    project.status === "active"
                      ? "rgba(39, 166, 68, 0.15)"
                      : "var(--color-obsidian, #161718)",
                  color:
                    project.status === "active"
                      ? "var(--color-pulse-green, #27a644)"
                      : "var(--color-fog, #8a8f98)",
                }}
              >
                {project.status}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
              {client.name} {client.company ? `(${client.company})` : ""} • Project with {freelancer.name}
            </p>
          </div>
        </div>

        {/* Project Key Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--color-graphite, #23252a)",
          }}
        >
          <div>
            <span style={{ fontSize: "11.5px", color: "var(--color-fog)", textTransform: "uppercase" }}>
              Progress
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }}>
                {project.progress || 0}%
              </span>
              <div
                style={{
                  flex: 1,
                  height: "5px",
                  borderRadius: "999px",
                  background: "var(--color-obsidian)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${project.progress || 0}%`,
                    height: "100%",
                    background: "var(--color-pulse-green)",
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "11.5px", color: "var(--color-fog)", textTransform: "uppercase" }}>
              Budget
            </span>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-paper)", marginTop: "2px" }}>
              {project.currency || "INR"} {project.budget?.toLocaleString()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "11.5px", color: "var(--color-fog)", textTransform: "uppercase" }}>
              Paid to Date
            </span>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-pulse-green, #27a644)", marginTop: "2px" }}>
              {project.currency || "INR"} {project.paid?.toLocaleString() || "0"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "11.5px", color: "var(--color-fog)", textTransform: "uppercase" }}>
              Target Deadline
            </span>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-bone)", marginTop: "3px" }}>
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "Ongoing"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-graphite, #23252a)",
          gap: "4px",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                fontSize: "13.5px",
                fontWeight: active ? 600 : 500,
                color: active
                  ? "var(--color-pulse-green, #27a644)"
                  : "var(--color-fog, #8a8f98)",
                background: "transparent",
                border: "none",
                borderBottom: active
                  ? "2px solid var(--color-pulse-green, #27a644)"
                  : "2px solid transparent",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              {tab.highlight ? (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    background: "rgba(234, 179, 8, 0.15)",
                    color: "#fbbf24",
                    padding: "1px 6px",
                    borderRadius: "999px",
                  }}
                >
                  Review
                </span>
              ) : tab.count !== null ? (
                <span
                  style={{
                    fontSize: "11px",
                    color: active ? "var(--color-pulse-green)" : "var(--color-ash)",
                    background: "var(--color-obsidian)",
                    padding: "1px 6px",
                    borderRadius: "999px",
                  }}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Description */}
              {project.description && (
                <div
                  style={{
                    background: "var(--color-carbon, #0f1011)",
                    border: "1px solid var(--color-graphite, #23252a)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "8px" }}>
                    Project Description
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "var(--color-bone)", lineHeight: 1.6, margin: 0 }}>
                    {project.description}
                  </p>
                </div>
              )}

              {/* Milestones Snapshot */}
              <div
                style={{
                  background: "var(--color-carbon, #0f1011)",
                  border: "1px solid var(--color-graphite, #23252a)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }}>
                    Milestone Progress
                  </h3>
                  <button
                    onClick={() => setActiveTab("milestones")}
                    style={{ background: "transparent", border: "none", color: "var(--color-pulse-green)", fontSize: "12.5px", cursor: "pointer", fontWeight: 500 }}
                  >
                    View All
                  </button>
                </div>
                <MilestoneTimeline milestones={project.milestones || []} currency={project.currency} />
              </div>
            </div>

            {/* Right Column: Freelancer Info & Deliverables Snapshot */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  background: "var(--color-carbon, #0f1011)",
                  border: "1px solid var(--color-graphite, #23252a)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "14px" }}>
                  Assigned Freelancer
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #27a644 0%, #166534 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 600,
                    }}
                  >
                    {freelancer.name[0]?.toUpperCase() || "F"}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-bone)" }}>
                      {freelancer.name}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--color-fog)" }}>{freelancer.email}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("messages")}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <MessageSquare size={13} style={{ marginRight: "6px" }} />
                  <span>Send Message</span>
                </Button>
              </div>

              {/* Outstanding Invoices Alert if any */}
              {invoices.some((i: any) => i.status === "sent" || i.status === "partially_paid") && (
                <div
                  style={{
                    background: "rgba(234, 179, 8, 0.08)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", marginBottom: "6px" }}>
                    <Receipt size={16} />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Payment Due</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-bone)", margin: "0 0 12px 0" }}>
                    There is an outstanding invoice awaiting payment for this project.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab("invoices")}
                    style={{ width: "100%", justifyContent: "center", fontSize: "12px" }}
                  >
                    View Invoices
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === "milestones" && (
          <div
            style={{
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <MilestoneTimeline milestones={project.milestones || []} currency={project.currency} />
          </div>
        )}

        {/* DELIVERABLES TAB */}
        {activeTab === "deliverables" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {deliverables.length === 0 ? (
              <EmptyState
                icon="file"
                title="No deliverables uploaded yet"
                description="Your freelancer will upload deliverables and work previews here for your review and approval."
              />
            ) : (
              deliverables.map((d: Deliverable) => (
                <DeliverableCard
                  key={d._id}
                  deliverable={d}
                  onApprove={handleApproveDeliverable}
                  onRequestChanges={handleRequestChanges}
                />
              ))
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === "files" && (
          <FileList
            files={files}
            projectId={project._id}
            onFileUploaded={fetchProject}
            previewClientId={previewClientId}
          />
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <MessageThread
            key={`${project._id}-${previewClientId || ""}`}
            projectId={project._id}
            projectName={project.title}
            freelancerName={freelancer.name}
            freelancerAvatar={freelancer.avatar}
            clientName={client.name}
            clientAvatar={client.avatar}
            initialMessages={messages}
            previewClientId={previewClientId}
          />
        )}

        {/* INVOICES TAB */}
        {activeTab === "invoices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {invoices.length === 0 ? (
              <EmptyState
                icon="file"
                title="No invoices for this project"
                description="Invoices issued for this project will appear here."
              />
            ) : (
              invoices.map((inv: any) => {
                const isPaid = inv.status === "paid";
                const isPending = inv.status === "sent" || inv.status === "partially_paid" || inv.status === "overdue";
                return (
                  <div
                    key={inv._id}
                    style={{
                      background: "var(--color-carbon, #0f1011)",
                      border: "1px solid var(--color-graphite, #23252a)",
                      borderRadius: "12px",
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }}>
                          Invoice #{inv.invoiceNumber}
                        </h4>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: isPaid ? "rgba(39, 166, 68, 0.15)" : "rgba(234, 179, 8, 0.15)",
                            color: isPaid ? "var(--color-pulse-green, #27a644)" : "#fbbf24",
                            textTransform: "uppercase",
                          }}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <span style={{ fontSize: "12.5px", color: "var(--color-fog)" }}>
                        Due {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "var(--color-ash)", display: "block" }}>Amount</span>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }}>
                          {inv.currency || "INR"} {inv.total?.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link href={`/portal/invoices/${inv._id}`} style={{ textDecoration: "none" }}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        {isPending && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div
            style={{
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {activities.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-fog)", padding: "24px" }}>
                No activity records found for this project.
              </div>
            ) : (
              activities.map((a: any) => (
                <div
                  key={a._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderBottom: "1px solid var(--color-obsidian)",
                    paddingBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-pulse-green)",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "2px" }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--color-fog)", marginBottom: "4px" }}>
                      {a.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-ash)" }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <InvoicePaymentModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          onPaymentSuccess={fetchProject}
          previewClientId={previewClientId}
        />
      )}
    </div>
  );
}

export default function ClientProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <LoadingSkeleton height="140px" borderRadius="12px" />
          <LoadingSkeleton height="400px" borderRadius="12px" />
        </div>
      }
    >
      <ClientProjectWorkspaceContent id={id} />
    </Suspense>
  );
}
