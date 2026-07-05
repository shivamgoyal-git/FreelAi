"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { IProposalIntelligence } from "@/lib/proposal-intelligence";

interface ProposalBarChartProps {
  intelligence: IProposalIntelligence;
  height?: number;
}

const DIM_LABELS: Record<string, string> = {
  professionalism: "Professional",
  personalization: "Personal",
  readability: "Readable",
  confidence: "Confidence",
  structure: "Structure",
  grammar: "Grammar",
  callToAction: "CTA",
  valueProp: "Value Prop",
  clientFocus: "Client Focus",
  pricingClarity: "Pricing",
  communicationStyle: "Comm. Style",
  completeness: "Completeness",
};

function scoreColor(score: number): string {
  if (score >= 85) return "#22863a";
  if (score >= 70) return "#6366F1";
  if (score >= 50) return "#B45309";
  return "#D93025";
}

export function ProposalBarChart({ intelligence, height = 260 }: ProposalBarChartProps) {
  const data = Object.entries(intelligence.sectionScores).map(([key, field]) => ({
    name: DIM_LABELS[key] ?? key,
    score: field.score,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
            formatter={(value) => [`${value}/100`, "Score"]}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={scoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
