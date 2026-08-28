"use client";

import React from "react";
import { DollarSign, Briefcase, Clock, Send, Target } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";

interface KpiData {
  revenue: {
    value: number;
    trend: string;
    sparkline: number[];
  };
  activeProjects: {
    value: number;
    trend: string;
    sparkline: number[];
  };
  pendingInvoices: {
    count: number;
    amount: number;
    sparkline: number[];
  };
  proposalsSent: {
    value: number;
    trend: string;
    sparkline: number[];
  };
  aiScore: {
    score: number;
    proposalsCreated: number;
  };
}

interface KpiCardsRowProps {
  kpi: KpiData;
  currencySymbol: string;
}

function generateSparklinePath(points: number[], width = 64, height = 22) {
  if (!points || points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${coords.join(" L ")}`;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({ kpi, currencySymbol = "$" }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "10px",
      }}
    >
      {/* 1. Total Revenue */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
            Total Revenue
          </span>
          <DollarSign size={13} style={{ color: "var(--text-muted)" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          {currencySymbol}
          <CountUp value={kpi.revenue.value} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", color: "var(--color-brand)", fontWeight: 500 }}>
            {kpi.revenue.trend}
          </span>
          <svg width="64" height="22" style={{ overflow: "visible" }}>
            <path
              d={generateSparklinePath(kpi.revenue.sparkline)}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Active Projects */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
            Active Projects
          </span>
          <Briefcase size={13} style={{ color: "var(--text-muted)" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          <CountUp value={kpi.activeProjects.value} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", color: "var(--color-brand)", fontWeight: 500 }}>
            {kpi.activeProjects.trend}
          </span>
          <svg width="64" height="22" style={{ overflow: "visible" }}>
            <path
              d={generateSparklinePath(kpi.activeProjects.sparkline)}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Pending Invoices */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
            Pending Invoices
          </span>
          <Clock size={13} style={{ color: "var(--text-muted)" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          <CountUp value={kpi.pendingInvoices.count} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", color: "var(--text-secondary)", fontWeight: 450 }}>
            {currencySymbol}{Number(kpi.pendingInvoices?.amount || 0).toLocaleString()}
          </span>
          <svg width="64" height="22" style={{ overflow: "visible" }}>
            <path
              d={generateSparklinePath(kpi.pendingInvoices.sparkline)}
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 4. Proposals Sent */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
            Proposals Sent
          </span>
          <Send size={13} style={{ color: "var(--text-muted)" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          <CountUp value={kpi.proposalsSent.value} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", color: "var(--color-brand)", fontWeight: 500 }}>
            {kpi.proposalsSent.trend}
          </span>
          <svg width="64" height="22" style={{ overflow: "visible" }}>
            <path
              d={generateSparklinePath(kpi.proposalsSent.sparkline)}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 5. AI Proposal Score */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
            AI Win Rate
          </span>
          <Target size={13} style={{ color: "var(--text-muted)" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          <CountUp value={kpi.aiScore.score} suffix="%" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
            {kpi.aiScore.proposalsCreated} created
          </span>
          <div style={{ width: "36px", height: "3px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${kpi.aiScore.score}%`, height: "100%", background: "var(--color-brand)" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
