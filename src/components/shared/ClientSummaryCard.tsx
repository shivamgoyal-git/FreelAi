import React, { useState, useEffect } from "react";
import { Loader2, Briefcase, FileText, DollarSign, Heart, Sparkles, Activity, ShieldCheck, HelpCircle } from "lucide-react";

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

export default function ClientSummaryCard({ clientId, client }: { clientId: string; client: Client }) {
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          padding: "20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginTop: "12px",
        }}
      >
        <Loader2 size={16} className="loading-spinner" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Analyzing client relationship...</span>
      </div>
    );
  }

  if (error || !metrics) return null;

  const initials = client.name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        marginTop: "16px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── CLIENT DETAILS HEADER ── */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {client.avatar ? (
          <img
            src={client.avatar}
            alt={client.name}
            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "var(--primary-dim)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>
            {client.name}
          </h4>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {client.company ? `${client.company} • ` : ""}
            {client.email}
            {client.phone ? ` • ${client.phone}` : ""}
          </p>
        </div>
        {metrics.insights.trusted && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "20px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              color: "var(--primary)",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={12} />
            <span>Trusted</span>
          </div>
        )}
      </div>

      {/* ── METRICS GRID & HIGHLIGHTS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          background: "rgba(255, 255, 255, 0.01)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em" }}>Active Projects</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Briefcase size={16} style={{ color: "var(--primary)" }} /> {metrics.activeProjects}
          </span>
        </div>

        <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em" }}>Owed Invoices</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <FileText size={16} style={{ color: metrics.outstandingInvoices > 0 ? "var(--warning)" : "var(--text-muted)" }} />
            {metrics.outstandingInvoices}
            {metrics.outstandingBalance > 0 && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                (${metrics.outstandingBalance.toLocaleString()})
              </span>
            )}
          </span>
        </div>

        <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em" }}>Lifetime Revenue</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
            <DollarSign size={16} /> {metrics.lifetimeRevenue.toLocaleString()}
          </span>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em" }}>Relationship score</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Heart size={16} style={{ color: "var(--color-brand)" }} /> {metrics.aiRelationshipScore}%
          </span>
        </div>
      </div>

      {/* ── AI CO-PILOT ASSISTANT INSIGHTS ── */}
      <div
        style={{
          padding: "16px 20px",
          background: "rgba(99, 102, 241, 0.03)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={14} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>AI Partner Insights</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Payment Reliability</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>{metrics.insights.paymentReliability}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Proposal Win Rate</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>{metrics.insights.proposalWinRate}</span>
          </div>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: "var(--radius)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginTop: "4px",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Recommended Next Action</span>
          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
            {metrics.insights.recommendedNextAction}
          </span>
        </div>
      </div>

      {/* ── RECENT ACTIVITY TIMELINE ── */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Activity size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Recent Activity</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {metrics.activities.map((act, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "3px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} />
                {index !== metrics.activities.length - 1 && (
                  <div style={{ width: "1px", height: "24px", background: "var(--border)", margin: "4px 0" }} />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>{act.title}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{act.description}</span>
                <span style={{ fontSize: "10px", color: "var(--text-subtle)", marginTop: "2px" }}>
                  {new Date(act.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
