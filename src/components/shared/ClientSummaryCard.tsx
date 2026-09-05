import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Briefcase,
  FileText,
  DollarSign,
  Heart,
  Sparkles,
  Activity,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
}

interface ClientMetrics {
  activeProjects: number;
  outstandingInvoices: number;
  outstandingBalance: number;
  lifetimeRevenue: number;
  aiRelationshipScore: number;
  activities: Array<{ title: string; description: string; createdAt: string }>;
  insights: {
    trusted: boolean;
    paymentReliability: "High" | "Moderate" | "Low";
    proposalWinRate: string;
    relationshipHealth: string;
    riskIndicator: string;
    recommendedNextAction: string;
  };
}

export default function ClientSummaryCard({
  clientId,
  client,
}: {
  clientId: string;
  client: Client;
}) {
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/clients/${clientId}/metrics`);
        const data = await res.json();
        if (res.ok) {
          setMetrics(data.metrics);
        } else {
          throw new Error(data.error || "Failed to load metrics");
        }
      } catch (err) {
        console.error(err);
        setError("Could not load client relationship metrics.");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchMetrics();
    } else {
      setMetrics(null);
    }
  }, [clientId]);

  if (loading) {
    return (
      <div
        style={{
          padding: "10px 14px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Loader2
          size={14}
          className="loading-spinner"
          style={{ animation: "spin 1s linear infinite", color: "var(--color-brand)" }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Analyzing relationship insights for {client.name}...
        </span>
      </div>
    );
  }

  if (error || !metrics) return null;

  const initials = client.name.charAt(0).toUpperCase();
  const nextAction = metrics.insights?.recommendedNextAction || "Review client status and project scope.";

  return (
    <>
      {/* ── COMPACT INLINE INTELLIGENCE STRIP ── */}
      <div
        style={{
          padding: "10px 14px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(34, 197, 94, 0.04) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "var(--radius-inputs, 10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--color-brand, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} />
          </div>

          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  color: "var(--text-primary)",
                  letterSpacing: "0.01em",
                }}
              >
                AI Partner Insight
              </span>
              {metrics.insights.trusted && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--success, #22c55e)",
                    background: "rgba(34, 197, 94, 0.1)",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <ShieldCheck size={10} /> Trusted
                </span>
              )}
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  background: "var(--bg-elevated)",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                }}
              >
                Win Rate: {metrics.insights.proposalWinRate}
              </span>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "340px",
              }}
            >
              {nextAction}
            </p>
          </div>
        </div>

        {/* Action button to open full popup */}
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 11px",
            fontSize: "11.5px",
            fontWeight: 600,
            borderRadius: "7px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brand)";
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-elevated)";
          }}
        >
          <span>View Insights & Activity</span>
          <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* ── MODAL POPUP DIALOG FOR FULL DETAILS ── */}
      {showPopup &&
        mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(6px)",
              zIndex: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPopup(false);
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "560px",
                maxHeight: "88vh",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 14px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg-base)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {client.avatar ? (
                    <img
                      src={client.avatar}
                      alt={client.name}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "var(--color-brand, #6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3
                        className="font-heading"
                        style={{ fontSize: "16px", color: "var(--text-primary)", margin: 0 }}
                      >
                        {client.name}
                      </h3>
                      {metrics.insights.trusted && (
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "var(--success, #22c55e)",
                            background: "rgba(34, 197, 94, 0.1)",
                            padding: "2px 7px",
                            borderRadius: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <ShieldCheck size={11} /> Trusted
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {client.company ? `${client.company} • ` : ""}
                      {client.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "20px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* ── METRICS GRID ── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-base)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Active Projects
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Briefcase size={14} style={{ color: "var(--color-brand)" }} />
                      {metrics.activeProjects}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-base)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Owed Invoices
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FileText
                        size={14}
                        style={{
                          color: metrics.outstandingInvoices > 0 ? "var(--warning)" : "var(--text-muted)",
                        }}
                      />
                      {metrics.outstandingInvoices}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-base)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Lifetime Earned
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--success, #22c55e)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ${metrics.lifetimeRevenue.toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-base)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Score
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Heart size={14} style={{ color: "#ec4899" }} />
                      {metrics.aiRelationshipScore}%
                    </span>
                  </div>
                </div>

                {/* ── AI PARTNER INSIGHTS ── */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.04)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={15} style={{ color: "var(--color-brand, #6366f1)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 650, color: "var(--text-primary)" }}>
                      AI Partner Insights
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      background: "var(--bg-base)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block" }}>
                        Payment Reliability
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {metrics.insights.paymentReliability}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block" }}>
                        Proposal Win Rate
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {metrics.insights.proposalWinRate}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Action Card */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-elevated)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--color-brand, #6366f1)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      RECOMMENDED NEXT ACTION
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 550 }}>
                      {metrics.insights.recommendedNextAction}
                    </span>
                  </div>
                </div>

                {/* ── RECENT ACTIVITY TIMELINE ── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Activity size={14} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Recent Activity
                    </span>
                  </div>

                  {metrics.activities.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                      No recent activity logged for this client yet.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {metrics.activities.map((act, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "flex-start",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            background: "var(--bg-base)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "var(--success, #22c55e)",
                              marginTop: "5px",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                              {act.title}
                            </span>
                            {act.description && (
                              <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                {act.description}
                              </span>
                            )}
                            <span style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "4px" }}>
                              {new Date(act.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  background: "var(--bg-base)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    background: "var(--color-brand, #6366f1)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
