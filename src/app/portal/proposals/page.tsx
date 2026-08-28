"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/portal/EmptyState";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";

function ClientProposalsContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const url = previewClientId
        ? `/api/portal/proposals?previewClientId=${previewClientId}`
        : `/api/portal/proposals`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
        if (data.proposals?.length > 0 && !expandedId) {
          setExpandedId(data.proposals[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [previewClientId]);

  const handleAction = async (proposalId: string, action: "accept" | "decline" | "request_changes", feedbackText?: string) => {
    try {
      setProcessing(true);
      const res = await fetch(`/api/portal/proposals/${proposalId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          feedback: feedbackText,
          previewClientId,
        }),
      });

      if (res.ok) {
        setFeedbackModalOpen(false);
        setFeedback("");
        fetchProposals();
      }
    } catch (err) {
      console.error("Failed to respond to proposal:", err);
    } finally {
      setProcessing(false);
    }
  };

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
          Proposals & Scopes
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          Review project proposals, scopes of work, and pricing packages submitted by your freelancer.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <LoadingSkeleton height="180px" borderRadius="12px" />
          <LoadingSkeleton height="180px" borderRadius="12px" />
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon="file"
          title="No proposals available"
          description="Your freelancer has not sent any active proposals to your account yet."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {proposals.map((prop) => {
            const isExpanded = expandedId === prop._id;
            const isAccepted = prop.status === "won";
            const isDeclined = prop.status === "lost";
            const isPending = !isAccepted && !isDeclined;

            // Extract section content if proposal versions exist
            const latestVersion = prop.versions?.[prop.currentVersionIndex || 0];
            const sections = latestVersion?.sections;
            const pricing = latestVersion?.pricingBreakdown;

            return (
              <div
                key={prop._id}
                style={{
                  background: "var(--color-carbon, #0f1011)",
                  border: isAccepted
                    ? "1px solid rgba(39, 166, 68, 0.35)"
                    : "1px solid var(--color-graphite, #23252a)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Proposal Header */}
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                    background: "var(--color-obsidian, #161718)",
                    borderBottom: isExpanded ? "1px solid var(--color-graphite, #23252a)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "rgba(39, 166, 68, 0.15)",
                        border: "1px solid rgba(39, 166, 68, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-pulse-green, #27a644)",
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }}>
                          {prop.title}
                        </h3>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: isAccepted
                              ? "rgba(39, 166, 68, 0.15)"
                              : isDeclined
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(99, 102, 241, 0.15)",
                            color: isAccepted
                              ? "var(--color-pulse-green)"
                              : isDeclined
                              ? "#ef4444"
                              : "#818cf8",
                            textTransform: "uppercase",
                          }}
                        >
                          {isAccepted ? "Accepted" : isDeclined ? "Declined" : "Pending Review"}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--color-fog)" }}>
                        Submitted {new Date(prop.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {isPending && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(prop);
                            setFeedbackModalOpen(true);
                          }}
                          disabled={processing}
                        >
                          Request Changes
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAction(prop._id, "accept")}
                          disabled={processing}
                          style={{ minWidth: "120px" }}
                        >
                          <Check size={14} style={{ marginRight: "4px" }} />
                          Accept Proposal
                        </Button>
                      </>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prop._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-fog)",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Executive Summary */}
                    <div>
                      <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "8px" }}>
                        Executive Summary
                      </h4>
                      <p style={{ fontSize: "13.5px", color: "var(--color-bone)", lineHeight: 1.6, margin: 0 }}>
                        {sections?.executiveSummary || prop.jobDescription || "Summary for the requested project."}
                      </p>
                    </div>

                    {/* Scope of Work */}
                    {sections?.scopeOfWork && (
                      <div>
                        <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "8px" }}>
                          Scope of Work
                        </h4>
                        <div style={{ fontSize: "13.5px", color: "var(--color-bone)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          {sections.scopeOfWork}
                        </div>
                      </div>
                    )}

                    {/* Timeline & Milestones */}
                    {sections?.timelineAndMilestones && (
                      <div>
                        <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "8px" }}>
                          Timeline & Milestones
                        </h4>
                        <div style={{ fontSize: "13.5px", color: "var(--color-bone)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          {sections.timelineAndMilestones}
                        </div>
                      </div>
                    )}

                    {/* Pricing Breakdown Tiers if present */}
                    {pricing && (
                      <div>
                        <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-paper)", marginBottom: "12px" }}>
                          Pricing Options
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                          {Object.entries(pricing).map(([tierKey, tier]: [string, any]) => {
                            if (!tier || !tier.price) return null;
                            const isStandard = tierKey === "standard";
                            return (
                              <div
                                key={tierKey}
                                style={{
                                  background: isStandard ? "rgba(39, 166, 68, 0.06)" : "var(--color-obsidian)",
                                  border: isStandard ? "1px solid var(--color-pulse-green)" : "1px solid var(--color-graphite)",
                                  borderRadius: "10px",
                                  padding: "16px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                <div style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", color: isStandard ? "var(--color-pulse-green)" : "var(--color-fog)" }}>
                                  {tierKey}
                                </div>
                                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-paper)" }}>
                                  ${tier.price?.toLocaleString()}
                                </div>
                                <p style={{ fontSize: "12.5px", color: "var(--color-bone)", margin: 0 }}>
                                  {tier.description}
                                </p>
                                <span style={{ fontSize: "11px", color: "var(--color-fog)", marginTop: "4px" }}>
                                  Timeline: {tier.timeline}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal for Request Changes */}
      {feedbackModalOpen && selectedProposal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }}>
                Request Proposal Changes
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--color-fog)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--color-fog)", marginBottom: "12px" }}>
              Let your freelancer know what scope, timeline, or pricing terms you&apos;d like adjusted.
            </p>

            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Can we adjust the scope to 3 milestone phases?"
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px",
                color: "var(--color-paper)",
                fontSize: "13px",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button variant="secondary" size="sm" onClick={() => setFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction(selectedProposal._id, "request_changes", feedback)}
                disabled={processing || !feedback.trim()}
              >
                {processing ? "Sending..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientProposalsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="180px" borderRadius="12px" />}>
      <ClientProposalsContent />
    </Suspense>
  );
}
