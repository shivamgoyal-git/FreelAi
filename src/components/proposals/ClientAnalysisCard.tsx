"use client";

import type { IProposalIntelligence } from "@/lib/proposal-intelligence";
import { Brain, TrendingUp, AlertTriangle, Clock, DollarSign, Star, Zap } from "lucide-react";
import { ConfidenceBar } from "./ConfidenceBar";

interface ClientAnalysisCardProps {
  clientAnalysis: IProposalIntelligence["clientAnalysis"];
}

const URGENCY_COLOR: Record<string, string> = {
  Low: "var(--color-success)",
  Medium: "var(--color-brand)",
  High: "var(--color-danger)",
};

export function ClientAnalysisCard({ clientAnalysis }: ClientAnalysisCardProps) {
  const {
    communicationStyle,
    decisionDriver,
    urgency,
    budgetSensitivity,
    riskLevel,
    longTermPotential,
    expectedExperience,
    confidence,
  } = clientAnalysis;

  const traits = [
    { icon: <Zap size={13} />, label: "Communication", value: communicationStyle },
    { icon: <TrendingUp size={13} />, label: "Decision Driver", value: decisionDriver },
    { icon: <Clock size={13} />, label: "Urgency", value: urgency, color: URGENCY_COLOR[urgency] },
    { icon: <DollarSign size={13} />, label: "Budget Sensitivity", value: budgetSensitivity, color: URGENCY_COLOR[budgetSensitivity] },
    { icon: <AlertTriangle size={13} />, label: "Risk Level", value: riskLevel, color: URGENCY_COLOR[riskLevel] },
    { icon: <Star size={13} />, label: "Experience Expected", value: expectedExperience },
    { icon: <Brain size={13} />, label: "Long-term Potential", value: longTermPotential ? "Yes — strong fit" : "Short-term only", color: longTermPotential ? "var(--color-success)" : "var(--text-muted)" },
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--surface-2)",
        }}
      >
        <Brain size={14} color="var(--color-brand)" />
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
          Client Psychology
        </span>
      </div>

      {/* Traits */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {traits.map((trait) => (
          <div
            key={trait.label}
            style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
          >
            <span style={{ color: "var(--text-muted)", marginTop: "1px", flexShrink: 0 }}>
              {trait.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {trait.label}
              </span>
              <p
                style={{
                  fontSize: "12.5px",
                  color: trait.color ?? "var(--text-primary)",
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                {trait.value}
              </p>
            </div>
          </div>
        ))}

        {/* AI Confidence on psychographic reading */}
        <div style={{ paddingTop: "6px", borderTop: "0.5px solid var(--border)" }}>
          <ConfidenceBar confidence={confidence} label="Psychographic confidence" />
        </div>
      </div>
    </div>
  );
}
